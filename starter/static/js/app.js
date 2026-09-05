import { createBoard } from './board.js';
import { createTimer } from './timer.js';
import { initTheme } from './theme.js';
import { addEntry, clearLeaderboard, renderLeaderboard } from './leaderboard.js';
import { createSolverAnimation } from './solver-animation.js';

const difficultySelect = document.getElementById('difficulty');
const boardElement = document.getElementById('sudoku-board');
const messageElement = document.getElementById('message');
const timerElement = document.getElementById('timer');
const hintCountElement = document.getElementById('hint-count');
const newGameButton = document.getElementById('new-game');
const hintButton = document.getElementById('hint-btn');
const checkButton = document.getElementById('check-btn');
const notesButton = document.getElementById('notes-btn');
const eraseButton = document.getElementById('erase-btn');
const solveButton = document.getElementById('solve-btn');
const clearLeaderboardButton = document.getElementById('clear-leaderboard');
const leaderboardElement = document.getElementById('leaderboard-list');
const winDialog = document.getElementById('win-dialog');
const winForm = document.getElementById('win-form');
const winDifficulty = document.getElementById('win-difficulty');
const winTime = document.getElementById('win-time');
const winHints = document.getElementById('win-hints');
const playerNameInput = document.getElementById('player-name');
const numberButtons = Array.from(document.querySelectorAll('.number-pad__btn'));
const statusElement = document.getElementById('message');

let gameActive = false;
let activeDifficulty = 'easy';
let board;
let timer;
let solverAnimation;

function setStatus(text, kind = '') {
  if (statusElement) {
    statusElement.textContent = text;
    statusElement.className = `message ${kind}`.trim();
  }
}

function updateHintsCount() {
  if (hintCountElement) {
    hintCountElement.textContent = board?.hintsUsed() ?? 0;
  }
}

function handleNumberInput(value) {
  if (!gameActive) {
    return false;
  }
  const didEnter = board.enterValue(value);
  if (!didEnter) {
    return false;
  }
  timer.start();
  updateHintsCount();
  updateNumberPadStates();
  checkWinCondition();
  return true;
}

function handleKeydown(event) {
  const key = event.key;
  if (/^[1-9]$/.test(key)) {
    event.preventDefault();
    handleNumberInput(Number(key));
    return;
  }
  if (key === '0' || key === 'Backspace' || key === 'Delete') {
    event.preventDefault();
    board.eraseSelected();
    updateNumberPadStates();
    return;
  }
  if (key === 'n' || key === 'N') {
    event.preventDefault();
    toggleNotes();
    return;
  }
  if (key === 'h' || key === 'H') {
    event.preventDefault();
    requestHint();
    return;
  }
  if (key === 'ArrowLeft') {
    event.preventDefault();
    moveSelection(-1, 0);
    return;
  }
  if (key === 'ArrowRight') {
    event.preventDefault();
    moveSelection(1, 0);
    return;
  }
  if (key === 'ArrowUp') {
    event.preventDefault();
    moveSelection(0, -1);
    return;
  }
  if (key === 'ArrowDown') {
    event.preventDefault();
    moveSelection(0, 1);
    return;
  }
}

function moveSelection(deltaRow, deltaCol) {
  if (!board) {
    return;
  }
  const selected = board.getSelected?.();
  if (!selected) {
    board.selectCell?.(0, 0);
    return;
  }
  const nextRow = (selected.r + deltaRow + 9) % 9;
  const nextCol = (selected.c + deltaCol + 9) % 9;
  board.selectCell?.(nextRow, nextCol);
}

