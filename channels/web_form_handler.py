from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import uuid
from api.kafka_client import FTEKafkaProducer, TOPICS

router = APIRouter(prefix="/support", tags=["support-form"])

class SupportFormSubmission(BaseModel):
    """Support form submission model with validation."""
    name: str
    email: EmailStr
    subject: str
    category: str  # 'general', 'technical', 'billing', 'feedback'
    message: str
    priority: Optional[str] = 'medium'
    attachments: Optional[list[str]] = []
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()
    
    @field_validator('message')
    @classmethod
    def message_must_have_content(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Message must be at least 10 characters')
        return v.strip()
    
    @field_validator('category')
    @classmethod
    def category_must_be_valid(cls, v):
        valid_categories = ['general', 'technical', 'billing', 'feedback', 'bug_report']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v

class GmailSubmission(BaseModel):
    subject: str
    message: str
    email: EmailStr
    name: Optional[str] = "Gmail User"

class WhatsAppSubmission(BaseModel):
    message: str
    phone: str
    name: Optional[str] = "WhatsApp User"

class SupportFormResponse(BaseModel):
    """Response model for form submission."""
    ticket_id: str
    message: str
    estimated_response_time: str

# Injected by api/main.py
producer: Optional[FTEKafkaProducer] = None

@router.post("/submit", response_model=SupportFormResponse)
async def submit_support_form(submission: SupportFormSubmission):
    """
    Handle support form submission.
    """
    if not producer:
        raise HTTPException(status_code=503, detail="Kafka producer not ready")
    
    ticket_id = str(uuid.uuid4())
    
    # Create normalized message for agent
    message_data = {
        'channel': 'web_form',
        'channel_message_id': ticket_id,
        'customer_email': submission.email,
        'customer_name': submission.name,
        'subject': submission.subject,
        'content': submission.message,
        'category': submission.category,
        'priority': submission.priority,
        'received_at': datetime.utcnow().isoformat(),
        'metadata': {
            'form_version': '1.0',
            'attachments': submission.attachments
        }
    }
    
    # Publish to Kafka
    await producer.publish(TOPICS['INCOMING_TICKETS'], message_data)
    
    return SupportFormResponse(
        ticket_id=ticket_id,
        message="Thank you for contacting us! Our AI assistant will respond shortly.",
        estimated_response_time="Usually within 5 minutes"
    )

@router.post("/gmail/submit", response_model=SupportFormResponse)
async def submit_gmail_simulation(submission: GmailSubmission):
    if not producer:
        raise HTTPException(status_code=503, detail="Kafka producer not ready")
    
    ticket_id = f"sim_gmail_{uuid.uuid4().hex[:8]}"
    message_data = {
        'channel': 'gmail',
        'channel_message_id': ticket_id,
        'customer_email': submission.email,
        'customer_name': submission.name,
        'subject': submission.subject,
        'content': submission.message,
        'received_at': datetime.utcnow().isoformat(),
        'metadata': {'simulated': True}
    }
    await producer.publish(TOPICS['INCOMING_TICKETS'], message_data)
    return SupportFormResponse(
        ticket_id=ticket_id,
        message="Gmail message simulated! The agent will reply to your email.",
        estimated_response_time="Check your Gmail inbox soon"
    )

@router.post("/whatsapp/submit", response_model=SupportFormResponse)
async def submit_whatsapp_simulation(submission: WhatsAppSubmission):
    if not producer:
        raise HTTPException(status_code=503, detail="Kafka producer not ready")
    
    ticket_id = f"sim_wa_{uuid.uuid4().hex[:8]}"
    message_data = {
        'channel': 'whatsapp',
        'channel_message_id': ticket_id,
        'customer_phone': submission.phone,
        'customer_name': submission.name,
        'content': submission.message,
        'received_at': datetime.utcnow().isoformat(),
        'metadata': {'simulated': True}
    }
    await producer.publish(TOPICS['INCOMING_TICKETS'], message_data)
    return SupportFormResponse(
        ticket_id=ticket_id,
        message="WhatsApp message simulated! The agent will reply via WhatsApp.",
        estimated_response_time="Check your WhatsApp soon"
    )

@router.get("/ticket/{ticket_id}")
async def get_ticket_status(ticket_id: str):
    """Get status and conversation history for a ticket."""
    # This should query the DB via queries.py
    return {
        'ticket_id': ticket_id,
        'status': 'open',
        'messages': [],
        'created_at': datetime.utcnow(),
        'last_updated': datetime.utcnow()
    }
