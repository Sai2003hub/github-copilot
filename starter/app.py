import logging
from typing import Any, Optional

from flask import Flask, jsonify, render_template, request

from src.difficulty import Difficulty
from src.sudoku import new_puzzle

app = Flask(__name__)

logger = logging.getLogger(__name__)


def _validate_board_pair(board: Any, solution: Any) -> Optional[str]:
    """Validate that the board and solution payloads are 9x9 arrays."""
    if not isinstance(board, list) or not isinstance(solution, list):
        return "Board and solution must both be 9x9 arrays"
    if len(board) != 9 or len(solution) != 9:
        return "Board and solution must both be 9x9 arrays"
    for row in board + solution:
        if not isinstance(row, list) or len(row) != 9:
            return "Board and solution must both be 9x9 arrays"
        for value in row:
            if not isinstance(value, int):
                return "Board and solution must both be 9x9 arrays"
    return None


@app.route("/")
def index() -> str:
    """Render the main game page."""
    return render_template(
        "index.html",
        difficulties=["easy", "medium", "hard"],
        selected_difficulty="medium",
    )


@app.route("/api/health")
def health() -> Any:
    """Return a simple health payload for smoke tests."""
    return jsonify({"status": "ok"})


@app.route("/api/puzzle")
def api_puzzle() -> Any:
    """Return a puzzle payload for the requested difficulty."""
    difficulty_param = request.args.get("difficulty", "easy")
    try:
        difficulty = Difficulty(difficulty_param.lower())
    except ValueError:
        return jsonify({"error": f"Unknown difficulty: {difficulty_param}"}), 400

    puzzle = new_puzzle(difficulty)
    return jsonify(puzzle.to_dict())


@app.route("/api/check", methods=["POST"])
def api_check() -> Any:
    """Return every incorrect non-empty cell for the supplied board."""
    payload = request.get_json(silent=True) or {}
    board = payload.get("board")
    solution = payload.get("solution")
    error = _validate_board_pair(board, solution)
    if error is not None:
        return jsonify({"error": error}), 400

    incorrect = []
    for row in range(9):
        for col in range(9):
            if board[row][col] != 0 and board[row][col] != solution[row][col]:
                incorrect.append([row, col])
    return jsonify({"incorrect": incorrect})


@app.route("/api/hint", methods=["POST"])
def api_hint() -> Any:
    """Return the first empty cell from the supplied board."""
    payload = request.get_json(silent=True) or {}
    board = payload.get("board")
    solution = payload.get("solution")
    error = _validate_board_pair(board, solution)
    if error is not None:
        return jsonify({"error": error}), 400

    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return jsonify({"row": row, "col": col, "value": solution[row][col]})
    return jsonify({"row": -1})


@app.route("/new")
def new_game() -> Any:
    """Return a freshly generated puzzle for the UI."""
    difficulty_param = request.args.get("difficulty", "easy")
    try:
        difficulty = Difficulty(difficulty_param.lower())
    except ValueError:
        difficulty = Difficulty.EASY

    puzzle = new_puzzle(difficulty)
    return jsonify({"puzzle": puzzle.puzzle})


@app.route("/hint")
def hint() -> Any:
    """Return the first empty cell from a fresh puzzle for the UI."""
    puzzle = new_puzzle(Difficulty.EASY)
    for row in range(9):
        for col in range(9):
            if puzzle.puzzle[row][col] == 0:
                return jsonify({"row": row, "col": col, "value": puzzle.solution[row][col]})
    return jsonify({"row": -1})


@app.route("/check", methods=["POST"])
def check_solution() -> Any:
    """Return incorrect cells using the posted board and solution."""
    payload = request.get_json(silent=True) or {}
    board = payload.get("board")
    solution = payload.get("solution")
    error = _validate_board_pair(board, solution)
    if error is not None:
        return jsonify({"error": error}), 400

    incorrect = []
    for row in range(9):
        for col in range(9):
            if board[row][col] != 0 and board[row][col] != solution[row][col]:
                incorrect.append([row, col])
    return jsonify({"incorrect": incorrect})


if __name__ == "__main__":
    app.run(debug=True)
