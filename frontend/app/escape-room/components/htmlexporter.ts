export interface Stage {
  title: string;
  description: string;
  solution: string;
  stageImage: string;
}

export function exportHTML(
  roomName: string,
  stages: Stage[],
  timerMinutes: number = 30,
  uniqueId: string | number   // ← allow either
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const safeStages = JSON.stringify(stages)
    .replace(/</g, "\\u003C")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  // 👇 NOTE: removed the accidental duplicate `const html =` block
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${roomName}</title>
  <meta name="escape-room-id" content="${String(uniqueId)}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #4ca1af, #2d7a8a);
      min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;
    }
    .container { background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 800px; width: 100%; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4ca1af, #2d7a8a); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 32px; margin-bottom: 20px; }
    .timer-section { background: rgba(173, 216, 230, 0.3); padding: 20px; text-align: center; border-bottom: 2px solid #4ca1af; }
    .timer-display { font-size: 36px; font-weight: bold; font-family: monospace; color: white; margin: 10px 0; }
    .timer-controls { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .timer-controls button {
      padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; background: #4ca1af; color: white; transition: opacity 0.2s;
    }
    .timer-controls button:hover { opacity: 0.9; }
    .content { padding: 40px; background: white; }
    .stages { position: relative; z-index: 1; }
    .stage {
      background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #4ca1af; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: none;
    }
    .stage.active { display: block; }
    .stage.completed { background: #e8f5e9; border-left-color: #4caf50; }
    .stage h3 { color: #4ca1af; margin-bottom: 10px; font-size: 18px; }
    .stage p { color: #666; line-height: 1.5; margin-bottom: 15px; }
    .stage-counter { color: #4ca1af; font-weight: bold; margin-bottom: 10px; }
    .stage-image { display: block; max-width: 100%; height: auto; max-height: 300px, object-fit: contain; border-radius: 8px; margin-bottom: 0 auto 15px; }
    .code-input {
      width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 14px; margin-top: 10px; color: #000; background: #fff; min-height: 150px; resize: vertical;
    }
    .submit-btn {
      background: #4ca1af; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px; transition: opacity 0.2s;
    }
    .submit-btn:hover { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .nav-buttons {
      display: flex; gap: 10px; justify-content: space-between; margin-top: 20px;
    }
    .nav-btn {
      background: #4ca1af; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;
    }
    .nav-btn:hover:not(:disabled) { opacity: 0.9; }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .feedback { margin-top: 10px; padding: 10px; border-radius: 4px; font-weight: bold; }
    .success { background: #4caf50; color: white; }
    .error { background: #f44336; color: white; }
    .game-over {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .game-over-message {
      background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px;
    }
    .game-over-message h2 { font-size: 32px; margin-bottom: 20px; color: #4ca1af; }
    .game-over-message button {
      background: #4ca1af; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${roomName}</h1>
      <div class="timer-section">
        <div class="timer-display" id="timerDisplay">00:${String(timerMinutes).padStart(2, '0')}:00</div>
        <div class="timer-controls">
          <button onclick="startTimer()">Start</button>
          <button onclick="pauseTimer()">Pause</button>
          <button onclick="resetTimer()">Reset</button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="stages" id="stagesContainer"></div>
    </div>
  </div>

  <script>
    const stages = ${safeStages};
    let timerInterval = null;
    let totalSeconds = ${timerMinutes * 60};
    let completedStages = new Set();
    let currentStageIndex = 0;

    function updateTimerDisplay() {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      document.getElementById('timerDisplay').textContent =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    }

    function startTimer() {
      if (timerInterval) return;
      timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
          totalSeconds--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          showGameOver(false);
        }
      }, 1000);
    }

    function pauseTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function resetTimer() {
      pauseTimer();
      totalSeconds = ${timerMinutes * 60};
      updateTimerDisplay();
    }

    function renderStages() {
      const container = document.getElementById('stagesContainer');
      container.innerHTML = stages.map((stage, index) => {
        const isCompleted = completedStages.has(index);
        return \`
          <div class="stage \${index === 0 ? 'active' : ''} \${isCompleted ? 'completed' : ''}" id="stage-\${index}">
            <div class="stage-counter">Stage \${index + 1} of \${stages.length}</div>
            <h3>\${stage.title}</h3>
            \${stage.stageImage ? \`<img src="\${stage.stageImage}" alt="\${stage.title}" class="stage-image" />\` : ''}
            <p>\${stage.description}</p>
            <textarea class="code-input" id="code-\${index}" placeholder="Enter your solution code here..." \${isCompleted ? 'disabled' : ''}></textarea>
            <button id="submit-\${index}" class="submit-btn" onclick="checkSolution(\${index})" \${isCompleted ? 'disabled' : ''}>Submit Answer</button>
            <div id="feedback-\${index}"></div>
            <div class="nav-buttons">
              <button class="nav-btn" onclick="previousStage()" \${index === 0 ? 'disabled' : ''}>← Previous</button>
              <button class="nav-btn" onclick="nextStage()" \${index === stages.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function showStage(index) {
      if (index < 0 || index >= stages.length) return;
      currentStageIndex = index;
      document.querySelectorAll('.stage').forEach(el => el.classList.remove('active'));
      document.getElementById('stage-' + index).classList.add('active');
    }

    function previousStage() {
      if (currentStageIndex > 0) showStage(currentStageIndex - 1);
    }

    function nextStage() {
      if (currentStageIndex < stages.length - 1) showStage(currentStageIndex + 1);
    }

    function checkSolution(index) {
      const userCode = document.getElementById('code-' + index).value.trim();
      const correctCode = stages[index].solution.trim();
      const feedbackDiv = document.getElementById('feedback-' + index);

      if (userCode === correctCode) {
        feedbackDiv.innerHTML = '<div class="feedback success">✓ Correct! Stage complete.</div>';
        completedStages.add(index);
        document.getElementById('stage-' + index).classList.add('completed');
        document.getElementById('code-' + index).disabled = true;
        document.getElementById('submit-' + index).disabled = true;

        if (completedStages.size === stages.length) {
          setTimeout(() => showGameOver(true), 1500);
        } else {
          setTimeout(() => nextStage(), 1000);
        }
      } else {
        feedbackDiv.innerHTML = '<div class="feedback error">✗ Incorrect. Try again!</div>';
      }
    }

    function showGameOver(won) {
      const message = won
        ? '<h2>You Escaped!</h2><p>Congratulations! You\\'ve completed all stages!</p>'
        : '<h2>Time\\'s Up!</h2><p>You didn\\'t escape in time. Better luck next time!</p>';
      document.body.innerHTML += \`<div class="game-over"><div class="game-over-message">\${message}<button onclick="location.reload()">Play Again</button></div></div>\`;
    }

    renderStages();
    updateTimerDisplay();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${roomName}-${String(uniqueId)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
