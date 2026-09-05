"""Backtracking solver utilities for Sudoku boards."""

from __future__ import annotations

import random
from typing import List, Optional, Tuple

SIZE = 9
EMPTY = 0


def _copy_board(board: List[List[int]]) -> List[List[int]]:
    """Return a deep copy of the provided board."""
    return [row[:] for row in board]


def _find_empty(board: List[List[int]]) -> Optional[Tuple[int, int]]:
    """Return the coordinates of the first empty cell or ``None``."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def _get_candidates(board: List[List[int]], row: int, col: int) -> List[int]:
    """Return the valid values for the specified empty cell."""
    used = set()
    for index in range(SIZE):
        if board[row][index] != EMPTY:
            used.add(board[row][index])
        if board[index][col] != EMPTY:
            used.add(board[index][col])

    start_row = (row // 3) * 3
    start_col = (col // 3) * 3
    for box_row in range(start_row, start_row + 3):
        for box_col in range(start_col, start_col + 3):
            value = board[box_row][box_col]
            if value != EMPTY:
                used.add(value)

    return [value for value in range(1, SIZE + 1) if value not in used]


def _find_best_empty(board: List[List[int]]) -> Optional[Tuple[int, int, List[int]]]:
    """Return the empty cell with the fewest candidates and its candidate list."""
    best_choice: Optional[Tuple[int, int, List[int]]] = None
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] != EMPTY:
                continue
            candidates = _get_candidates(board, row, col)
            if not candidates:
                return None
            if best_choice is None or len(candidates) < len(best_choice[2]):
                best_choice = (row, col, candidates)
    return best_choice


def is_valid_placement(board: List[List[int]], r: int, c: int, v: int) -> bool:
    """Return True when placing ``v`` at ``(r, c)`` does not violate rules."""
    if not (0 <= r < SIZE and 0 <= c < SIZE):
        return False
    if not (1 <= v <= SIZE):
        return False

    if board[r][c] != EMPTY and board[r][c] != v:
        return False

    for col in range(SIZE):
        if col != c and board[r][col] == v:
            return False

    for row in range(SIZE):
        if row != r and board[row][c] == v:
            return False

    start_row = (r // 3) * 3
    start_col = (c // 3) * 3
    for row in range(start_row, start_row + 3):
        for col in range(start_col, start_col + 3):
            if (row, col) != (r, c) and board[row][col] == v:
                return False
    return True


def _has_initial_conflicts(board: List[List[int]]) -> bool:
    """Return True when the board already contains conflicting placements."""
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                continue
            if not is_valid_placement(board, row, col, value):
                return True
    return False


def _solve_in_place(board: List[List[int]]) -> Optional[List[List[int]]]:
    """Solve the board in place using randomized backtracking."""
    if _has_initial_conflicts(board):
        return None

    choice = _find_best_empty(board)
    if choice is None:
        return [row[:] for row in board]

    row, col, values = choice
    values = list(values)
    random.shuffle(values)
    for value in values:
        if is_valid_placement(board, row, col, value):
            board[row][col] = value
            solved = _solve_in_place(board)
            if solved is not None:
                return solved
            board[row][col] = EMPTY
    return None


def solve(board: List[List[int]]) -> Optional[List[List[int]]]:
    """Return a solved copy of the board or ``None`` if it is unsolvable."""
    working_board = _copy_board(board)
    return _solve_in_place(working_board)


def count_solutions(board: List[List[int]], limit: int = 2) -> int:
    """Count up to ``limit`` solutions for the provided board."""
    working_board = _copy_board(board)
    if _has_initial_conflicts(working_board):
        return 0

    choice = _find_best_empty(working_board)
    if choice is None:
        return 1

    row, col, values = choice
    count = 0
    values = list(values)
    random.shuffle(values)
    for value in values:
        if is_valid_placement(working_board, row, col, value):
            working_board[row][col] = value
            remaining = limit - count
            if remaining <= 0:
                working_board[row][col] = EMPTY
                return count
            count += count_solutions(working_board, limit=remaining)
            working_board[row][col] = EMPTY
            if count >= limit:
                return count
    return count


def has_unique_solution(board: List[List[int]]) -> bool:
    """Return True when the board has exactly one solution."""
    return count_solutions(board, limit=2) == 1
