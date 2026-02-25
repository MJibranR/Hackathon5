import os
import asyncio
import logging
import time
from typing import Any, Dict
from uuid import UUID

import asyncpg
from dotenv import load_dotenv

load_dotenv()

from api.kafka_client import FTEKafkaProducer, FTEKafkaConsumer, TOPICS
from agent.customer_success_agent import NovaAgent
from database import queries

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("MessageProcessor")

DB_DSN = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_0TAqIO1bLzPW@ep-autumn-salad-aijqbop7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

class UnifiedMessageProcessor:
    def __init__(self, db_pool: asyncpg.Pool, producer: FTEKafkaProducer):
        self.pool = db_pool
        self.producer = producer
        self.agent = NovaAgent(db_pool)

    async def process_message(self, message: Dict[str, Any]):
        start_time = time.time()
        channel = message.get("channel")
        logger.info(f"Processing {channel} message...")

        try:
            # 1. Resolve Customer
            customer_id = await queries.resolve_customer(
                self.pool, 
                message.get("customer_email"), 
                message.get("customer_phone"),
                message.get("customer_name") or message.get("metadata", {}).get("name", "Unknown")
            )
            
            # 2. Get/Create Conversation
            conv_id = await queries.get_or_create_conversation(self.pool, customer_id, channel)
            
            # 3. Store Inbound Message
            await queries.store_message(
                self.pool, conv_id, channel, "inbound", "customer", 
                message['content'], message.get('channel_message_id')
            )
            
            # 4. Run AI Agent
            agent_result = await self.agent.process_message(
                customer_id=customer_id,
                message=message['content'],
                channel=channel
            )
            
            # 5. Extract results
            sentiment_score = agent_result.get("sentiment", 0.5)
            is_escalated = agent_result.get("escalated", False)
            delivery_status = agent_result.get("delivery_status", "unknown")

            # Update conversation sentiment in DB
            await queries.update_conversation_metrics(self.pool, conv_id, sentiment_score)

            # 6. Publish Metrics
            latency_ms = int((time.time() - start_time) * 1000)
            await self.producer.publish(TOPICS["METRICS"], {
                "conversation_id": str(conv_id),
                "channel": channel,
                "latency_ms": latency_ms,
                "sentiment_score": sentiment_score,
                "is_escalated": is_escalated,
                "status": "success",
                "delivery_status": delivery_status
            })
            
            logger.info(f"Successfully processed {channel} message in {latency_ms}ms (Sentiment: {sentiment_score}, Delivery: {delivery_status})")

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Error processing message: {e}")
            await self.handle_error(message, e, latency_ms)

    async def handle_error(self, message: Dict[str, Any], error: Exception, latency_ms: int):
        try:
            await self.producer.publish(TOPICS["DLQ"], {
                "original_message": message,
                "error": str(error),
                "latency_ms": latency_ms
            })
        except Exception as kafka_err:
            logger.critical(f"Failed to handle error via Kafka: {kafka_err}")

async def main():
    producer = FTEKafkaProducer()
    await producer.start()
    
    # Enable SSL for serverless providers
    pool = await asyncpg.create_pool(
        DB_DSN,
        ssl="require" if "localhost" not in DB_DSN and "127.0.0.1" not in DB_DSN else None
    )
    
    processor = UnifiedMessageProcessor(pool, producer)
    
    consumer = FTEKafkaConsumer(
        topics=[TOPICS["INCOMING_TICKETS"]],
        group_id="message-processor-group"
    )
    
    logger.info("Starting Message Processor Worker...")
    try:
        await consumer.consume(processor.process_message)
    finally:
        await producer.stop()
        await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
