import asyncio
import logging
import os
import json
from uuid import UUID
import asyncpg
from dotenv import load_dotenv

load_dotenv()

from api.kafka_client import FTEKafkaConsumer, TOPICS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MetricsCollector")

DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/novasaas")

class MetricsCollector:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def handle_metric(self, metric_data: dict):
        """Processes performance and interaction metrics."""
        logger.info(f"Received metric: {metric_data}")
        
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(
                    """INSERT INTO agent_metrics (conversation_id, channel, response_time_seconds, sentiment_score)
                       VALUES ($1, $2, $3, $4)""",
                    UUID(metric_data.get("conversation_id")) if metric_data.get("conversation_id") else None,
                    metric_data.get("channel"),
                    metric_data.get("latency_ms", 0) / 1000.0,
                    metric_data.get("sentiment_score")
                )
        except Exception as e:
            logger.error(f"Failed to store metric: {e}")

async def main():
    # Enable SSL for serverless providers
    pool = await asyncpg.create_pool(
        DB_DSN,
        ssl="require" if "localhost" not in DB_DSN and "127.0.0.1" not in DB_DSN else None
    )
    collector = MetricsCollector(pool)
    
    consumer = FTEKafkaConsumer(
        topics=[TOPICS["METRICS"]],
        group_id="metrics-collector-group"
    )
    
    logger.info("Starting Metrics Collector...")
    try:
        await consumer.consume(collector.handle_metric)
    finally:
        await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
