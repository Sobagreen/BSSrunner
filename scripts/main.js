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

function startMinigame() {
  runner.pause();
  minigameManager.startRandom().then((result) => {
    if (!result.success) {
      runner.loseLife();
    }
    runner.resume();
  });
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

window.addEventListener('keydown', (event) => {
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
