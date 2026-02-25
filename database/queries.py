import asyncpg
from uuid import UUID
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

async def resolve_customer(pool: asyncpg.Pool, email: Optional[str], phone: Optional[str], name: str = "Unknown Customer") -> UUID:
    async with pool.acquire() as conn:
        if email:
            row = await conn.fetchrow("SELECT id FROM customers WHERE email = $1", email)
        elif phone:
            row = await conn.fetchrow("SELECT id FROM customers WHERE phone = $1", phone)
        else:
            row = None

        if row:
            return row['id']
        
        return await conn.fetchval(
            "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
            name, email, phone
        )

async def get_or_create_conversation(pool: asyncpg.Pool, customer_id: UUID, channel: str) -> UUID:
    cutoff = datetime.utcnow() - timedelta(hours=24)
    row = await pool.fetchrow(
        "SELECT id FROM conversations WHERE customer_id = $1 AND status = 'active' AND updated_at > $2 ORDER BY updated_at DESC LIMIT 1",
        customer_id, cutoff
    )
    if row:
        return row['id']
    
    return await pool.fetchval(
        "INSERT INTO conversations (customer_id, initial_channel) VALUES ($1, $2) RETURNING id",
        customer_id, channel
    )

async def store_message(pool: asyncpg.Pool, conversation_id: UUID, channel: str, direction: str, role: str, content: str, message_id: Optional[str] = None):
    await pool.execute(
        "INSERT INTO messages (conversation_id, channel, direction, role, content, channel_message_id) VALUES ($1, $2, $3, $4, $5, $6)",
        conversation_id, channel, direction, role, content, message_id
    )
    await pool.execute("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", conversation_id)

async def search_kb(pool: asyncpg.Pool, query: str, limit: int = 5) -> List[str]:
    rows = await pool.fetch(
        "SELECT content FROM knowledge_base WHERE content ILIKE $1 LIMIT $2",
        f"%{query}%", limit
    )
    return [r['content'] for r in rows]

async def create_ticket(pool: asyncpg.Pool, customer_id: UUID, conversation_id: UUID, channel: str, priority: str, category: str = "AI Triage") -> UUID:
    return await pool.fetchval(
        "INSERT INTO tickets (customer_id, conversation_id, source_channel, priority, category) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        customer_id, conversation_id, channel, priority, category
    )

async def get_history(pool: asyncpg.Pool, customer_id: UUID, limit: int = 20):
    return await pool.fetch(
        """SELECT role, content, channel, created_at 
           FROM messages m 
           JOIN conversations c ON m.conversation_id = c.id 
           WHERE c.customer_id = $1 
           ORDER BY m.created_at DESC LIMIT $2""",
        customer_id, limit
    )

async def update_conversation_metrics(pool: asyncpg.Pool, conversation_id: UUID, sentiment_score: float):
    await pool.execute(
        "UPDATE conversations SET sentiment_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        sentiment_score, conversation_id
    )

async def escalate_ticket(pool: asyncpg.Pool, ticket_id: UUID, urgency: str):
    await pool.execute("UPDATE tickets SET status = 'in_progress', priority = $1 WHERE id = $2", urgency, ticket_id)
    await pool.execute(
        "UPDATE conversations SET status = 'escalated', escalated_to = 'human_support' WHERE id = (SELECT conversation_id FROM tickets WHERE id = $1)",
        ticket_id
    )
