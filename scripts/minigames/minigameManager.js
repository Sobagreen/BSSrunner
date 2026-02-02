import { TechConnectionGame } from './techConnection.js';
import { IceCleaningGame } from './iceCleaning.js';
import { BatterySwapGame } from './batterySwap.js';
import { SignalTuneGame } from './signalTune.js';
import { FiberMazeGame } from './fiberMaze.js';

const MINIGAMES = [
  TechConnectionGame,
  IceCleaningGame,
  BatterySwapGame,
  SignalTuneGame,
  FiberMazeGame,
];

export class MinigameManager {
  constructor({ modal, title, timer, body }) {
    this.modal = modal;
    this.title = title;
    this.timer = timer;
    this.body = body;
    this.isActive = false;
  }

  async startRandom() {
    const Game = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
    return this.start(new Game());
  }

  async start(game) {
    this.isActive = true;
    this.modal.classList.remove('hidden');
    this.title.textContent = game.title;
    this.body.innerHTML = '';

    const result = await game.start({ body: this.body, timerEl: this.timer });
    this.modal.classList.add('hidden');
    this.isActive = false;
    return result;
  }
}
