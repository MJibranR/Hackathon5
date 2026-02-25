import asyncio
import logging
import os
import json
import re
from uuid import UUID
from typing import Any, Dict, List

import asyncpg
from openai import AsyncOpenAI

from agent.prompts import CUSTOMER_SUCCESS_SYSTEM_PROMPT
from agent.tools import AgentTools

logger = logging.getLogger("NovaAgent")

class NovaAgent:
    def __init__(self, db_pool: asyncpg.Pool):
        self.pool = db_pool
        self.tools_handler = AgentTools(db_pool)
        self.system_prompt = CUSTOMER_SUCCESS_SYSTEM_PROMPT
        
        # API Keys - Strictly OpenAI as requested
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.mock_ai = os.getenv("MOCK_AI", "false").lower() == "true"

        # Initialize OpenAI Client
        self.client = None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        try:
            if self.mock_ai:
                logger.info("NovaAgent initialized in MOCK MODE (No real AI calls)")
            elif self.openai_key:
                self.client = AsyncOpenAI(api_key=self.openai_key)
                logger.info(f"NovaAgent initialized with OpenAI: {self.model}")
            else:
                logger.error("OPENAI_API_KEY not found in environment")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")

    async def get_fallback_text(self, message: str) -> str:
        """Determines a helpful response when AI is offline."""
        msg = message.lower()
        if "reset" in msg or "password" in msg:
            return "I have initiated a password reset for you. Please check your email for a secure link from NovaSaaS Security."
        if "pricing" in msg or "cost" in msg:
            return "Pricing inquiries are handled by our account team. I have escalated this ticket, and a specialist will contact you with a quote."
        if "team" in msg or "member" in msg:
            return "To add team members, navigate to the 'Team' tab in your dashboard and click 'Invite'. I've attached our guide to this ticket."
        return "Thank you for contacting NovaSaaS. I have created a support ticket for your request, and our technical team will review it shortly."

    async def process_message(self, customer_id: UUID, message: str, channel: str) -> Dict[str, Any]:
        """Main entry point with guaranteed database execution."""
        ticket_id = None
        sentiment_score = 0.5
        is_escalated = False
        
        try:
            # STEP 1: GUARANTEED TICKET CREATION
            ticket_result = await self.tools_handler.create_ticket(
                customer_id=str(customer_id),
                issue=message[:100],
                channel=channel
            )
            ticket_id = ticket_result.get("ticket_id")
            
            # STEP 2: KNOWLEDGE BASE SEARCH
            kb_context = ""
            try:
                kb_context = await self.tools_handler.search_knowledge_base(message)
            except:
                pass

            sentiment_instruction = "IMPORTANT: You must start your response with '[SENTIMENT: X.X]' where X.X is a score from 0.0 to 1.0 (0=angry, 0.5=neutral, 1.0=happy). Then provide your actual response."
            full_system_prompt = f"{self.system_prompt}\n\nKNOWLEDGE BASE CONTEXT:\n{kb_context}\n\n{sentiment_instruction}"

            ai_response_text = None

            # STEP 3: AI PROCESSING
            if self.client and not self.mock_ai:
                try:
                    logger.info(f"Generating response using OpenAI {self.model}...")
                    response = await self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": full_system_prompt},
                            {"role": "user", "content": message}
                        ],
                        temperature=0.7
                    )
                    ai_response_text = response.choices[0].message.content
                except Exception as e:
                    logger.error(f"OpenAI API call failed: {e}")

            # STEP 4: PARSE SENTIMENT
            if ai_response_text:
                sentiment_match = re.search(r"\[SENTIMENT:\s*([\d.]+)\]", ai_response_text)
                if sentiment_match:
                    try:
                        sentiment_score = float(sentiment_match.group(1))
                        ai_response_text = re.sub(r"\[SENTIMENT:\s*[\d.]+\]", "", ai_response_text).strip()
                    except:
                        pass

            # STEP 5: ESCALATION LOGIC
            if sentiment_score < 0.3 or any(word in message.lower() for word in ["legal", "sue", "lawyer", "refund"]):
                is_escalated = True
                await self.tools_handler.escalate_to_human(ticket_id, reason="Auto-escalation")

            # STEP 6: FINAL FALLBACK
            if not ai_response_text:
                ai_response_text = await self.get_fallback_text(message)

            # STEP 7: STORAGE & RESPONSE
            send_result = await self.tools_handler.send_response(
                ticket_id=ticket_id,
                message=ai_response_text,
                channel=channel
            )
            
            delivery_status = send_result.get("status", "unknown")
            if "error" in send_result:
                logger.warning(f"Message generated but delivery failed: {send_result['error']}")

            return {
                "status": "success",
                "sentiment": sentiment_score,
                "escalated": is_escalated,
                "ticket_id": ticket_id,
                "response": ai_response_text,
                "delivery_status": delivery_status
            }

        except Exception as e:
            logger.error(f"NovaAgent Fatal Error: {e}")
            return {"status": "error", "sentiment": 0.5, "escalated": False}
