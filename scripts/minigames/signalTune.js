export class SignalTuneGame {
  constructor() {
    this.title = 'Настройка уровня сигнала';
    this.duration = 18;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      let stableTime = 0;

      const info = document.createElement('div');
      info.className = 'notice';
      info.textContent = 'Выставьте уровень сигнала в зелёную зону (-95…-85 dBm) и удерживайте 3 секунды.';

      const meter = document.createElement('div');
      meter.className = 'signal-meter';

      const valueLabel = document.createElement('div');
      valueLabel.textContent = 'Текущий уровень: -100 dBm';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = -110;
      slider.max = -70;
      slider.value = -100;

      const bar = document.createElement('div');
      bar.className = 'signal-bar';

      const zones = document.createElement('div');
      zones.className = 'signal-zone';
      zones.innerHTML = '<span>-110 dBm</span><span>-95</span><span>-85</span><span>-70 dBm</span>';

      meter.append(valueLabel, slider, bar, zones);
      body.append(info, meter);

      const tick = () => {
        const jitter = Math.round((Math.random() - 0.5) * 3);
        const value = Number(slider.value) + jitter;
        valueLabel.textContent = `Текущий уровень: ${value} dBm`;

        if (value >= -95 && value <= -85) {
          stableTime += 1;
          if (stableTime >= 3) {
            cleanup(true);
          }
        } else if (value <= -110) {
          cleanup(false);
        } else {
          stableTime = 0;
        }
      };

      const interval = setInterval(tick, 1000);

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
        clearInterval(interval);
        clearInterval(timer);
        resolve({ success });
      };

      signal?.addEventListener('abort', () => cleanup(false), { once: true });
    });
  }
}
