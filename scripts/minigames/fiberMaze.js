export class FiberMazeGame {
  constructor() {
    this.title = 'Прокладка ВОЛС';
    this.duration = 18;
  }

  start({ body, timerEl, signal }) {
    return new Promise((resolve) => {
      let resolved = false;
      let remaining = this.duration;
      const maze = document.createElement('div');
      maze.className = 'maze';

      const layout = [
        '..........',
        '.####..#..',
        '.#..#..#..',
        '.#..####..',
        '.#........',
        '.#######..',
      ];

      const cells = [];
      layout.forEach((row, y) => {
        row.split('').forEach((cell, x) => {
          const div = document.createElement('div');
          div.className = 'maze-cell';
          if (cell === '#') div.classList.add('blocked');
          if (y === layout.length - 1 && x === layout[0].length - 1) div.classList.add('goal');
          div.dataset.x = String(x);
          div.dataset.y = String(y);
          maze.append(div);
          cells.push(div);
        });
      });

      const position = { x: 0, y: 0 };

      const updatePlayer = () => {
        cells.forEach((cell) => cell.classList.remove('player'));
        const cell = cells.find(
          (item) => Number(item.dataset.x) === position.x && Number(item.dataset.y) === position.y,
        );
        cell?.classList.add('player');
      };

      updatePlayer();
      body.append(
        createNotice('Двигайтесь стрелками, избегайте красных зон и доберитесь до цели за 18 секунд.'),
        maze,
      );

      const onKey = (event) => {
        const moves = {
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
        };
        if (!moves[event.key]) return;
        const [dx, dy] = moves[event.key];
        const next = { x: position.x + dx, y: position.y + dy };
        if (next.x < 0 || next.y < 0 || next.x >= layout[0].length || next.y >= layout.length) return;
        if (layout[next.y][next.x] === '#') {
          cleanup(false);
          return;
        }
        position.x = next.x;
        position.y = next.y;
        updatePlayer();
        if (position.x === layout[0].length - 1 && position.y === layout.length - 1) {
          cleanup(true);
        }
      };

      window.addEventListener('keydown', onKey);

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
        window.removeEventListener('keydown', onKey);
        resolve({ success });
      };

      signal?.addEventListener('abort', () => cleanup(false), { once: true });
    });
  }
}

function createNotice(text) {
  const div = document.createElement('div');
  div.className = 'notice';
  div.textContent = text;
  return div;
}
