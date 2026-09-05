import copy
import random
from typing import List, Optional, Tuple

SIZE = 9
EMPTY = 0


def deep_copy(board: List[List[int]]) -> List[List[int]]:
    """Return a deep copy of a board."""
    return copy.deepcopy(board)


def create_empty_board() -> List[List[int]]:
    """Create an empty SIZE x SIZE board filled with EMPTY."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board: List[List[int]], row: int, col: int, num: int) -> bool:
    """Return True if placing `num` at (row, col) violates no Sudoku rule."""
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def _find_empty(board: List[List[int]]) -> Optional[Tuple[int, int]]:
    """Return coordinates of the first empty cell or None if full."""
    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] == EMPTY:
                return i, j
    return None


def fill_board(board: List[List[int]]) -> bool:
    """Backtracking fill to produce a complete valid board in-place."""
    empty = _find_empty(board)
    if not empty:
        return True
    row, col = empty
    nums = list(range(1, SIZE + 1))
    random.shuffle(nums)
    for candidate in nums:
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            if fill_board(board):
                return True
            board[row][col] = EMPTY
    return False


def solve_count(board: List[List[int]], limit: int = 2) -> int:
    """Count solutions for `board` up to `limit`.

    This stops early once `limit` solutions are found which is useful for
    uniqueness checks.
    """
    empty = _find_empty(board)
    if not empty:
        return 1
    row, col = empty
    count = 0
    for num in range(1, SIZE + 1):
        if is_safe(board, row, col, num):
            board[row][col] = num
            count += solve_count(board, limit)
            board[row][col] = EMPTY
            if count >= limit:
                return count
    return count


def _remove_cell_and_check_unique(board: List[List[int]], row: int, col: int) -> bool:
    """Temporarily remove a cell and check whether the puzzle remains unique.

    Returns True if the removal can be kept (unique), False otherwise.
    """
    backup = board[row][col]
    board[row][col] = EMPTY
    board_copy = deep_copy(board)
    count = solve_count(board_copy, limit=2)
    if count == 1:
        return True
    board[row][col] = backup
    return False


def generate_puzzle(clues: int = 35) -> Tuple[List[List[int]], List[List[int]]]:
    """Generate a puzzle with exactly `clues` filled cells and a unique solution.

    Returns `(puzzle, solution)` where `solution` is the full solved board.
    """
    if clues < 17:
        raise ValueError('Too few clues to guarantee a valid puzzle')
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)

    # We try to remove cells in random order but only keep removals that
    # preserve uniqueness. Stop when we've removed enough cells to leave
    # `clues` filled cells or when no more removable cells are found.
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)
    target_filled = clues
    # current filled count
    filled = SIZE * SIZE
    for (r, c) in cells:
        if filled <= target_filled:
            break
        if board[r][c] == EMPTY:
            continue
        if _remove_cell_and_check_unique(board, r, c):
            filled -= 1

    puzzle = deep_copy(board)
    return puzzle, solution
