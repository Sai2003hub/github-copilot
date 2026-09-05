"""Difficulty definitions and puzzle generation targets."""

from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum
from typing import Union


class Difficulty(Enum):
    """Supported Sudoku difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


@dataclass(frozen=True)
class DifficultySpec:
    """Mapping between a difficulty and a target range of prefilled cells."""

    difficulty: Difficulty
    min_prefilled: int
    max_prefilled: int

    def sample_prefilled(self) -> int:
        """Return a random prefilled-cell count in the configured range."""
        return random.randint(self.min_prefilled, self.max_prefilled)


def get_difficulty_spec(difficulty: Union[Difficulty, str]) -> DifficultySpec:
    """Return the difficulty specification for the requested level."""
    if isinstance(difficulty, str):
        difficulty = Difficulty(difficulty.lower())

    mapping = {
        Difficulty.EASY: DifficultySpec(Difficulty.EASY, 36, 40),
        Difficulty.MEDIUM: DifficultySpec(Difficulty.MEDIUM, 30, 34),
        Difficulty.HARD: DifficultySpec(Difficulty.HARD, 24, 28),
    }
    return mapping[difficulty]
