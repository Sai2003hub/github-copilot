function createBoard(boardEl, statusEl) {
  const state = {
    puzzle: Array.from({ length: 9 }, () => Array(9).fill(0)),
    solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
    difficulty: 'easy',
    locked: new Set(),
    hints: new Set(),
    notes: new Map(),
    notesMode: false,
    selected: null,
    conflictKeys: [],
    changeCallbacks: [],
    selectCallbacks: [],
    statusKind: '',
  };

  function buildGrid() {
    if (!boardEl) {
      return;
    }

    boardEl.innerHTML = '';
    boardEl.setAttribute('role', 'grid');
    boardEl.className = 'sudoku-grid';

    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'sudoku-board__cell';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('data-row', String(row));
        cell.setAttribute('data-col', String(col));
        cell.setAttribute('data-box-row', String(Math.floor(row / 3)));
        cell.setAttribute('data-box-col', String(Math.floor(col / 3)));
        cell.addEventListener('click', () => selectCell(row, col));
        boardEl.appendChild(cell);
      }
    }
  }

  function getCellKey(r, c) {
    return `${r},${c}`;
  }

  function getCellEl(r, c) {
    return boardEl?.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  }

  function getConflictingCells(board = state.puzzle) {
    const conflicts = new Set();

    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const value = board[row][col];
        if (value === 0) {
          continue;
        }

        for (let otherCol = 0; otherCol < 9; otherCol += 1) {
          if (otherCol !== col && board[row][otherCol] === value) {
            conflicts.add(getCellKey(row, col));
            conflicts.add(getCellKey(row, otherCol));
          }
        }

        for (let otherRow = 0; otherRow < 9; otherRow += 1) {
          if (otherRow !== row && board[otherRow][col] === value) {
            conflicts.add(getCellKey(row, col));
            conflicts.add(getCellKey(otherRow, col));
          }
        }

        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let r = boxRowStart; r < boxRowStart + 3; r += 1) {
          for (let c = boxColStart; c < boxColStart + 3; c += 1) {
            if ((r !== row || c !== col) && board[r][c] === value) {
              conflicts.add(getCellKey(row, col));
              conflicts.add(getCellKey(r, c));
            }
          }
        }
      }
    }

    return Array.from(conflicts);
  }

  function getPlacementConflictCells(r, c, value) {
    const nextBoard = state.puzzle.map((row) => [...row]);
    nextBoard[r][c] = value;
    return getConflictingCells(nextBoard);
  }

  function highlightConflicts(cells = []) {
    const keys = new Set(cells.map((cell) => {
      if (typeof cell === 'string') {
        return cell;
      }
      return getCellKey(cell[0], cell[1]);
    }));
    Array.from(boardEl?.children || []).forEach((cell) => {
      const row = Number(cell.getAttribute('data-row'));
      const col = Number(cell.getAttribute('data-col'));
      const key = getCellKey(row, col);
      cell.classList.toggle('sudoku-board__cell--conflict', keys.has(key));
    });
  }

  function render() {
    buildGrid();
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const cellEl = getCellEl(row, col);
        if (!cellEl) {
          continue;
        }

        const value = state.puzzle[row][col];
        const key = getCellKey(row, col);
        const noteSet = state.notes.get(key) || new Set();
        const isLocked = state.locked.has(key);
        const selected = state.selected;
        const isSelected = selected && selected.r === row && selected.c === col;
        const isPeer = selected && isPeerCell(selected.r, selected.c, row, col);
        const isSameValue = selected && value !== 0 && value === state.puzzle[selected.r][selected.c];
        const isHint = state.hints.has(key);

        cellEl.className = 'sudoku-board__cell';
        if (isLocked) {
          cellEl.classList.add('sudoku-board__cell--locked');
        }
        if (isSelected) {
          cellEl.classList.add('sudoku-board__cell--selected');
        }
        if (isPeer) {
          cellEl.classList.add('sudoku-board__cell--peer');
        }
        if (isSameValue) {
          cellEl.classList.add('sudoku-board__cell--same-value');
        }
        if (isHint) {
          cellEl.classList.add('sudoku-board__cell--hint');
        }
        if (noteSet.size && value === 0) {
          cellEl.innerHTML = `<span class="notes">${Array.from(noteSet).map((note) => `<span>${note}</span>`).join('')}</span>`;
        } else {
          cellEl.textContent = value === 0 ? '' : String(value);
          cellEl.innerHTML = cellEl.textContent;
        }
      }
    }

    const conflictCells = state.conflictKeys.length
      ? state.conflictKeys
      : getConflictingCells();
    highlightConflicts(conflictCells.map((key) => key.split(',').map(Number)));

    if (statusEl) {
      statusEl.textContent = state.statusText || '';
      statusEl.className = `message ${state.statusKind || ''}`.trim();
    }
  }

  function isPeerCell(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) {
      return true;
    }
    return r1 === r2 || c1 === c2 || (Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3));
  }

  function setPuzzle(data) {
    state.puzzle = data.puzzle.map((row) => [...row]);
    state.solution = data.solution.map((row) => [...row]);
    state.difficulty = data.difficulty || 'easy';
    state.locked = new Set((data.locked || []).map((cell) => `${cell[0]},${cell[1]}`));
    state.hints = new Set();
    state.notes = new Map();
    state.selected = null;
    state.conflictKeys = [];
    state.statusText = '';
    state.statusKind = '';
    render();
    if (state.changeCallbacks.length) {
      state.changeCallbacks.forEach((cb) => cb());
    }
  }

  function getBoard() {
    return state.puzzle.map((row) => [...row]);
  }

  function getSolution() {
    return state.solution.map((row) => [...row]);
  }

  function getDifficulty() {
    return state.difficulty;
  }

  function getSelected() {
    return state.selected ? { ...state.selected } : null;
  }

  function selectCell(r, c) {
    state.selected = { r, c };
    render();
    if (state.selectCallbacks.length) {
      state.selectCallbacks.forEach((cb) => cb(r, c));
    }
  }

  function isLocked(r, c) {
    return state.locked.has(getCellKey(r, c));
  }

  function lockCell(r, c, v) {
    if (state.puzzle[r][c] === 0) {
      state.puzzle[r][c] = v;
      state.locked.add(getCellKey(r, c));
      state.hints.add(getCellKey(r, c));
      render();
      return true;
    }
    return false;
  }

  function enterValue(v) {
    if (!state.selected) {
      return false;
    }

    const { r, c } = state.selected;
    if (isLocked(r, c)) {
      return false;
    }

    if (state.notesMode) {
      const key = getCellKey(r, c);
      const noteSet = new Set(state.notes.get(key) || []);
      if (noteSet.has(v)) {
        noteSet.delete(v);
      } else {
        noteSet.add(v);
      }
      if (noteSet.size) {
        state.notes.set(key, noteSet);
      } else {
        state.notes.delete(key);
      }
      state.conflictKeys = [];
      state.statusText = '';
      state.statusKind = '';
      render();
      return true;
    }

    const key = getCellKey(r, c);
    const placementConflicts = getPlacementConflictCells(r, c, v);
    if (placementConflicts.length) {
      state.conflictKeys = placementConflicts;
      state.statusText = 'Invalid move';
      state.statusKind = 'error';
      state.notes.delete(key);
      render();
      return false;
    }

    state.puzzle[r][c] = v;
    state.notes.delete(key);
    state.conflictKeys = [];
    render();
    if (state.changeCallbacks.length) {
      state.changeCallbacks.forEach((cb) => cb());
    }
    return true;
  }

  function eraseSelected() {
    if (!state.selected) {
      return false;
    }

    const { r, c } = state.selected;
    if (isLocked(r, c)) {
      return false;
    }

    state.puzzle[r][c] = 0;
    state.notes.delete(getCellKey(r, c));
    state.conflictKeys = [];
    render();
    if (state.changeCallbacks.length) {
      state.changeCallbacks.forEach((cb) => cb());
    }
    return true;
  }

  function setNotesMode(on) {
    state.notesMode = on;
  }

  function isNotesMode() {
    return state.notesMode;
  }

  function highlightIncorrect(cells) {
    const keys = new Set(cells.map(([r, c]) => getCellKey(r, c)));
    Array.from(boardEl?.children || []).forEach((cell) => {
      const row = Number(cell.getAttribute('data-row'));
      const col = Number(cell.getAttribute('data-col'));
      const key = getCellKey(row, col);
      cell.classList.toggle('sudoku-board__cell--incorrect', keys.has(key));
    });
  }

  function setStatus(text, kind = '') {
    state.statusText = text;
    state.statusKind = kind;
    render();
  }

  function isComplete() {
    return state.puzzle.every((row, r) => row.every((value, c) => value === state.solution[r][c]));
  }

  function hintsUsed() {
    return state.hints.size;
  }

  function onChange(cb) {
    state.changeCallbacks.push(cb);
  }

  function onSelect(cb) {
    state.selectCallbacks.push(cb);
  }

  buildGrid();

  return {
    render,
    setPuzzle,
    getBoard,
    getSolution,
    getDifficulty,
    getSelected,
    selectCell,
    isLocked,
    lockCell,
    enterValue,
    eraseSelected,
    setNotesMode,
    isNotesMode,
    highlightIncorrect,
    setStatus,
    isComplete,
    hintsUsed,
    onChange,
    onSelect,
  };
}

export { createBoard };
