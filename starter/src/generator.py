"""Board generation and puzzle carving utilities."""

from __future__ import annotations

import random
from typing import List, Tuple

from src.difficulty import Difficulty, DifficultySpec, get_difficulty_spec
from src.solver import count_solutions, is_valid_placement

SIZE = 9
EMPTY = 0


def _copy_board(board: List[List[int]]) -> List[List[int]]:
    """Return a deep copy of the provided board."""
    return [row[:] for row in board]


def _find_empty(board: List[List[int]]) -> Tuple[int, int] | None:
    """Return an empty cell coordinate or ``None`` if the board is full."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def generate_full_board() -> List[List[int]]:
    """Generate a complete valid Sudoku board using randomized backtracking."""
    board = [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

    def backtrack() -> bool:
        empty = _find_empty(board)
        if empty is None:
            return True
        row, col = empty
        values = list(range(1, SIZE + 1))
        random.shuffle(values)
        for value in values:
            if is_valid_placement(board, row, col, value):
                board[row][col] = value
                if backtrack():
                    return True
                board[row][col] = EMPTY
        return False

    if not backtrack():
        raise RuntimeError("Unable to generate a valid Sudoku board")
    return _copy_board(board)


def generate_puzzle(difficulty: Difficulty | str) -> Tuple[List[List[int]], List[List[int]]]:
    """Generate a puzzle and its solved board for the selected difficulty.

    The function builds a complete random valid Sudoku solution, then removes cells
    one by one in a shuffled order until the requested number of prefilled cells
    remains. After each removal, it checks whether the puzzle still has a unique
    solution; if not, the cell is restored.

    Args:
        difficulty: The requested Sudoku difficulty.

    Returns:
        A tuple containing the generated puzzle board and the solved board.
    """
    spec = get_difficulty_spec(difficulty)
    solution = generate_full_board()
    puzzle = _copy_board(solution)

    target_prefilled = spec.sample_prefilled()
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(cells)

    prefilled = SIZE * SIZE
    for row, col in cells:
        if prefilled <= target_prefilled:
            break
        if puzzle[row][col] == EMPTY:
            continue
        original = puzzle[row][col]
        puzzle[row][col] = EMPTY
        if count_solutions(puzzle, limit=2) != 1:
            puzzle[row][col] = original
        else:
            prefilled -= 1

    return puzzle, solution
