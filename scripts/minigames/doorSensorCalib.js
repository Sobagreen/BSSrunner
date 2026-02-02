export class DoorSensorCalibGame {
  constructor() {
    this.title = 'Калибровка датчиков двери';
    this.duration = 14;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      const sensors = ['Дверь 1', 'Дверь 2', 'Дверь 3'];
      const target = sensors.map(() => Math.random() > 0.5);
      const current = sensors.map(() => false);

      const hint = document.createElement('div');
      hint.className = 'notice';
      hint.innerHTML = `Установите состояние датчиков как в эталоне: <strong>${target
        .map((value, index) => `${sensors[index]} — ${value ? 'открыта' : 'закрыта'}`)
        .join(', ')}</strong>`;

      const grid = document.createElement('div');
      grid.className = 'sensor-grid';

      const toggles = sensors.map((sensor, index) => {
        const card = document.createElement('div');
        card.className = 'sensor-card';

        const label = document.createElement('div');
        label.textContent = sensor;

        const toggle = document.createElement('button');
        toggle.className = 'toggle';
        toggle.textContent = 'Закрыта';
        toggle.addEventListener('click', () => {
          current[index] = !current[index];
          updateToggle(toggle, current[index]);
          if (current.every((value, idx) => value === target[idx])) {
            cleanup(true);
          }
        });

        card.append(label, toggle);
        grid.append(card);
        return toggle;
      });

      const updateToggle = (toggle, isOpen) => {
        toggle.classList.toggle('active', isOpen);
        toggle.textContent = isOpen ? 'Открыта' : 'Закрыта';
      };

      toggles.forEach((toggle, index) => updateToggle(toggle, current[index]));

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
