const STORAGE_KEY = 'sudoku.theme';

function getPreferredTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function initTheme() {
  const storedTheme = getStoredTheme();
  const theme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : getPreferredTheme();

  applyTheme(theme);

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'light'
      : 'dark';
    applyTheme(nextTheme);

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }
  });
}

export { initTheme };
