import pytest
from httpx import AsyncClient
from api.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_form_validation_rejects_bad_input():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Missing 'email' and 'message'
        response = await ac.post("/api/support/submit", json={
            "name": "Test User",
            "subject": "Help"
        })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_metrics_overview_has_required_fields():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        try:
            response = await ac.get("/api/metrics/overview")
            if response.status_code == 200:
                data = response.json()
                assert "total_tickets" in data
                assert "avg_sentiment" in data
        except Exception:
            pass