async function newGame() {
  const difficulty = difficultySelect?.value || activeDifficulty;
  activeDifficulty = difficulty;
  const response = await fetch(`/api/puzzle?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await response.json();
  board.setPuzzle(data);
  timer.reset();
  gameActive = true;
  updateHintsCount();
  updateNumberPadStates();
  setStatus(`New ${difficulty} puzzle loaded.`, 'success');
}

function requestHint() {
  if (!gameActive) {
    return;
  }
  fetch('/api/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: board.getBoard(), solution: board.getSolution() }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.row === -1) {
        setStatus('No empty cells left!', 'success');
        return;
      }
      const { row, col, value } = data;
      board.lockCell(row, col, value);
      updateHintsCount();
      updateNumberPadStates();
      timer.start();
      setStatus(`Hint: cell (${row + 1}, ${col + 1}) = ${value}`, 'success');
      checkWinCondition();
    });
}

function checkAnswers() {
  fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: board.getBoard(), solution: board.getSolution() }),
  })
    .then((response) => response.json())
    .then((data) => {
      board.render();
      if (!data.incorrect || data.incorrect.length === 0) {
        setStatus('All entries correct so far ✓', 'success');
        return;
      }
      board.highlightIncorrect(data.incorrect);
      setStatus(`${data.incorrect.length} incorrect cell(s) highlighted`, 'error');
    });
}

function checkWinCondition() {
  if (!board?.isComplete()) {
    return;
  }
  gameActive = false;
  timer.stop();
  setStatus('🎉 Solved! Nicely done.', 'success');
  if (winDifficulty) {
    winDifficulty.textContent = board.getDifficulty();
  }
  if (winTime) {
    winTime.textContent = timer.format();
  }
  if (winHints) {
    winHints.textContent = String(board.hintsUsed());
  }
  if (winDialog && typeof winDialog.showModal === 'function') {
    winDialog.showModal();
  } else {
    window.alert('You solved it!');
  }
}

function toggleNotes() {
  const nextValue = !board.isNotesMode();
  board.setNotesMode(nextValue);
  if (notesButton) {
    notesButton.setAttribute('aria-pressed', String(nextValue));
    notesButton.classList.toggle('btn--accent', nextValue);
    notesButton.classList.toggle('btn--ghost', !nextValue);
  }
  setStatus(nextValue ? 'Notes mode on' : 'Notes mode off', 'success');
}

function updateNumberPadStates() {
  if (!board) {
    return;
  }
  const counts = new Map();
  board.getBoard().forEach((row) => row.forEach((value) => {
    if (value > 0) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }));
  numberButtons.forEach((button) => {
    const value = Number(button.dataset.value);
    const complete = (counts.get(value) || 0) >= 9;
    button.classList.toggle('number-pad__btn--complete', complete);
  });
}

function initApp() {
  initTheme();
  board = createBoard(boardElement, messageElement);
  timer = createTimer(timerElement);
  solverAnimation = createSolverAnimation(board);
  board.onChange(() => updateHintsCount());
  board.onSelect(() => {
    if (!board) {
      return;
    }
    board.render();
  });
  board.setStatus('Choose a cell and start playing.', 'success');
  timer.reset();
  updateNumberPadStates();
  renderLeaderboard(leaderboardElement);
  newGame();

  if (newGameButton) {
    newGameButton.addEventListener('click', () => newGame());
  }
  if (hintButton) {
    hintButton.addEventListener('click', () => requestHint());
  }
  if (checkButton) {
    checkButton.addEventListener('click', () => checkAnswers());
  }
  if (notesButton) {
    notesButton.addEventListener('click', () => toggleNotes());
  }
  if (eraseButton) {
    eraseButton.addEventListener('click', () => {
      board.eraseSelected();
      updateNumberPadStates();
    });
  }
  if (solveButton) {
    solveButton.addEventListener('click', () => {
      if (!gameActive) {
        return;
      }
      solverAnimation.animate(board.getBoard(), board.getSolution());
    });
  }
  if (clearLeaderboardButton) {
    clearLeaderboardButton.addEventListener('click', () => {
      if (window.confirm('Clear the leaderboard?')) {
        clearLeaderboard();
        renderLeaderboard(leaderboardElement);
      }
    });
  }
  numberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.value);
      handleNumberInput(value);
    });
  });
  if (difficultySelect) {
    difficultySelect.addEventListener('change', () => newGame());
  }
  document.addEventListener('keydown', handleKeydown);
  if (winForm) {
    winForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const action = event.submitter?.value || 'skip';
      if (action === 'save') {
        const name = (playerNameInput?.value || '').trim();
        if (name) {
          addEntry({ name, seconds: timer.elapsedSeconds(), difficulty: board.getDifficulty(), hints: board.hintsUsed(), when: Date.now() });
          renderLeaderboard(leaderboardElement);
          if (playerNameInput) {
            playerNameInput.value = '';
          }
        }
      }
      winDialog?.close();
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
