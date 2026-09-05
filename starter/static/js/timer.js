function createTimer(displayEl) {
  let intervalId = null;
  let startTime = 0;
  let elapsed = 0;

  function start() {
    if (intervalId !== null) {
      return;
    }
    startTime = Date.now() - elapsed * 1000;
    intervalId = window.setInterval(() => {
      elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (displayEl) {
        displayEl.textContent = format();
      }
    }, 1000);
  }

  function stop() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (displayEl) {
      displayEl.textContent = format();
    }
  }

  function reset() {
    stop();
    elapsed = 0;
    startTime = Date.now();
    if (displayEl) {
      displayEl.textContent = format();
    }
  }

  function elapsedSeconds() {
    return elapsed;
  }

  function format() {
    const totalSeconds = Math.max(0, elapsed);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  return { start, stop, reset, elapsedSeconds, format };
}

export { createTimer };
