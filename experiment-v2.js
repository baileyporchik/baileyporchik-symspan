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
    return grid.every((row) =>
      row.every((cell, col) => cell === row[GRID_SIZE - 1 - col])
    );
  }

  function renderSymmetryGrid(grid) {
    const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const filled = grid[row][col];
      return `<span class="symmetry-cell${filled ? " is-filled" : ""}"></span>`;
    }).join("");

    return `<div class="symmetry-grid" role="img" aria-label="Symmetry pattern">${cells}</div>`;
  }

  function generateMemorySequence(length, random = Math.random) {
    const positions = shuffle(
      Array.from({ length: MEMORY_LOCATION_COUNT }, (_, index) => index),
      random
    );
    return positions.slice(0, length);
  }

  function renderMemoryGrid(sequence) {
    const cells = Array.from({ length: MEMORY_LOCATION_COUNT }, (_, index) =>
      `<span class="memory-cell${sequence.includes(index) ? " is-highlighted" : ""}"></span>`
    ).join("");

    return `<div class="memory-grid" role="img" aria-label="Memory pattern">${cells}</div>`;
  }

  function updateTrial() {
    const symmetrical = Math.random() > 0.5;
    const grid = generateSymmetryGrid(symmetrical);
    const sequenceLength = 3;
    const sequence = generateMemorySequence(sequenceLength);

    document.getElementById("symmetry-output").innerHTML = renderSymmetryGrid(grid);
    document.getElementById("memory-output").innerHTML = renderMemoryGrid(sequence);

    document.getElementById("trial-label").textContent = "Trial 1";
    document.getElementById("sequence-label").textContent = "Sequence " + sequenceLength;
    document.getElementById("category-label").textContent =
      "Category: " + (symmetrical ? "Symmetry" : "Asymmetry");

    document.getElementById("status").textContent =
      isSymmetricalGrid(grid) === symmetrical
        ? "Task stimulus loaded"
        : "Task mismatch flagged";
  }

  updateTrial();
})();
