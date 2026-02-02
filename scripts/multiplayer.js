export class Multiplayer {
  constructor({ statusEl, selfEl, remoteEl, connectBtn, nameInput, serverInput }) {
    this.statusEl = statusEl;
    this.selfEl = selfEl;
    this.remoteEl = remoteEl;
    this.connectBtn = connectBtn;
    this.nameInput = nameInput;
    this.serverInput = serverInput;
    this.socket = null;
    this.playerId = `player-${Math.random().toString(16).slice(2, 8)}`;

    this.connectBtn.addEventListener('click', () => this.connect());
  }

  connect() {
    const url = this.serverInput?.value;
    if (!url) {
      this.statusEl.textContent = 'Сервер не указан';
      return;
    }
    if (this.socket) {
      this.socket.close();
    }

    this.statusEl.textContent = 'Подключение...';
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      this.statusEl.textContent = 'Подключено. Ожидание второго инженера...';
      this.send({ type: 'join', playerId: this.playerId, name: this.nameInput.value || 'Инженер' });
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('MP parse error', error);
      }
    });

    this.socket.addEventListener('close', () => {
      this.statusEl.textContent = 'Соединение закрыто';
    });

    this.socket.addEventListener('error', () => {
      this.statusEl.textContent = 'Ошибка соединения';
    });
  }

  handleMessage(data) {
    if (data.type === 'state' && data.playerId !== this.playerId) {
      this.remoteEl.textContent = `${Math.floor(data.distance)} м, ${data.lives} ❤`;
      this.statusEl.textContent = 'Соперник подключен';
    }

    if (data.type === 'gameOver') {
      this.statusEl.textContent = `Игра завершена: победил ${data.winner || 'инженер'}`;
    }
  }

  updateSelf(stats) {
    this.selfEl.textContent = `${Math.floor(stats.distance)} м, ${stats.lives} ❤`;
    this.send({
      type: 'state',
      playerId: this.playerId,
      name: this.nameInput.value || 'Инженер',
      distance: stats.distance,
      lives: stats.lives,
    });
  }

  finish(score) {
    this.send({
      type: 'gameOver',
      playerId: this.playerId,
      name: this.nameInput.value || 'Инженер',
      distance: score,
    });
  }

  send(payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(payload));
  }
}
