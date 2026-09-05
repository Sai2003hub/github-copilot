// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let gameStarted = false;
let startTime = null;
let timerInterval = null;
let hintsUsed = 0;

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    document.getElementById('timer').innerText = formatTime(elapsed);
  }, 500);
}

function stopTimer() {
  if (!gameStarted) return;
  gameStarted = false;
  clearInterval(timerInterval);
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    if (i === 2 || i === 5) rowDiv.classList.add('block-bottom');
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      if (j === 2 || j === 5) input.classList.add('block-right');
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        validateCell(parseInt(e.target.dataset.row, 10), parseInt(e.target.dataset.col, 10));
        startTimer();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  return Array.from(boardDiv.getElementsByTagName('input'));
}

function readBoardFromInputs() {
  const inputs = getInputs();
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function markAllClean() {
  const inputs = getInputs();
  inputs.forEach(inp => {
    inp.classList.remove('incorrect');
  });
}

function validateCell(row, col) {
  const inputs = getInputs();
  const idx = row * SIZE + col;
  const val = inputs[idx].value;
  markAllClean();
  if (!val) return;
  // highlight conflicts
  for (let c = 0; c < SIZE; c++) {
    if (c === col) continue;
    const other = inputs[row * SIZE + c];
    if (other.value === val) {
      other.classList.add('incorrect');
      inputs[idx].classList.add('incorrect');
    }
  }
  for (let r = 0; r < SIZE; r++) {
    if (r === row) continue;
    const other = inputs[r * SIZE + col];
    if (other.value === val) {
      other.classList.add('incorrect');
      inputs[idx].classList.add('incorrect');
    }
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (r === row && c === col) continue;
      const other = inputs[r * SIZE + c];
      if (other.value === val) {
        other.classList.add('incorrect');
        inputs[idx].classList.add('incorrect');
      }
    }
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const inputs = getInputs();
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      inp.classList.remove('prefilled', 'incorrect', 'locked');
      inp.disabled = false;
      inp.value = '';
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled', 'locked');
      }
    }
  }
  markAllClean();
  hintsUsed = 0;
  document.getElementById('timer').innerText = '00:00';
  stopTimer();
}

async function newGame() {
  const diff = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(diff)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
  const board = readBoardFromInputs();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = 'var(--danger)';
    msg.innerText = data.error;
    return;
  }
  markAllClean();
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  const inputs = getInputs();
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (incorrect.has(idx)) inp.classList.add('incorrect');
  }
  if (incorrect.size === 0) {
    stopTimer();
    msg.style.color = 'var(--success)';
    msg.innerText = 'Congratulations! You solved it!';
    // prompt for leaderboard entry
    const name = prompt('You made the leaderboard! Enter your name:') || 'Anonymous';
    const elapsed = Date.now() - startTime;
    saveLeaderboardEntry({name, time: elapsed, difficulty: document.getElementById('difficulty').value, hints: hintsUsed});
    renderLeaderboard();
  } else {
    msg.style.color = 'var(--danger)';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function useHint() {
  const res = await fetch('/hint');
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = 'var(--danger)';
    msg.innerText = data.error;
    return;
  }
  const inputs = getInputs();
  const idx = data.row * SIZE + data.col;
  const inp = inputs[idx];
  inp.value = data.value;
  inp.disabled = true;
  inp.classList.add('locked');
  hintsUsed += 1;
  startTimer();
}

function saveLeaderboardEntry(entry) {
  const key = 'sudoku_leaderboard';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push(entry);
  list.sort((a,b) => a.time - b.time);
  localStorage.setItem(key, JSON.stringify(list.slice(0,10)));
}

function renderLeaderboard() {
  const key = 'sudoku_leaderboard';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const ul = document.getElementById('leaderboard-list');
  ul.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.innerText = `${item.name} — ${formatTime(item.time)} — ${item.difficulty} — hints:${item.hints}`;
    ul.appendChild(li);
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('sudoku_theme', theme);
}

window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', useHint);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = localStorage.getItem('sudoku_theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
  // apply saved theme
  applyTheme(localStorage.getItem('sudoku_theme') || 'light');
  renderLeaderboard();
  newGame();
});