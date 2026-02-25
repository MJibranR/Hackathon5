import os
import asyncio
from google import genai
from dotenv import load_dotenv

async def test_models():
    load_dotenv()
    key = "AIzaSyAiyKMq2-OgBkMYWZoI2dT1MOQlLrtURug"
    client = genai.Client(api_key=key)
    
    test_models = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-pro'
    ]
    
    print(f"Testing connectivity with key: {key[:10]}...")
    
    for model_id in test_models:
        try:
            print(f"Testing {model_id}...", end=" ")
            response = client.models.generate_content(
                model=model_id,
                contents="Hello"
            )
            print(f"SUCCESS: {response.text[:20]}...")
        except Exception as e:
            print(f"FAILED: {str(e)[:100]}")

if __name__ == "__main__":
    asyncio.run(test_models())
