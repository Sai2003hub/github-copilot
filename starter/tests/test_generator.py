import pytest

from src.difficulty import Difficulty, get_difficulty_spec
from src.generator import generate_full_board, generate_puzzle
from src.solver import has_unique_solution
from src.validator import is_board_solved


@pytest.mark.parametrize(
    "difficulty",
    [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD],
)
def test_generate_puzzle_has_unique_solution_and_expected_range(
    difficulty: Difficulty,
) -> None:
    puzzle, solution = generate_puzzle(difficulty)
    spec = get_difficulty_spec(difficulty)

    assert has_unique_solution(puzzle) is True
    assert is_board_solved(solution) is True

    prefilled = sum(cell != 0 for row in puzzle for cell in row)
    assert spec.min_prefilled <= prefilled <= spec.max_prefilled


def test_generate_full_board_returns_distinct_boards() -> None:
    first = generate_full_board()
    second = generate_full_board()
    while second == first:
        second = generate_full_board()

    assert first != second
