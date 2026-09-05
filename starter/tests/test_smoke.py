from app import app


def test_index_returns_200() -> None:
    """The home page should respond successfully."""
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
