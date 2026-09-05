from src.difficulty import Difficulty
from src.sudoku import Puzzle, is_solved, load_puzzle, new_puzzle


def _sample_solution() -> list[list[int]]:
    return [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ]


def test_puzzle_locks_prefilled_cells_on_init() -> None:
    puzzle_board = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
    puzzle = load_puzzle(puzzle_board, _sample_solution(), Difficulty.EASY)

    assert puzzle.is_locked(0, 0) is True
    assert puzzle.is_locked(0, 1) is False


def test_apply_hint_reveals_correct_value_and_locks_it() -> None:
    puzzle_board = [[0] * 9 for _ in range(9)]
    puzzle = load_puzzle(puzzle_board, _sample_solution(), Difficulty.EASY)

    hint = puzzle.apply_hint()

    assert hint is not None
    assert hint[0] == 0
    assert hint[1] == 0
    assert hint[2] == 1
    assert puzzle.is_locked(0, 0) is True
    assert puzzle.puzzle[0][0] == 1
    assert puzzle.hints_used == 1


def test_apply_hint_returns_none_when_complete() -> None:
    puzzle = load_puzzle(_sample_solution(), _sample_solution(), Difficulty.EASY)
    assert puzzle.apply_hint() is None


def test_is_solved_true_and_false() -> None:
    assert is_solved(_sample_solution()) is True
    assert is_solved([[0] * 9 for _ in range(9)]) is False


def test_to_dict_serializes_every_field() -> None:
    puzzle = new_puzzle(Difficulty.EASY)
    data = puzzle.to_dict()

    assert set(data) == {"puzzle", "solution", "difficulty", "locked", "hints_used"}
    assert data["difficulty"] == Difficulty.EASY.value
    assert data["hints_used"] == 0
    assert isinstance(data["locked"], list)
