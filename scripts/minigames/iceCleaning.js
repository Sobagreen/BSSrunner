export class IceCleaningGame {
  constructor() {
    this.title = 'Стряхивание наледи с антенны';
    this.duration = 12;
  }

  start({ body, timerEl }) {
    return new Promise((resolve) => {
      let remaining = this.duration;
      let ice = 100;

      const info = document.createElement('div');
      info.className = 'notice';
      info.textContent = 'Кликайте или удерживайте кнопку мыши, чтобы убрать наледь.';

      const area = document.createElement('div');
      area.className = 'ice-area';
      area.innerHTML = '<div><strong>Наледь:</strong> <span id="ice-level">100%</span></div>';

      const progress = document.createElement('div');
      progress.className = 'progress';
      const progressFill = document.createElement('span');
      progress.append(progressFill);

      body.append(info, area, progress);

      const updateUI = () => {
        area.querySelector('#ice-level').textContent = `${Math.max(0, Math.round(ice))}%`;
        progressFill.style.width = `${100 - Math.max(0, Math.round(ice))}%`;
      };

      const onScrub = () => {
        ice -= 8;
        updateUI();
        if (ice <= 0) {
          cleanup(true);
        }
      };

      let holdInterval = null;
      area.addEventListener('mousedown', () => {
        holdInterval = setInterval(onScrub, 120);
      });
      area.addEventListener('mouseup', () => clearInterval(holdInterval));
      area.addEventListener('mouseleave', () => clearInterval(holdInterval));
      area.addEventListener('click', onScrub);

      const timer = setInterval(() => {
        remaining -= 1;
        ice = Math.min(100, ice + 3);
        timerEl.textContent = String(remaining);
        updateUI();
        if (remaining <= 0) {
          cleanup(ice <= 0);
        }
      }, 1000);

      timerEl.textContent = String(remaining);
      updateUI();

      const cleanup = (success) => {
        clearInterval(timer);
        clearInterval(holdInterval);
        resolve({ success });
      };
    });
  }
}
