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
    symmetryAnswer: null,
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

  function renderSymmetryGrid(grid) {
    const cells = grid
      .flatMap((row) =>
        row.map((filled) => `<span class="symmetry-cell${filled ? " is-filled" : ""}"></span>`).join("")
      )
      .join("");

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
      return `<button class="recall-cell${selectedCell ? " is-selected" : ""}" data-index="${index}" aria-label="Select memory location ${index + 1}">${index + 1}</button>`;
    }).join("");

    return `<div class="recall-grid" role="grid" aria-label="Recall grid">${cells}</div>`;
  }

  function getTrialScore() {
    const correct = trialState.currentSequence.filter((value) => trialState.recallSelections.includes(value)).length;
    const exact =
      trialState.currentSequence.length === trialState.recallSelections.length &&
      trialState.currentSequence.every((value) => trialState.recallSelections.includes(value));

    return { correct, exact };
  }

  function renderIntro() {
    app.stage.innerHTML = `
      <div class="centered">
        <div class="text-block">
          <h2>Ready to begin</h2>
          <p class="task-copy">You will judge symmetry, study a memory grid, and then recall the highlighted positions.</p>
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
    trialState.symmetryAnswer = null;
    const length = Math.min(7, Math.max(2, trialState.trialIndex + 1));
    trialState.currentGrid = generateSymmetryGrid(trialState.currentSymmetry);
    trialState.currentSequence = generateMemorySequence(length);
    trialState.recallSelections = [];
    trialState.stage = "symmetry";

    app.trialLabel.textContent = `Trial ${trialState.trialIndex}`;
    showSymmetryPrompt();
  }

  function showSymmetryPrompt() {
    app.stage.innerHTML = `
      <div class="trial-panel">
        <div class="item-header">
          <h2>Symmetry Judgment</h2>
        </div>
        <div class="judgment-stage">
          <div class="box box-medium">
            ${renderSymmetryGrid(trialState.currentGrid)}
            <div class="meta-row">
              <span class="meta-badge">Category: ${trialState.currentSymmetry ? "Symmetrical" : "Asymmetrical"}</span>
            </div>
          </div>
        </div>
        <div class="choice-row">
          <button class="choice-button" data-answer="true">Symmetrical</button>
          <button class="choice-button" data-answer="false">Asymmetrical</button>
        </div>
      </div>
    `;

    app.stage.querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => {
        trialState.symmetryAnswer = button.dataset.answer === "true";
        setTimeout(() => {
          showMemoryPrompt();
        }, 250);
      });
    });
  }

  function showMemoryPrompt() {
    trialState.stage = "memory";
    app.stage.innerHTML = `
      <div class="trial-panel">
        <div class="item-header">
          <h2>Study</h2>
        </div>
        <div class="judgment-stage">
          <div class="box box-medium">
            ${renderMemoryGrid(trialState.currentSequence)}
            <div class="meta-row">
              <span class="meta-badge">Sequence length: ${trialState.currentSequence.length}</span>
            </div>
          </div>
        </div>
        <div class="status-bar">Memorize the highlighted positions.</div>
      </div>
    `;

    setTimeout(() => {
      showRecallPrompt();
    }, 1800);
  }

  function showRecallPrompt() {
    trialState.stage = "recall";
    app.stage.innerHTML = `
      <div class="trial-panel recall-panel">
        <div class="item-header">
          <h2>Recall</h2>
        </div>
        <p class="task-copy">Select the positions you saw in the memory grid. You must choose exactly ${trialState.currentSequence.length} locations.</p>
        ${renderRecallGrid(trialState.recallSelections)}
        <div class="button-row">
          <button class="action" id="submit-recall" disabled>Submit</button>
        </div>
        <div class="status-bar" id="recall-status">Selected: 0 / ${trialState.currentSequence.length}</div>
      </div>
    `;

    const recallStatus = document.getElementById("recall-status");
    const submitButton = document.getElementById("submit-recall");

    function updateRecallStatus() {
      const selectedCount = trialState.recallSelections.length;
      const ready = selectedCount === trialState.currentSequence.length;
      recallStatus.textContent = `Selected: ${selectedCount} / ${trialState.currentSequence.length}`;
      submitButton.disabled = !ready;
    }

    function bindRecallInteractions() {
      app.stage.querySelectorAll(".recall-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          const index = Number(cell.dataset.index);

          if (trialState.recallSelections.includes(index)) {
            trialState.recallSelections = trialState.recallSelections.filter((value) => value !== index);
          } else if (trialState.recallSelections.length < trialState.currentSequence.length) {
            trialState.recallSelections.push(index);
          }

          app.stage.querySelectorAll(".recall-cell").forEach((node) => {
            const value = Number(node.dataset.index);
            node.classList.toggle("is-selected", trialState.recallSelections.includes(value));
          });

          updateRecallStatus();
        });
      });

      submitButton.addEventListener("click", () => {
        if (trialState.recallSelections.length !== trialState.currentSequence.length) {
          return;
        }

        const { correct, exact } = getTrialScore();
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
