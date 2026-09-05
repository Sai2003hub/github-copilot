const LEADERBOARD_KEY = 'sudoku.leaderboard.v1';

/**
 * Read leaderboard entries from local storage.
 * @returns {Array<{name: string, seconds: number, difficulty: string, hints: number, when: number}>}
 */
function loadLeaderboard() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Persist leaderboard entries to local storage.
 * @param {Array<{name: string, seconds: number, difficulty: string, hints: number, when: number}>} entries
 */
function saveLeaderboard(entries) {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

/**
 * Add a new leaderboard entry while keeping only the top 10 results.
 * Entries are sorted by seconds ascending, then by timestamp ascending.
 * @param {{name: string, seconds: number, difficulty: string, hints: number, when?: number}} entry
 * @returns {{name: string, seconds: number, difficulty: string, hints: number, when: number}}
 */
function addEntry(entry) {
  const entries = loadLeaderboard();
  const normalized = {
    name: String(entry.name || 'Anonymous').slice(0, 20),
    seconds: Number(entry.seconds || 0),
    difficulty: String(entry.difficulty || 'easy'),
    hints: Number(entry.hints || 0),
    when: Number(entry.when || Date.now()),
  };

  entries.push(normalized);
  entries.sort((a, b) => a.seconds - b.seconds || a.when - b.when);
  saveLeaderboard(entries.slice(0, 10));
  return normalized;
}

/**
 * Determine whether a score qualifies for the top 10 for the given difficulty.
 * @param {number} seconds
 * @param {string} difficulty
 * @returns {boolean}
 */
function isTop10(seconds, difficulty) {
  const entries = loadLeaderboard().filter((entry) => entry.difficulty === difficulty);
  return entries.length < 10 || seconds <= entries[entries.length - 1].seconds;
}

/**
 * Clear all stored leaderboard entries.
 */
function clearLeaderboard() {
  window.localStorage.removeItem(LEADERBOARD_KEY);
}

/**
 * Render the current leaderboard into the supplied list element.
 * @param {HTMLElement | null} listEl
 */
function renderLeaderboard(listEl) {
  if (!listEl) {
    return;
  }

  const entries = loadLeaderboard();
  listEl.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('li');
    empty.className = 'leaderboard__item';
    empty.textContent = 'No scores yet';
    listEl.appendChild(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.className = 'leaderboard__item';

    const rank = document.createElement('strong');
    rank.textContent = String(index + 1);

    const meta = document.createElement('div');
    meta.className = 'leaderboard__meta';

    const name = document.createElement('span');
    name.textContent = entry.name;

    const details = document.createElement('span');
    details.textContent = `${entry.difficulty} · ${formatSeconds(entry.seconds)} · hints ${entry.hints}`;

    meta.append(name, details);

    const time = document.createElement('span');
    time.className = 'leaderboard__time';
    time.textContent = formatSeconds(entry.seconds);

    item.append(rank, meta, time);
    listEl.appendChild(item);
  });
}

/**
 * Format a number of seconds as M:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export {
  addEntry,
  clearLeaderboard,
  isTop10,
  loadLeaderboard,
  renderLeaderboard,
  saveLeaderboard,
};
