"""Public Sudoku puzzle data model."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Set, Tuple

from src.difficulty import Difficulty, get_difficulty_spec
from src.solver import solve
from src.validator import is_board_solved

SIZE = 9
EMPTY = 0


@dataclass
class Puzzle:
    """Represents a Sudoku puzzle with a solution and locking metadata."""

    puzzle: List[List[int]]
    solution: List[List[int]]
    difficulty: Difficulty
    locked: Set[Tuple[int, int]] = field(default_factory=set)
    hints_used: int = 0

    def __post_init__(self) -> None:
        """Lock all prefilled cells from the initial puzzle."""
        self.locked = {
            (row, col)
            for row in range(SIZE)
            for col in range(SIZE)
            if self.puzzle[row][col] != EMPTY
        }

    def is_locked(self, r: int, c: int) -> bool:
        """Return True when the cell is locked."""
        return (r, c) in self.locked

    def apply_hint(self) -> Optional[Tuple[int, int, int]]:
        """Reveal one correct empty cell and lock it."""
        for row in range(SIZE):
            for col in range(SIZE):
                if self.puzzle[row][col] == EMPTY:
                    value = self.solution[row][col]
                    self.puzzle[row][col] = value
                    self.locked.add((row, col))
                    self.hints_used += 1
                    return row, col, value
        return None

    def is_solved(self) -> bool:
        """Return True when the puzzle is solved."""
        return is_solved(self.puzzle)

    def to_dict(self) -> dict[str, object]:
        """Serialize the puzzle to a dictionary."""
        return {
            "puzzle": self.puzzle,
            "solution": self.solution,
            "difficulty": self.difficulty.value,
            "locked": sorted(self.locked),
            "hints_used": self.hints_used,
        }


def new_puzzle(difficulty: Difficulty | str) -> Puzzle:
    """Create a new puzzle for the requested difficulty."""
    from src.generator import generate_puzzle

    puzzle, solution = generate_puzzle(difficulty)
    return Puzzle(puzzle=puzzle, solution=solution, difficulty=Difficulty(difficulty.lower()) if isinstance(difficulty, str) else difficulty)


def load_puzzle(puzzle: List[List[int]], solution: List[List[int]], difficulty: Difficulty | str) -> Puzzle:
    """Load an existing puzzle into the public Puzzle model."""
    return Puzzle(
        puzzle=puzzle,
        solution=solution,
        difficulty=Difficulty(difficulty.lower()) if isinstance(difficulty, str) else difficulty,
    )


def is_solved(board: List[List[int]]) -> bool:
    """Return True when the board is solved."""
    return is_board_solved(board)
