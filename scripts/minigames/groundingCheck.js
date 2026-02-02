export class GroundingCheckGame {
  constructor() {
    this.title = 'Проверка заземления';
    this.duration = 14;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      const nodes = ['A1', 'A2', 'B1', 'B2'];
      const route = nodes.sort(() => 0.5 - Math.random()).slice(0, 4);
      let step = 0;

      const hint = document.createElement('div');
      hint.className = 'notice';
      hint.innerHTML = `Соедините контур по маршруту: <strong>${route.join(' → ')}</strong>`;

      const grid = document.createElement('div');
      grid.className = 'node-grid';

      const buttons = nodes.map((node) => {
        const btn = document.createElement('button');
        btn.className = 'node-button';
        btn.textContent = `Контакт ${node}`;
        btn.dataset.node = node;
        btn.addEventListener('click', () => {
          if (btn.dataset.node === route[step]) {
            step += 1;
            updateActive();
            if (step === route.length) {
              cleanup(true);
            }
          } else {
            cleanup(false);
          }
        });
        grid.append(btn);
        return btn;
      });

      const updateActive = () => {
        buttons.forEach((btn) => btn.classList.remove('active'));
        const next = buttons.find((btn) => btn.dataset.node === route[step]);
        next?.classList.add('active');
      };

      updateActive();
      body.append(hint, grid);

      const timer = setInterval(() => {
        remaining -= 1;
        timerEl.textContent = String(remaining);
        if (remaining <= 0) {
          cleanup(false);
        }
      }, 1000);

      timerEl.textContent = String(remaining);

      const cleanup = (success) => {
        if (resolved) return;
        resolved = true;
        clearInterval(timer);
        resolve({ success });
      };

      signal?.addEventListener('abort', () => cleanup(false), { once: true });
    });
  }
}
