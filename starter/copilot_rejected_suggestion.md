# Copilot Conversation — Evaluating / Rejecting a Suggestion

## Context

After implementing the Hint button, I asked Copilot:

> "Help me store the current puzzle in a Flask session so the user can refresh without losing progress."

## Copilot's Suggestion (summary)

Copilot proposed:

1. Setting `app.secret_key` in `app.py`.
2. Storing the current `Puzzle` object in `flask.session["current_puzzle"]` on `GET /api/puzzle`.
3. Adding a `GET /api/current` route that returns the session-stored puzzle.
4. Modifying the frontend to call `/api/current` on page load instead of generating a new puzzle.

## Why I Rejected It

The project specification is explicit about a stateless puzzle API. Storing per-user game state in Flask sessions would:

1. Require secret-key management — `app.secret_key` needs to be a stable, cryptographically random value, not committed to the repo. That is a deployment burden the spec does not ask for.
2. Break horizontal scaling — sessions are stored in-memory by default, so two Flask workers behind a load balancer would lose the user's progress on the next request if it hit the other worker.
3. Complicate the test suite — `app.test_client()` would need `client.session_transaction()` setup in every test that exercises puzzle/hint/check endpoints, doubling the test boilerplate.
4. Conflict with the spec's data-persistence model — the spec says the leaderboard persists in `localStorage`. The puzzle itself does not need to survive a refresh; the player can simply press "New Game" for a fresh one.

## What I Did Instead

- Kept the source of truth for the current puzzle in the browser (`board.state` in `static/js/board.js`).
- The Flask API remains stateless: every request carries `{board, solution}` in its JSON body.
- The leaderboard persists in `localStorage` (`sudoku.leaderboard.v1`).
- If a player refreshes mid-game, they get a fresh puzzle — which is the expected UX for a Sudoku game.

## Lesson

Always re-read the spec before accepting architectural suggestions. Copilot's suggestion was technically sound for a different project, but it did not fit this project's constraints.
