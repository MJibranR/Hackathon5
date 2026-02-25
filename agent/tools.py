import logging
import os
from uuid import UUID
from typing import Dict, Any
import asyncpg
from database import queries

from channels.gmail_handler import GmailHandler
from channels.whatsapp_handler import WhatsAppHandler

logger = logging.getLogger("AgentTools")

class AgentTools:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        self.gmail = None
        self.whatsapp = WhatsAppHandler()
        
        # Initialize Gmail if credentials exist
        gmail_token = os.getenv("GMAIL_REFRESH_TOKEN")
        if gmail_token and "your_" not in gmail_token:
            self.gmail = GmailHandler({
                "client_id": os.getenv("GMAIL_CLIENT_ID"),
                "client_secret": os.getenv("GMAIL_CLIENT_SECRET"),
                "refresh_token": gmail_token
            })
            logger.info("GmailHandler initialized successfully.")
        else:
            logger.warning("GmailHandler not initialized. GMAIL_REFRESH_TOKEN is not set or contains 'your_'.")

    async def search_knowledge_base(self, query: str, max_results: int = 5) -> str:
        """Searches the knowledge base for relevant information from product docs and company profile."""
        try:
            results = await queries.search_kb(self.pool, query, max_results)
            if not results:
                return "No relevant information found in the knowledge base."
            return "\n---\n".join(results)
        except Exception as e:
            logger.error(f"Error searching KB: {e}")
            return "Error accessing the knowledge base."

    async def create_ticket(self, customer_id: str, issue: str, channel: str, priority: str = "medium") -> Dict[str, Any]:
        """ALWAYS CALL THIS FIRST. Creates a support ticket to track the customer issue."""
        try:
            c_id = UUID(customer_id)
            conv_id = await queries.get_or_create_conversation(self.pool, c_id, channel)
            ticket_id = await queries.create_ticket(self.pool, c_id, conv_id, channel, priority)
            return {"ticket_id": str(ticket_id), "status": "created", "conversation_id": str(conv_id)}
        except Exception as e:
            logger.error(f"Error creating ticket: {e}")
            return {"error": "Failed to create ticket."}

    async def get_customer_history(self, customer_id: str) -> str:
        """Retrieves past interactions to understand context and avoid repeating information."""
        try:
            c_id = UUID(customer_id)
            rows = await queries.get_history(self.pool, c_id)
            if not rows:
                return "This is a new customer with no previous history."
            
            history = "\n".join([f"[{r['created_at'].strftime('%Y-%m-%d %H:%M')}] {r['role']}: {r['content']} (via {r['channel']})" for r in rows])
            return f"Past interaction history:\n{history}"
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return "Error retrieving customer history."

    async def escalate_to_human(self, ticket_id: str, reason: str, urgency: str = "medium") -> Dict[str, Any]:
        """Escalates the ticket to a human agent when rules are triggered (pricing, anger, complex bugs)."""
        try:
            t_id = UUID(ticket_id)
            await queries.escalate_ticket(self.pool, t_id, urgency)
            logger.info(f"Ticket {ticket_id} escalated: {reason}")
            return {"status": "escalated", "ticket_id": str(ticket_id), "message": "I am connecting you with a human specialist."}
        except Exception as e:
            logger.error(f"Error escalating ticket: {e}")
            return {"error": "Failed to escalate ticket."}

    async def send_response(self, ticket_id: str, message: str, channel: str) -> Dict[str, Any]:
        """Formats and sends the final response to the customer via the appropriate channel."""
        try:
            t_id = UUID(ticket_id)
            from agent.formatters import format_response
            formatted_content = format_response(message, channel)
            
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT t.conversation_id, c.customer_id, cust.email, cust.phone 
                    FROM tickets t
                    JOIN conversations c ON t.conversation_id = c.id
                    JOIN customers cust ON c.customer_id = cust.id
                    WHERE t.id = $1
                """, t_id)
            
            if not row:
                 return {"error": "No data found for this ticket."}

            conv_id = row['conversation_id']
            customer_email = row['email']
            customer_phone = row['phone']

            # --- REAL CHANNEL SENDING ---
            delivery_status = "sent"
            
            if channel == "whatsapp" and customer_phone:
                logger.info(f"Sending real WhatsApp to {customer_phone}")
                result = await self.whatsapp.send_message(customer_phone, formatted_content)
                delivery_status = result.get("delivery_status", "sent")
                
            elif channel == "gmail" and customer_email and self.gmail:
                logger.info(f"Sending real Email to {customer_email}")
                # We need the subject, fallback to a default or find first inbound
                result = await self.gmail.send_reply(customer_email, "Support Ticket Update", formatted_content)
                delivery_status = result.get("delivery_status", "sent")

            # Store in database
            await queries.store_message(self.pool, conv_id, channel, "outbound", "agent", formatted_content)
            
            return {"formatted_message": formatted_content, "channel": channel, "status": delivery_status}
        except Exception as e:
            logger.error(f"Error sending response: {e}")
            return {"error": f"Failed to send response: {str(e)}"}
