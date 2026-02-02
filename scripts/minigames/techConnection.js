const MAPPING = {
  Y1: 'LTE1800',
  Y2: 'LTE2100',
  B1: 'LTE800',
  R1: 'LTE900',
  R2: 'LTE2300',
};

const COLORS = {
  Y: '#f7d154',
  B: '#4aa3ff',
  R: '#ff5f6f',
};

export class TechConnectionGame {
  constructor() {
    this.title = 'Подключение технологий к выводам';
    this.duration = 20;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      const ports = Object.keys(MAPPING);
      const count = 2 + Math.floor(Math.random() * 4);
      const selectedPorts = ports.sort(() => 0.5 - Math.random()).slice(0, count);
      const selectedTechs = selectedPorts.map((port) => MAPPING[port]);
      const techState = new Set();
      let selectedTech = null;
      let remaining = this.duration;

      const layout = document.createElement('div');
      layout.className = 'grid';
      layout.style.gridTemplateColumns = '1fr 1fr';

      const portList = document.createElement('div');
      portList.className = 'port-list';

      const techList = document.createElement('div');
      techList.className = 'tech-list';

      const hint = document.createElement('div');
      hint.className = 'notice';
      hint.innerHTML = `<strong>Схема:</strong> ${selectedPorts.map((port) => `${port} → ${MAPPING[port]}`).join(', ')}`;

      selectedPorts.forEach((port) => {
        const item = document.createElement('button');
        item.className = 'port-item';
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.background = COLORS[port[0]];
        const label = document.createElement('span');
        label.textContent = port;
        item.append(dot, label);
        item.addEventListener('click', () => {
          if (!selectedTech || item.classList.contains('connected')) return;
          const correct = MAPPING[port] === selectedTech;
          if (correct) {
            item.classList.add('connected');
            techState.add(selectedTech);
            selectedTech = null;
            techList.querySelectorAll('.tech-item').forEach((techItem) => techItem.classList.remove('active'));
            if (techState.size === selectedTechs.length) {
              cleanup(true);
            }
          } else {
            cleanup(false);
          }
        });
        portList.append(item);
      });

      selectedTechs.forEach((tech) => {
        const item = document.createElement('button');
        item.className = 'tech-item';
        item.textContent = tech;
        item.addEventListener('click', () => {
          if (techState.has(tech)) return;
          selectedTech = tech;
          techList.querySelectorAll('.tech-item').forEach((techItem) => techItem.classList.remove('active'));
          item.classList.add('active');
        });
        techList.append(item);
      });

      layout.append(portList, techList);
      body.append(hint, layout);

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
