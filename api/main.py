import os
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import asyncpg
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from channels.gmail_handler import GmailHandler
from channels.whatsapp_handler import WhatsAppHandler
from channels import web_form_handler
from api.kafka_client import FTEKafkaProducer, TOPICS
from database import queries

# --- Models ---

class HealthResponse(BaseModel):
    status: str
    channels: Dict[str, str]
    timestamp: datetime

class Ticket(BaseModel):
    id: UUID
    customer_id: UUID
    conversation_id: UUID
    source_channel: str
    priority: str
    category: Optional[str]
    status: str
    created_at: datetime

class Message(BaseModel):
    id: UUID
    role: str
    content: str
    channel: str
    direction: str
    created_at: datetime

class TicketDetail(Ticket):
    messages: List[Message] = []

class Conversation(BaseModel):
    id: UUID
    customer_name: str
    initial_channel: str
    sentiment_score: Optional[float]
    status: str
    created_at: datetime

class MetricsOverview(BaseModel):
    total_tickets: int
    open_tickets: int
    escalations: int
    avg_sentiment: float
    avg_response_time: float
    tickets_by_channel: Dict[str, int]
    tickets_by_status: Dict[str, int]

# --- Database Connection ---

DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/novasaas")

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        # Enable SSL for serverless providers like Neon or Supabase
        self.pool = await asyncpg.create_pool(
            DB_DSN,
            ssl="require" if "localhost" not in DB_DSN and "127.0.0.1" not in DB_DSN else None
        )

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

db = Database()

# Initialize handlers
kafka_producer = FTEKafkaProducer()
gmail_handler = GmailHandler()
whatsapp_handler = WhatsAppHandler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    await kafka_producer.start()
    web_form_handler.producer = kafka_producer
    yield
    await db.disconnect()
    await kafka_producer.stop()

# --- App Initialization ---

app = FastAPI(
    title="NovaSaaS Support API", 
    lifespan=lifespan,
    description="24/7 AI-powered customer support across Email, WhatsApp, and Web"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(web_form_handler.router, prefix="/api")

# --- Endpoints ---

@app.get("/health", response_model=HealthResponse)
async def health():
    db_status = "connected"
    try:
        await db.pool.execute("SELECT 1")
    except:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "channels": {
            "database": db_status,
            "gmail": "connected",
            "whatsapp": "connected",
            "web_form": "active"
        },
        "timestamp": datetime.utcnow()
    }

@app.post("/api/webhooks/gmail")
async def gmail_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Gmail push notifications via Pub/Sub.
    """
    try:
        body = await request.json()
        messages = await gmail_handler.process_notification(body)
        
        for message in messages:
            # Publish to unified ticket queue
            background_tasks.add_task(
                kafka_producer.publish,
                TOPICS['INCOMING_TICKETS'],
                message
            )
        
        return {"status": "processed", "count": len(messages)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle incoming WhatsApp messages via Twilio webhook.
    """
    # Validate Twilio signature
    if not await whatsapp_handler.validate_webhook(request):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    form_data = await request.form()
    message = await whatsapp_handler.process_webhook(dict(form_data))
    
    # Publish to unified ticket queue
    background_tasks.add_task(
        kafka_producer.publish,
        TOPICS['INCOMING_TICKETS'],
        message
    )
    
    # Return TwiML response (empty = no immediate reply, agent will respond)
    return Response(
        content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        media_type="application/xml"
    )

@app.post("/api/tickets/{id}/escalate")
async def escalate_ticket_endpoint(id: UUID):
    await queries.escalate_ticket(db.pool, id, "high")
    return {"status": "escalated"}

@app.post("/api/tickets/{id}/resolve")
async def resolve_ticket_endpoint(id: UUID):
    await db.pool.execute("UPDATE tickets SET status = 'resolved', resolved_at = NOW() WHERE id = $1", id)
    return {"status": "resolved"}

@app.get("/api/tickets", response_model=List[Ticket])
async def list_tickets(
    status: Optional[str] = None,
    channel: Optional[str] = None,
    priority: Optional[str] = None,
    customer_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    offset = (page - 1) * limit
    query_str = "SELECT * FROM tickets WHERE 1=1"
    args = []
    
    if status:
        args.append(status)
        query_str += f" AND status = ${len(args)}"
    if channel:
        args.append(channel)
        query_str += f" AND source_channel = ${len(args)}"
    if priority:
        args.append(priority)
        query_str += f" AND priority = ${len(args)}"
    if customer_id:
        args.append(customer_id)
        query_str += f" AND customer_id = ${len(args)}"
        
    query_str += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
    
    rows = await db.pool.fetch(query_str, *args)
    return [dict(row) for row in rows]

@app.get("/api/tickets/{id}", response_model=TicketDetail)
async def get_ticket(id: UUID):
    ticket_row = await db.pool.fetchrow("SELECT * FROM tickets WHERE id = $1", id)
    if not ticket_row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = dict(ticket_row)
    messages_rows = await db.pool.fetch(
        "SELECT id, role, content, channel, direction, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
        ticket['conversation_id']
    )
    ticket['messages'] = [dict(m) for m in messages_rows]
    return ticket

@app.get("/api/conversations", response_model=List[Conversation])
async def list_conversations():
    rows = await db.pool.fetch("""
        SELECT conv.id, cust.name as customer_name, conv.initial_channel, 
               conv.sentiment_score, conv.status, conv.started_at as created_at
        FROM conversations conv
        JOIN customers cust ON conv.customer_id = cust.id
        ORDER BY conv.started_at DESC
    """)
    return [dict(row) for row in rows]

@app.get("/api/customers")
async def list_customers():
    rows = await db.pool.fetch("SELECT * FROM customers ORDER BY created_at DESC")
    return [dict(row) for row in rows]

@app.get("/api/metrics/overview", response_model=MetricsOverview)
async def get_metrics_overview():
    total_tickets = await db.pool.fetchval("SELECT COUNT(*) FROM tickets")
    open_tickets = await db.pool.fetchval("SELECT COUNT(*) FROM tickets WHERE status = 'open'")
    escalations = await db.pool.fetchval("SELECT COUNT(*) FROM conversations WHERE status = 'escalated'")
    avg_sentiment = await db.pool.fetchval("SELECT AVG(sentiment_score) FROM conversations") or 0.0
    avg_response_time = await db.pool.fetchval("SELECT AVG(response_time_seconds) FROM agent_metrics") or 0.0
    
    channel_rows = await db.pool.fetch("SELECT source_channel, COUNT(*) FROM tickets GROUP BY source_channel")
    tickets_by_channel = {row['source_channel']: row['count'] for row in channel_rows}
    
    status_rows = await db.pool.fetch("SELECT status, COUNT(*) FROM tickets GROUP BY status")
    tickets_by_status = {row['status']: row['count'] for row in status_rows}
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "escalations": escalations,
        "avg_sentiment": float(avg_sentiment),
        "avg_response_time": float(avg_response_time),
        "tickets_by_channel": tickets_by_channel,
        "tickets_by_status": tickets_by_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
