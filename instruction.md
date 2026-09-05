# Instruction File for GitHub Copilot

> This file gives Copilot context about the style, structure, and standards to
> follow when assisting with this Sudoku Flask project. Copilot (and any other
> AI pair-programmer) should treat this document as authoritative for code
> style, project layout, and acceptance criteria.

## Project Overview

A refactored Python/Flask Sudoku game with:

- Difficulty selector (Easy / Medium / Hard)
- Puzzle generator that always produces a **uniquely solvable** puzzle
- Real-time validation with visual conflict highlighting
- Hint button (fills one correct cell, then locks it)
- Check button (highlights incorrect entries)
- Countdown/stopwatch timer
- Top 10 leaderboard persisted in browser `localStorage`
- Light/Dark mode toggle
- Responsive layout (mobile-first), accessible (WCAG 2.1 AA target)

## Tech Stack

- **Backend:** Python 3.10+, Flask 3.x
- **Frontend:** Vanilla HTML/CSS/JS (no JS framework required)
- **Testing:** pytest + pytest-cov
- **Linting:** ruff (line length 100)
- **Persistence:** Browser `localStorage` for the leaderboard; server keeps no
  per-user state (stateless puzzle API).

## Project Layout

```
github-copilot-python/
├── app.py                 # Flask entrypoint — routes only, no business logic
├── requirements.txt
├── pytest.ini
├── instruction.md         # this file
├── README.md
├── src/
│   ├── __init__.py
│   ├── sudoku.py          # public Puzzle API
│   ├── generator.py       # generate full boards + carve puzzle
│   ├── solver.py          # backtracking solver + uniqueness check
│   ├── validator.py       # move validation + conflict detection
│   └── difficulty.py      # difficulty -> prefilled cell count mapping
├── tests/
│   ├── __init__.py
│   ├── test_generator.py
│   ├── test_solver.py
│   ├── test_validator.py
│   └── test_routes.py
├── templates/
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/
│       ├── app.js         # bootstraps the UI
│       ├── board.js       # render + cell interactions
│       ├── timer.js
│       ├── hint.js
│       ├── check.js
│       ├── leaderboard.js # localStorage Top 10
│       └── theme.js       # dark/light toggle
└── Screenshots/           # Copilot conversation screenshots
```

## Code Style

- **Python**
  - `snake_case` for functions/variables, `PascalCase` for classes.
  - Type hints on every public function.
  - Docstrings (Google style) on every public function.
  - Max line length: 100.
  - No `print()` in library code — use the `logging` module.
  - All exceptions must be caught explicitly; never use bare `except:`.
  - Pure functions in `src/` — no Flask imports in `src/`.
- **JavaScript**
  - ES2020+, modules via `<script type="module">`.
  - `camelCase` for variables, `PascalCase` for classes.
  - JSDoc comments on exported functions.
  - No global state mutation outside of an explicit module export.
- **CSS**
  - BEM-ish naming: `.sudoku-board`, `.sudoku-board__cell--locked`.
  - Use CSS custom properties for theming (`--bg`, `--fg`, `--accent`, ...).
  - Mobile-first: default styles target ≤ 600px, `@media (min-width: ...)` for larger.

## Copilot Workflow Rules

1. **Start broad, narrow later.** Tackle the biggest architectural changes first
   (project layout, puzzle generator), then refine UI details.
2. **Approve/Reject as you go.** Never stack unreviewed suggestions.
3. **One chat = one problem.** Open a fresh Copilot chat when context drifts.
4. **Evaluate every suggestion.** Reject anything that:
   - Introduces a framework we did not agree on (React, Bootstrap, etc.)
   - Skips type hints or docstrings
   - Adds stateful server logic where the spec says stateless
   - Breaks existing tests
5. **Take over when stuck.** After ~2 failed iterations, drive manually and let
   Copilot only do inline completions.
6. **Tests first.** Before any refactor, ensure the baseline test suite is green.
   Save the green run as `Screenshots/initial_tests.png`.

## Acceptance Checklist

- [ ] `pytest` exits 0 from project root
- [ ] `python app.py` serves the game at http://127.0.0.1:5000
- [ ] Easy/Medium/Hard each produce puzzles with a **unique** solution
- [ ] Prefilled cells are locked (read-only, visually distinct)
- [ ] Invalid moves highlight conflicts in real time
- [ ] Hint button fills exactly one correct cell and locks it
- [ ] Check button highlights all currently-incorrect entries
- [ ] Timer starts on first cell edit, stops on solve
- [ ] Top 10 saved in `localStorage` across sessions (name, time, difficulty, hints used)
- [ ] Dark mode toggle updates the whole UI and persists across reload
- [ ] Layout works on 360px mobile and 1440px desktop with no overflow
- [ ] 3×3 squares alternate in color in both themes
- [ ] `Screenshots/` contains prompts + Copilot responses for every milestone
