import json
import logging
from datetime import datetime
from typing import Any, Dict, Callable, Awaitable
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import os
import ssl

# Configure structured-like logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("KafkaClient")

TOPICS = {
    "INCOMING_TICKETS": "fte.tickets.incoming",
    "EMAIL_INBOUND": "fte.channels.email.inbound",
    "WHATSAPP_INBOUND": "fte.channels.whatsapp.inbound",
    "WEBFORM_INBOUND": "fte.channels.webform.inbound",
    "ESCALATIONS": "fte.escalations",
    "METRICS": "fte.metrics",
    "DLQ": "fte.dlq"
}

class FTEKafkaProducer:
    def __init__(self, bootstrap_servers: str = None):
        self.bootstrap_servers = bootstrap_servers or os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.security_protocol = os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT")
        self.ssl_cafile = os.getenv("KAFKA_SSL_CAFILE")
        self.ssl_certfile = os.getenv("KAFKA_SSL_CERTFILE")
        self.ssl_keyfile = os.getenv("KAFKA_SSL_KEYFILE")
        self.username = os.getenv("KAFKA_USERNAME")
        self.password = os.getenv("KAFKA_PASSWORD")
        self.producer = None

    async def start(self):
        kwargs = {
            "bootstrap_servers": self.bootstrap_servers,
            "value_serializer": lambda v: json.dumps(v).encode('utf-8')
        }
        
        if self.security_protocol == "SSL":
            if not all([self.ssl_cafile, self.ssl_certfile, self.ssl_keyfile]):
                raise ValueError("KAFKA_SECURITY_PROTOCOL=SSL requires CA, Cert, and Key files in .env")
            
            context = ssl.create_default_context(cafile=self.ssl_cafile)
            context.load_cert_chain(certfile=self.ssl_certfile, keyfile=self.ssl_keyfile)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_REQUIRED
            kwargs.update({
                "security_protocol": "SSL",
                "ssl_context": context,
            })
        elif self.security_protocol == "SASL_SSL":
            kwargs.update({
                "security_protocol": "SASL_SSL",
                "sasl_mechanism": "SCRAM-SHA-256",
                "sasl_plain_username": self.username,
                "sasl_plain_password": self.password,
            })

        self.producer = AIOKafkaProducer(**kwargs)
        await self.producer.start()
        logger.info(f"Producer started on {self.bootstrap_servers}")

    async def stop(self):
        if self.producer:
            await self.producer.stop()

    async def publish(self, topic: str, event: Dict[str, Any]):
        if not self.producer:
            await self.start()
        
        event["published_at"] = datetime.utcnow().isoformat()
        
        try:
            await self.producer.send_and_wait(topic, event)
            logger.info(f"Published event to {topic}")
        except Exception as e:
            logger.error(f"Failed to publish to {topic}: {e}")
            raise

class FTEKafkaConsumer:
    def __init__(self, topics: list, group_id: str, bootstrap_servers: str = None):
        self.topics = topics
        self.group_id = group_id
        self.bootstrap_servers = bootstrap_servers or os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.security_protocol = os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT")
        self.ssl_cafile = os.getenv("KAFKA_SSL_CAFILE")
        self.ssl_certfile = os.getenv("KAFKA_SSL_CERTFILE")
        self.ssl_keyfile = os.getenv("KAFKA_SSL_KEYFILE")
        self.username = os.getenv("KAFKA_USERNAME")
        self.password = os.getenv("KAFKA_PASSWORD")
        self.consumer = None

    async def start(self):
        kwargs = {
            "bootstrap_servers": self.bootstrap_servers,
            "group_id": self.group_id,
            "value_deserializer": lambda m: json.loads(m.decode('utf-8')),
            "auto_offset_reset": 'earliest'
        }

        if self.security_protocol == "SSL":
            context = ssl.create_default_context(cafile=self.ssl_cafile)
            context.load_cert_chain(certfile=self.ssl_certfile, keyfile=self.ssl_keyfile)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_REQUIRED
            kwargs.update({
                "security_protocol": "SSL",
                "ssl_context": context,
            })
        elif self.security_protocol == "SASL_SSL":
            kwargs.update({
                "security_protocol": "SASL_SSL",
                "sasl_mechanism": "SCRAM-SHA-256",
                "sasl_plain_username": self.username,
                "sasl_plain_password": self.password,
            })

        self.consumer = AIOKafkaConsumer(*self.topics, **kwargs)
        await self.consumer.start()
        logger.info(f"Consumer started for topics {self.topics} (Group: {self.group_id})")

    async def consume(self, handler: Callable[[Dict[str, Any]], Awaitable[None]]):
        if not self.consumer:
            await self.start()
        
        try:
            async for msg in self.consumer:
                logger.info(f"Received message from {msg.topic}")
                await handler(msg.value)
        finally:
            await self.consumer.stop()
