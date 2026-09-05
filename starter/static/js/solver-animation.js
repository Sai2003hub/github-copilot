function createSolverAnimation(boardApi) {
  let cancelled = false;
  let animationFrame = null;

  function stop() {
    cancelled = true;
    if (animationFrame !== null) {
      window.clearTimeout(animationFrame);
      animationFrame = null;
    }
  }

  function animate(board, solution) {
    cancelled = false;
    const cells = [];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (board[row][col] === 0) {
          cells.push([row, col]);
        }
      }
    }

    const step = (index) => {
      if (cancelled) {
        return;
      }
      if (index >= cells.length) {
        boardApi.setPuzzle({
          puzzle: solution.map((row) => [...row]),
          solution: solution.map((row) => [...row]),
          difficulty: boardApi.getDifficulty(),
          locked: [],
        });
        return;
      }
      const [row, col] = cells[index];
      boardApi.setStatus(`Solving… checking (${row + 1}, ${col + 1})`, 'success');
      boardApi.render();
      boardApi.selectCell?.(row, col);
      animationFrame = window.setTimeout(() => {
        boardApi.setPuzzle({
          puzzle: board.map((row) => [...row]),
          solution: solution.map((row) => [...row]),
          difficulty: boardApi.getDifficulty(),
          locked: [],
        });
        animationFrame = window.setTimeout(() => {
          step(index + 1);
        }, 140);
      }, 140);
    };

    step(0);
  }

  return { animate, stop };
}

export { createSolverAnimation };
