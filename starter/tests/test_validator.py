from src.validator import (
    all_conflicts,
    cells_with_value,
    count_value,
    find_conflicts,
    find_incorrect_entries,
    is_board_complete,
    is_board_solved,
)


def _sample_solved_board() -> list[list[int]]:
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


def test_is_board_complete_and_solved() -> None:
    board = _sample_solved_board()
    assert is_board_complete(board) is True
    assert is_board_solved(board) is True

    board[0][0] = 0
    assert is_board_complete(board) is False
    assert is_board_solved(board) is False


def test_find_conflicts_reports_row_col_and_box() -> None:
    board = [[0] * 9 for _ in range(9)]
    board[0][0] = 1
    board[0][1] = 1
    board[1][0] = 1
    board[1][1] = 1

    conflicts = find_conflicts(board, 0, 0)
    assert conflicts == {"row", "column", "box"}


def test_all_conflicts_finds_positions_with_conflicts() -> None:
    board = [[0] * 9 for _ in range(9)]
    board[0][0] = 1
    board[0][1] = 1
    board[1][0] = 1

    assert all_conflicts(board) == {(0, 0), (0, 1), (1, 0)}


def test_find_incorrect_entries_ignores_empty_cells() -> None:
    board = [[0] * 9 for _ in range(9)]
    solution = _sample_solved_board()
    board[0][0] = 9
    board[0][1] = 0

    assert find_incorrect_entries(board, solution) == {(0, 0)}


def test_cells_with_value_and_count_value() -> None:
    board = [[0] * 9 for _ in range(9)]
    board[0][0] = 1
    board[0][1] = 1
    board[1][0] = 2

    assert cells_with_value(board, 1) == {(0, 0), (0, 1)}
    assert count_value(board, 1) == 2
