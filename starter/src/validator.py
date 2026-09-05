"""Validation helpers for Sudoku boards."""

from __future__ import annotations

from typing import Iterable, List, Set, Tuple

SIZE = 9
EMPTY = 0


def is_board_complete(board: List[List[int]]) -> bool:
    """Return True when the board contains no empty cells."""
    return all(cell != EMPTY for row in board for cell in row)


def is_board_solved(board: List[List[int]]) -> bool:
    """Return True when the board is complete and valid."""
    if not is_board_complete(board):
        return False
    return not any(find_conflicts(board, row, col) for row in range(SIZE) for col in range(SIZE))


def find_conflicts(board: List[List[int]], r: int, c: int) -> Set[str]:
    """Return conflict types affecting the given cell."""
    if not (0 <= r < SIZE and 0 <= c < SIZE):
        return set()

    value = board[r][c]
    if value == EMPTY:
        return set()

    conflicts: Set[str] = set()

    for col in range(SIZE):
        if col != c and board[r][col] == value:
            conflicts.add("row")
            break

    for row in range(SIZE):
        if row != r and board[row][c] == value:
            conflicts.add("column")
            break

    start_row = (r // 3) * 3
    start_col = (c // 3) * 3
    for row in range(start_row, start_row + 3):
        for col in range(start_col, start_col + 3):
            if (row, col) != (r, c) and board[row][col] == value:
                conflicts.add("box")
                break
        if "box" in conflicts:
            break

    return conflicts


def all_conflicts(board: List[List[int]]) -> Set[Tuple[int, int]]:
    """Return all positions involved in a row/column/box conflict."""
    conflicts: Set[Tuple[int, int]] = set()
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                continue
            if find_conflicts(board, row, col):
                conflicts.add((row, col))
    return conflicts


def find_incorrect_entries(board: List[List[int]], solution: List[List[int]]) -> Set[Tuple[int, int]]:
    """Return positions that differ from the provided solution."""
    incorrect: Set[Tuple[int, int]] = set()
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] != EMPTY and board[row][col] != solution[row][col]:
                incorrect.add((row, col))
    return incorrect


def cells_with_value(board: List[List[int]], value: int) -> Set[Tuple[int, int]]:
    """Return coordinates whose value matches the provided number."""
    return {
        (row, col)
        for row in range(SIZE)
        for col in range(SIZE)
        if board[row][col] == value
    }


def count_value(board: List[List[int]], value: int) -> int:
    """Return the number of cells set to the provided value."""
    return len(cells_with_value(board, value))
