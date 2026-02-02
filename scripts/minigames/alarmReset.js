export class AlarmResetGame {
  constructor() {
    this.title = 'Сброс аварийного аларма';
    this.duration = 16;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      const colors = [
        { id: 'red', label: 'Авария', color: '#ff5f6f' },
        { id: 'yellow', label: 'Сервис', color: '#ffb36a' },
        { id: 'green', label: 'Связь', color: '#5fe7a0' },
        { id: 'blue', label: 'Питание', color: '#4aa3ff' },
      ];

      const sequence = Array.from({ length: 4 }, () => colors[Math.floor(Math.random() * colors.length)].id);
      let inputIndex = 0;
      let acceptingInput = false;

      const hint = document.createElement('div');
      hint.className = 'notice';
      hint.textContent = 'Повторите последовательность индикаторов для сброса аварии.';

      const grid = document.createElement('div');
      grid.className = 'alarm-grid';

      const buttons = colors.map((item) => {
        const btn = document.createElement('button');
        btn.className = 'alarm-button';
        btn.style.borderColor = item.color;
        btn.textContent = item.label;
        btn.dataset.id = item.id;
        btn.addEventListener('click', () => {
          if (!acceptingInput) return;
          if (btn.dataset.id === sequence[inputIndex]) {
            inputIndex += 1;
            if (inputIndex === sequence.length) {
              cleanup(true);
            }
          } else {
            cleanup(false);
          }
        });
        grid.append(btn);
        return btn;
      });

      body.append(hint, grid);

      const flash = async () => {
        acceptingInput = false;
        for (const step of sequence) {
          const btn = buttons.find((button) => button.dataset.id === step);
          if (!btn) continue;
          btn.classList.add('flash');
          await delay(400);
          btn.classList.remove('flash');
          await delay(250);
        }
        acceptingInput = true;
      };

      flash();

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
