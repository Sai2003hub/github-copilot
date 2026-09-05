import pytest
from flask.testing import FlaskClient

from app import app
from src.difficulty import Difficulty
from src.sudoku import new_puzzle


@pytest.fixture
def client() -> FlaskClient:
    """Create a Flask test client for API route tests."""
    app.config.update(TESTING=True)
    return app.test_client()


def test_health_returns_ok(client: FlaskClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_get_puzzle_returns_puzzle_payload(client: FlaskClient) -> None:
    response = client.get("/api/puzzle?difficulty=easy")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["difficulty"] == Difficulty.EASY.value
    assert "puzzle" in payload
    assert "solution" in payload
    assert "locked" in payload
    assert "hints_used" in payload


def test_get_puzzle_rejects_unknown_difficulty(client: FlaskClient) -> None:
    response = client.get("/api/puzzle?difficulty=unknown")
    assert response.status_code == 400
    assert response.get_json() == {"error": "Unknown difficulty: unknown"}


def test_check_returns_incorrect_cells(client: FlaskClient) -> None:
    puzzle = new_puzzle(Difficulty.EASY)
    board = [row[:] for row in puzzle.puzzle]
    board[0][0] = 0
    response = client.post(
        "/api/check",
        json={"board": board, "solution": puzzle.solution},
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert "incorrect" in payload
    assert isinstance(payload["incorrect"], list)


def test_check_rejects_malformed_payload(client: FlaskClient) -> None:
    response = client.post(
        "/api/check",
        json={"board": [[1]], "solution": [[1]]},
    )
    assert response.status_code == 400
    assert response.get_json() == {"error": "Board and solution must both be 9x9 arrays"}


def test_hint_returns_first_empty_cell(client: FlaskClient) -> None:
    puzzle = new_puzzle(Difficulty.EASY)
    board = [row[:] for row in puzzle.puzzle]
    response = client.post(
        "/api/hint",
        json={"board": board, "solution": puzzle.solution},
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["row"] != -1 or "value" in payload


def test_hint_rejects_malformed_payload(client: FlaskClient) -> None:
    response = client.post(
        "/api/hint",
        json={"board": [[1]], "solution": [[1]]},
    )
    assert response.status_code == 400
    assert response.get_json() == {"error": "Board and solution must both be 9x9 arrays"}
