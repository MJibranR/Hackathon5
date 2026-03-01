import asyncio
import asyncpg
from database import queries
import os

# The concise content to be added to the knowledge base
AGENT_PURPOSE_TITLE = "Agent Purpose and Goals"
AGENT_PURPOSE_CATEGORY = "internal_goals"
AGENT_PURPOSE_CONTENT = """
## Executive Summary
This system is a Digital FTE (Full-Time Equivalent) - an AI employee that works 24/7 to handle customer inquiries. Its purpose is to evolve from a prototype into a production-grade Custom Agent using technologies like OpenAI, FastAPI, PostgreSQL, and Kafka. The goal is to have a production-deployed AI employee handling a real business function autonomously across multiple communication channels (Email, WhatsApp, Web Form).

## The Business Problem
Our client, NovaSaaS, is a growing company overwhelmed by customer inquiries. This Digital FTE is designed to solve this by:
- Handling customer questions about the product 24/7.
- Accepting inquiries from Email (Gmail), WhatsApp, and a Web Form.
- Tracking all interactions in a PostgreSQL-based ticket management system.
- Escalating complex issues when necessary.
"""

async def main():
    # It's better to use environment variables for database connection
    # For this script, we'll use a default connection string if the env var isn't set.
    # NOTE: This assumes you are running this from the root of your project
    # and your database is accessible.
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/novasaas")
    
    try:
        pool = await asyncpg.create_pool(dsn=db_url)
        print("Successfully connected to the database.")
        
        print("Adding agent purpose to the knowledge base...")
        await queries.add_knowledge_base_entry(
            pool,
            title=AGENT_PURPOSE_TITLE,
            content=AGENT_PURPOSE_CONTENT,
            category=AGENT_PURPOSE_CATEGORY
        )
        print("...Done. Knowledge base has been updated with the agent's purpose.")
        
        await pool.close()
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please ensure your database is running and accessible, and that the DATABASE_URL environment variable is set correctly if needed.")

if __name__ == "__main__":
    asyncio.run(main())
