"""Public Sudoku package API."""

from src.difficulty import Difficulty, DifficultySpec, get_difficulty_spec
from src.generator import generate_full_board, generate_puzzle
from src.solver import count_solutions, has_unique_solution, is_valid_placement, solve
from src.sudoku import Puzzle, is_solved, load_puzzle, new_puzzle
from src.validator import (
    all_conflicts,
    cells_with_value,
    count_value,
    find_conflicts,
    find_incorrect_entries,
    is_board_complete,
    is_board_solved,
)

__all__ = [
    "Difficulty",
    "DifficultySpec",
    "Puzzle",
    "all_conflicts",
    "cells_with_value",
    "count_solutions",
    "count_value",
    "find_conflicts",
    "find_incorrect_entries",
    "generate_full_board",
    "generate_puzzle",
    "get_difficulty_spec",
    "has_unique_solution",
    "is_board_complete",
    "is_board_solved",
    "is_solved",
    "is_valid_placement",
    "load_puzzle",
    "new_puzzle",
    "solve",
]
