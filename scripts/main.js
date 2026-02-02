import { Runner } from './runner.js';
import { MinigameManager } from './minigames/minigameManager.js';
import { Multiplayer } from './multiplayer.js';

const elements = {
  distance: document.getElementById('distance'),
  speed: document.getElementById('speed'),
  lives: document.getElementById('lives'),
  lane: document.getElementById('lane'),
  startScreen: document.getElementById('start-screen'),
  startBtn: document.getElementById('start-btn'),
  gameOver: document.getElementById('game-over'),
  bestScore: document.getElementById('best-score'),
  restartBtn: document.getElementById('restart-btn'),
  menuBtn: document.getElementById('menu-btn'),
  pauseBtn: document.getElementById('pause-btn'),
};

const canvas = document.getElementById('runner-canvas');
const minigameModal = document.getElementById('minigame-modal');
const minigameTitle = document.getElementById('minigame-title');
const minigameTimer = document.getElementById('minigame-timer');
const minigameBody = document.getElementById('minigame-body');

const minigameManager = new MinigameManager({
  modal: minigameModal,
  title: minigameTitle,
  timer: minigameTimer,
  body: minigameBody,
});

const runner = new Runner({
  canvas,
  onStats: updateHud,
  onLaneChange: (lane) => (elements.lane.textContent = String(lane + 1)),
  onMinigame: () => startMinigame(),
  onGameOver: showGameOver,
});

const multiplayer = new Multiplayer({
  statusEl: document.getElementById('mp-status'),
  selfEl: document.getElementById('mp-self'),
  remoteEl: document.getElementById('mp-remote'),
  connectBtn: document.getElementById('connect-btn'),
  nameInput: document.getElementById('player-name'),
  serverInput: document.getElementById('server-url'),
});

function updateHud(stats) {
  elements.distance.textContent = Math.floor(stats.distance);
  elements.speed.textContent = stats.speed.toFixed(1);
  elements.lives.textContent = stats.lives;
  multiplayer.updateSelf(stats);
}

async function startMinigame() {
  runner.pause();
  try {
    const result = await minigameManager.startRandom();
    if (!result.success) {
      runner.loseLife();
    }
  } finally {
    runner.resume();
  }
}

function showGameOver(finalScore) {
  elements.gameOver.classList.remove('hidden');
  elements.startScreen.classList.add('hidden');
  elements.bestScore.textContent = Math.floor(finalScore);
  multiplayer.finish(finalScore);
}

function resetToMenu() {
  elements.gameOver.classList.add('hidden');
  elements.startScreen.classList.remove('hidden');
}

elements.startBtn.addEventListener('click', () => {
  elements.startScreen.classList.add('hidden');
  elements.gameOver.classList.add('hidden');
  runner.start();
});

elements.restartBtn.addEventListener('click', () => {
  elements.gameOver.classList.add('hidden');
  runner.start();
});

elements.menuBtn.addEventListener('click', () => {
  runner.stop();
  resetToMenu();
});

elements.pauseBtn.addEventListener('click', () => {
  if (runner.isPaused) {
    runner.resume();
    elements.pauseBtn.textContent = 'Пауза';
  } else {
    runner.pause();
    elements.pauseBtn.textContent = 'Продолжить';
  }
});

const controlPad = document.querySelector('.control-pad');
const actionHandlers = {
  left: () => runner.handleInput({ code: 'ArrowLeft' }),
  right: () => runner.handleInput({ code: 'ArrowRight' }),
  jump: () => runner.handleInput({ code: 'Space' }),
  duck: (isRelease) => runner.handleInput({ code: 'ArrowDown' }, isRelease),
};
let duckPressed = false;

controlPad?.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('.control-btn');
  if (!button || minigameManager.isActive || elements.startScreen.classList.contains('hidden') === false) {
    return;
  }
  event.preventDefault();
  const action = button.dataset.action;
  if (action === 'duck') {
    actionHandlers.duck(false);
    duckPressed = true;
  } else {
    actionHandlers[action]?.();
  }
});

const handleControlRelease = (event) => {
  const button = event.target.closest?.('.control-btn');
  if (!button) {
    if (duckPressed) {
      actionHandlers.duck(true);
      duckPressed = false;
    }
    return;
  }
  event.preventDefault();
  if (button.dataset.action === 'duck') {
    actionHandlers.duck(true);
    duckPressed = false;
  }
};

controlPad?.addEventListener('pointerup', handleControlRelease);
controlPad?.addEventListener('pointerleave', handleControlRelease);
controlPad?.addEventListener('pointercancel', handleControlRelease);
window.addEventListener('pointerup', handleControlRelease);
window.addEventListener('pointercancel', handleControlRelease);

window.addEventListener('keydown', (event) => {
  if (minigameManager.isActive && event.code === 'Escape') {
    minigameManager.abortActive();
    return;
  }
  if (elements.startScreen.classList.contains('hidden') && !minigameManager.isActive) {
    runner.handleInput(event);
  }
});

window.addEventListener('keyup', (event) => {
  if (elements.startScreen.classList.contains('hidden') && !minigameManager.isActive) {
    runner.handleInput(event, true);
  }
});

runner.drawIdle();
