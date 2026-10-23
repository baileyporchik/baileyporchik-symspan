(function () {
  "use strict";

  const GRID_SIZE = 8;
  const MEMORY_GRID_SIZE = 4;
  const MEMORY_LOCATION_COUNT = MEMORY_GRID_SIZE * MEMORY_GRID_SIZE;

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function generateSymmetryGrid(symmetrical, random = Math.random) {
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE / 2; col++) {
        const filled = random() < 0.5;
        grid[row][col] = filled;
        grid[row][GRID_SIZE - 1 - col] = filled;
      }
    }

    if (!symmetrical) {
      const row = Math.floor(random() * GRID_SIZE);
      const col = Math.floor(random() * (GRID_SIZE / 2));
      grid[row][col] = !grid[row][col];
    }

    return grid;
  }

  function isSymmetricalGrid(grid) {
    return grid.every((row) => row.every((cell, col) => cell === row[GRID_SIZE - 1 - col]));
  }

  function renderSymmetryGrid(grid) {
    const cells = grid.flatMap((row) =>
      row.map((filled) => `<span class="symmetry-cell${filled ? " is-filled" : ""}"></span>`).join("")
    ).join("");

    return `<div class="symmetry-grid" role="img" aria-label="Symmetry pattern">${cells}</div>`;
  }

  function generateMemorySequence(length, random = Math.random) {
    return shuffle(
      Array.from({ length: MEMORY_LOCATION_COUNT }, (_, index) => index),
      random
    ).slice(0, length);
  }

  function renderMemoryGrid(sequence) {
    const cells = Array.from({ length: MEMORY_LOCATION_COUNT }, (_, index) =>
      `<span class="memory-cell${sequence.includes(index) ? " is-highlighted" : ""}"></span>`
    ).join("");

    return `<div class="memory-grid" role="img" aria-label="Memory pattern">${cells}</div>`;
  }

  function showTrial(trialNumber) {
    const symmetrical = Math.random() > 0.5;
    const grid = generateSymmetryGrid(symmetrical);
    const sequenceLength = Math.min(7, Math.max(2, trialNumber + 1));
    const sequence = generateMemorySequence(sequenceLength);

    document.getElementById("symmetry-output").innerHTML = renderSymmetryGrid(grid);
    document.getElementById("memory-output").innerHTML = renderMemoryGrid(sequence);

    document.getElementById("trial-label").textContent = `Trial ${trialNumber}`;
    document.getElementById("category-label").textContent = `Category: ${symmetrical ? "Symmetrical" : "Asymmetrical"}`;
    document.getElementById("sequence-label").textContent = `Sequence: ${sequenceLength}`;

    const valid = isSymmetricalGrid(grid) === symmetrical;
    const statusText = valid ? "Stimulus displayed" : "Warning: task mismatch detected";
    document.getElementById("status").textContent = trialNumber >= 5 ? "Experiment complete" : statusText;
  }

  window.SymmetrySpan = Object.freeze({
    GRID_SIZE,
    MEMORY_GRID_SIZE,
    MEMORY_LOCATION_COUNT,
    generateSymmetryGrid,
    isSymmetricalGrid,
    renderSymmetryGrid,
    generateMemorySequence,
    renderMemoryGrid,
    showTrial
  });

  showTrial(1);
})();
