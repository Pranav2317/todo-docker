# Runs in CI against a temporary SQLite database (no Postgres needed).
import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_create_toggle_delete_todo():
    res = client.post("/api/todos", json={"title": "Test task"})
    assert res.status_code == 201
    todo = res.json()
    assert todo["done"] is False

    res = client.patch(f"/api/todos/{todo['id']}", json={"done": True})
    assert res.json()["done"] is True

    res = client.delete(f"/api/todos/{todo['id']}")
    assert res.status_code == 204


def test_empty_title_rejected():
    res = client.post("/api/todos", json={"title": ""})
    assert res.status_code == 422
