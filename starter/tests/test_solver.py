import copy

from src.solver import (
    count_solutions,
    has_unique_solution,
    is_valid_placement,
    solve,
)


def _sample_board() -> list[list[int]]:
    return [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ]


def test_is_valid_placement_checks_conflicts_and_range() -> None:
    board = [[0] * 9 for _ in range(9)]
    assert is_valid_placement(board, 0, 0, 1) is True

    board[0][1] = 1
    assert is_valid_placement(board, 0, 0, 1) is False

    board = [[0] * 9 for _ in range(9)]
    board[1][0] = 1
    assert is_valid_placement(board, 0, 0, 1) is False

    board = [[0] * 9 for _ in range(9)]
    board[1][1] = 1
    assert is_valid_placement(board, 0, 0, 1) is False

    assert is_valid_placement(board, 0, 0, 0) is False
    assert is_valid_placement(board, 0, 0, 10) is False
    assert is_valid_placement(board, -1, 0, 1) is False


def test_solve_returns_correct_solution() -> None:
    board = _sample_board()
    solved = solve(board)

    assert solved is not None
    assert solved[0][0] == 5
    assert solved[0][2] == 4
    assert solved[8][8] == 9


def test_solve_returns_none_for_unsolvable() -> None:
    board = [[1] * 9 for _ in range(9)]
    assert solve(board) is None


def test_count_solutions_for_unique_and_empty_board() -> None:
    board = _sample_board()
    assert count_solutions(board, limit=2) == 1

    empty_board = [[0] * 9 for _ in range(9)]
    assert count_solutions(empty_board, limit=2) == 2


def test_has_unique_solution_true_and_false() -> None:
    assert has_unique_solution(_sample_board()) is True
    assert has_unique_solution([[0] * 9 for _ in range(9)]) is False


def test_solve_does_not_mutate_input() -> None:
    board = _sample_board()
    original = copy.deepcopy(board)
    solve(board)
    assert board == original
