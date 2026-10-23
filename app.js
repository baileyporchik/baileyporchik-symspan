(function () {
  "use strict";

  const GRID_SIZE = 8;
  const MEMORY_GRID_SIZE = 4;
  const MEMORY_LOCATION_COUNT = MEMORY_GRID_SIZE * MEMORY_GRID_SIZE;

  const app = {
    stage: document.getElementById("task-stage"),
    trialLabel: document.getElementById("trial-label")
  };

  const trialState = {
    trialIndex: 0,
    totalTrials: 5,
    currentSequence: [],
    currentGrid: [],
    recallSelections: [],
    stage: "intro",
    currentSymmetry: true,
    hitCount: 0
  };

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

  function renderRecallGrid(selected = []) {
    const cells = Array.from({ length: MEMORY_LOCATION_COUNT }, (_, index) => {
      const selectedCell = selected.includes(index);
      return `<button class="recall-cell${selectedCell ? " is-selected" : ""}" data-index="${index}" aria-label="Select memory location ${index}">${index + 1}</button>`;
    }).join("");

    return `<div class="recall-grid" role="grid" aria-label="Recall grid">${cells}</div>`;
  }

  function renderIntro() {
    app.stage.innerHTML = `
      <div class="centered">
        <div class="text-block">
          <h2>Ready to begin</h2>
          <p class="task-copy">You will view a symmetry judgment followed by a brief memory sequence. Then you will select the remembered locations in the grid.</p>
          <div class="button-row">
            <button class="action" id="start-task">Begin</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("start-task").addEventListener("click", () => {
      beginTrial();
    });
  }

  function beginTrial() {
    trialState.trialIndex += 1;
    trialState.currentSymmetry = Math.random() > 0.5;
    const length = Math.min(7, Math.max(2, trialState.trialIndex + 1));
    trialState.currentGrid = generateSymmetryGrid(trialState.currentSymmetry);
    trialState.currentSequence = generateMemorySequence(length);
    trialState.recallSelections = [];
    trialState.stage = "stimulus";

    app.trialLabel.textContent = `Trial ${trialState.trialIndex}`;

    app.stage.innerHTML = `
      <div class="stimulus-layout">
        <div class="box">
          <h2>Symmetry Judgment</h2>
          ${renderSymmetryGrid(trialState.currentGrid)}
          <div class="meta-row">
            <span class="meta-badge">Category: ${trialState.currentSymmetry ? "Symmetrical" : "Asymmetrical"}</span>
          </div>
        </div>

        <div class="box">
          <h2>Memory Sequence</h2>
          ${renderMemoryGrid(trialState.currentSequence)}
          <div class="meta-row">
            <span class="meta-badge">Sequence length: ${trialState.currentSequence.length}</span>
          </div>
        </div>
      </div>
      <div class="status-bar">Study the pattern, then recall the highlighted positions.</div>
    `;

    setTimeout(() => {
      showRecallPrompt();
    }, 1800);
  }

  function showRecallPrompt() {
    trialState.stage = "recall";
    app.stage.innerHTML = `
      <div class="centered">
        <div class="text-block">
          <h2>Recall</h2>
          <p class="task-copy">Select the positions you saw in the memory sequence. You may pick as many as the sequence length.</p>
          ${renderRecallGrid(trialState.recallSelections)}
          <div class="button-row">
            <button class="action" id="submit-recall">Submit</button>
          </div>
          <div class="status-bar" id="recall-status">Selected: 0</div>
        </div>
      </div>
    `;

    const recallStatus = document.getElementById("recall-status");
    const submitButton = document.getElementById("submit-recall");

    function updateRecallStatus() {
      recallStatus.textContent = `Selected: ${trialState.recallSelections.length}`;
    }

    app.stage.querySelectorAll(".recall-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        const index = Number(cell.dataset.index);
        if (trialState.recallSelections.includes(index)) {
          trialState.recallSelections = trialState.recallSelections.filter((value) => value !== index);
        } else {
          trialState.recallSelections.push(index);
        }
        app.stage.innerHTML = `
          <div class="centered">
            <div class="text-block">
              <h2>Recall</h2>
              <p class="task-copy">Select the positions you saw in the memory sequence. You may pick as many as the sequence length.</p>
              ${renderRecallGrid(trialState.recallSelections)}
              <div class="button-row">
                <button class="action" id="submit-recall">Submit</button>
              </div>
              <div class="status-bar" id="recall-status">Selected: ${trialState.recallSelections.length}</div>
            </div>
          </div>
        `;
        bindRecallInteractions();
      });
    });

    function bindRecallInteractions() {
      app.stage.querySelectorAll(".recall-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          const index = Number(cell.dataset.index);
          if (trialState.recallSelections.includes(index)) {
            trialState.recallSelections = trialState.recallSelections.filter((value) => value !== index);
          } else {
            trialState.recallSelections.push(index);
          }
          const recallStatusEl = document.getElementById("recall-status");
          recallStatusEl.textContent = `Selected: ${trialState.recallSelections.length}`;

          app.stage.querySelectorAll(".recall-cell").forEach((node) => {
            const value = Number(node.dataset.index);
            node.classList.toggle("is-selected", trialState.recallSelections.includes(value));
          });
        });
      });

      document.getElementById("submit-recall").addEventListener("click", () => {
        const correct = trialState.currentSequence.filter((value) => trialState.recallSelections.includes(value)).length;
        const exact = trialState.currentSequence.length === trialState.recallSelections.length &&
          trialState.currentSequence.every((value) => trialState.recallSelections.includes(value));

        trialState.hitCount += exact ? 1 : 0;

        app.stage.innerHTML = `
          <div class="centered">
            <div class="text-block">
              <h2>Trial complete</h2>
              <p class="task-copy">Correct remembered positions: ${correct} / ${trialState.currentSequence.length}. Exact sequence: ${exact ? "Yes" : "No"}.</p>
              <div class="meta-row">
                <span class="meta-badge">Total correct: ${trialState.hitCount}</span>
                <span class="meta-badge">Trial ${trialState.trialIndex}</span>
              </div>
              <div class="button-row">
                <button class="action" id="next-trial">Next trial</button>
              </div>
            </div>
          </div>
        `;

        document.getElementById("next-trial").addEventListener("click", () => {
          if (trialState.trialIndex >= trialState.totalTrials) {
            showComplete();
          } else {
            beginTrial();
          }
        });
      });
    }

    bindRecallInteractions();
    updateRecallStatus();
    submitButton.addEventListener("click", () => {
      const correct = trialState.currentSequence.filter((value) => trialState.recallSelections.includes(value)).length;
      const exact = trialState.currentSequence.length === trialState.recallSelections.length &&
        trialState.currentSequence.every((value) => trialState.recallSelections.includes(value));

      trialState.hitCount += exact ? 1 : 0;

      app.stage.innerHTML = `
        <div class="centered">
          <div class="text-block">
            <h2>Trial complete</h2>
            <p class="task-copy">Correct remembered positions: ${correct} / ${trialState.currentSequence.length}. Exact sequence: ${exact ? "Yes" : "No"}.</p>
            <div class="meta-row">
              <span class="meta-badge">Total correct: ${trialState.hitCount}</span>
              <span class="meta-badge">Trial ${trialState.trialIndex}</span>
            </div>
            <div class="button-row">
              <button class="action" id="next-trial">Next trial</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("next-trial").addEventListener("click", () => {
        if (trialState.trialIndex >= trialState.totalTrials) {
          showComplete();
        } else {
          beginTrial();
        }
      });
    });
  }

  function showComplete() {
    app.stage.innerHTML = `
      <div class="centered">
        <div class="text-block">
          <h2>Session complete</h2>
          <p class="task-copy">You finished the task. Your exact-sequence score is ${trialState.hitCount} out of ${trialState.totalTrials}.</p>
          <div class="button-row">
            <button class="action" id="restart-task">Restart</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("restart-task").addEventListener("click", () => {
      trialState.trialIndex = 0;
      trialState.hitCount = 0;
      renderIntro();
    });
  }

  renderIntro();
})();
