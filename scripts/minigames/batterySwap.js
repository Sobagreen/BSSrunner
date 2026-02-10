export class BatterySwapGame {
  constructor() {
    this.title = 'Замена аккумулятора';
    this.duration = 15;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      let stage = 0;
      let errors = 0;

      const info = document.createElement('div');
      info.className = 'notice';
      info.textContent = 'Перетащите батарею по подсвеченным ячейкам: вверх → влево, затем вправо → вниз.';

      const grid = document.createElement('div');
      grid.className = 'battery-stage';

      const cells = Array.from({ length: 6 }).map((_, index) => {
        const cell = document.createElement('div');
        cell.className = 'battery-cell';
        cell.dataset.index = String(index);
        grid.append(cell);
        return cell;
      });

      const battery = document.createElement('div');
      battery.className = 'battery';
      battery.textContent = 'АКБ';
      cells[3].append(battery);

      body.append(info, grid);

      const stages = [
        [3, 0, 1],
        [1, 2, 5],
      ];

      const setActive = () => {
        cells.forEach((cell) => cell.classList.remove('active'));
        stages[stage].forEach((index) => cells[index].classList.add('active'));
      };

      setActive();

      let currentIndex = 0;
      let dragging = false;

      const onPointerDown = (event) => {
        event.preventDefault();
        dragging = true;
      };

      const onPointerUp = () => {
        dragging = false;
      };

      const onPointerMove = (event) => {
        if (!dragging) return;
        const target = event.target.closest('.battery-cell');
        if (!target) return;
        const targetIndex = Number(target.dataset.index);
        const expectedIndex = stages[stage][currentIndex + 1];

        if (targetIndex === expectedIndex) {
          target.append(battery);
          currentIndex += 1;
          if (currentIndex === stages[stage].length - 1) {
            stage += 1;
            if (stage > 1) {
              cleanup(true);
            } else {
              currentIndex = 0;
              setActive();
            }
          }
        } else if (targetIndex !== stages[stage][currentIndex]) {
          errors += 1;
          target.classList.add('shake');
          setTimeout(() => target.classList.remove('shake'), 300);
          if (errors >= 2) {
            cleanup(false);
          }
        }
      };

      battery.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      grid.addEventListener('pointermove', onPointerMove);

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
        battery.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        grid.removeEventListener('pointermove', onPointerMove);
        resolve({ success });
      };

      signal?.addEventListener('abort', () => cleanup(false), { once: true });
    });
  }
}
