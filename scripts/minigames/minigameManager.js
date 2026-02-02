import { TechConnectionGame } from './techConnection.js';
import { IceCleaningGame } from './iceCleaning.js';
import { BatterySwapGame } from './batterySwap.js';
import { SignalTuneGame } from './signalTune.js';
import { FiberMazeGame } from './fiberMaze.js';
import { GroundingCheckGame } from './groundingCheck.js';
import { AlarmResetGame } from './alarmReset.js';
import { DoorSensorCalibGame } from './doorSensorCalib.js';

const MINIGAMES = [
  TechConnectionGame,
  IceCleaningGame,
  BatterySwapGame,
  SignalTuneGame,
  FiberMazeGame,
  GroundingCheckGame,
  AlarmResetGame,
  DoorSensorCalibGame,
];

export class MinigameManager {
  constructor({ modal, title, timer, body }) {
    this.modal = modal;
    this.title = title;
    this.timer = timer;
    this.body = body;
    this.isActive = false;
    this.controller = null;
  }

  async startRandom() {
    const Game = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
    return this.start(new Game());
  }

  async start(game) {
    this.isActive = true;
    this.modal.classList.remove('hidden');
    this.modal.hidden = false;
    this.title.textContent = game.title;
    this.body.innerHTML = '';

    const controller = new AbortController();
    this.controller = controller;
    const maxDuration = (game.duration ?? 20) + 5;
    const timeout = setTimeout(() => controller.abort(), maxDuration * 1000);

    let result = { success: false };
    try {
      result = await game.start({
        body: this.body,
        timerEl: this.timer,
        signal: controller.signal,
      });
    } catch (error) {
      console.error('Minigame error', error);
      controller.abort();
    }

    clearTimeout(timeout);
    this.modal.classList.add('hidden');
    this.modal.hidden = true;
    this.controller = null;
    this.isActive = false;
    return result;
  }

  abortActive() {
    if (this.controller) {
      this.controller.abort();
    }
  }
}
