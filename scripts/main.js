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
  startOverlay: document.getElementById('start-overlay'),
  startBtnOverlay: document.getElementById('start-btn-overlay'),
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

minigameModal.classList.add('hidden');
minigameModal.hidden = true;

const minigameManager = new MinigameManager({
  modal: minigameModal,
  title: minigameTitle,
  timer: minigameTimer,
  body: minigameBody,
});

let gameStarted = false;

const setGameStarted = (value) => {
  gameStarted = value;
  document.body.dataset.gameStarted = value ? 'true' : 'false';
  if (!value) {
    minigameManager.abortActive();
    minigameModal.classList.add('hidden');
    minigameModal.hidden = true;
  }
};

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
  if (!gameStarted) return;
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
  setGameStarted(false);
  updateStartOverlay();
}

function resetToMenu() {
  elements.gameOver.classList.add('hidden');
  elements.startScreen.classList.remove('hidden');
  updateStartOverlay();
}

const startGame = () => {
  elements.startScreen.classList.add('hidden');
  elements.gameOver.classList.add('hidden');
  setGameStarted(true);
  runner.start();
  updateStartOverlay();
};

elements.startBtn.addEventListener('click', startGame);
elements.startBtnOverlay.addEventListener('click', startGame);

elements.restartBtn.addEventListener('click', () => {
  elements.gameOver.classList.add('hidden');
  setGameStarted(true);
  runner.start();
});

elements.menuBtn.addEventListener('click', () => {
  runner.stop();
  setGameStarted(false);
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

function updateStartOverlay() {
  if (!elements.startOverlay) return;
  const showOverlay = !elements.startScreen.classList.contains('hidden');
  elements.startOverlay.classList.toggle('hidden', !showOverlay);
}

updateStartOverlay();
runner.drawIdle();
