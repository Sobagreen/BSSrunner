const OBSTACLE_TYPES = [
  { type: 'jump', color: '#5a3b2b', label: 'Яма' },
  { type: 'duck', color: '#2b5a3b', label: 'Кабель' },
  { type: 'lane', color: '#2b3b5a', label: 'Лужа' },
];

export class Runner {
  constructor({ canvas, onStats, onLaneChange, onMinigame, onGameOver }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStats = onStats;
    this.onLaneChange = onLaneChange;
    this.onMinigame = onMinigame;
    this.onGameOver = onGameOver;
    this.lastFrame = 0;
    this.isPaused = false;
    this.reset();
  }

  reset() {
    this.distance = 0;
    this.speed = 6;
    this.lives = 3;
    this.player = {
      lane: 1,
      y: 0,
      isJumping: false,
      isDucking: false,
      velocityY: 0,
    };
    this.obstacles = [];
    this.nextObstacle = 120;
    this.nextMinigame = this.randomMinigameDistance();
    this.minigameTriggered = false;
    this.isPaused = false;
  }

  start() {
    this.reset();
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
  }

  pause() {
    this.isPaused = true;
  }

  loseLife() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.onGameOver?.(this.distance);
      this.running = false;
    }
  }

  handleInput(event, isKeyUp = false) {
    if (isKeyUp) {
      if (event.code === 'ArrowDown') {
        this.player.isDucking = false;
      }
      return;
    }

    if (event.code === 'Space' || event.code === 'ArrowUp') {
      if (!this.player.isJumping) {
        this.player.isJumping = true;
        this.player.velocityY = -12;
      }
    }

    if (event.code === 'ArrowDown') {
      this.player.isDucking = true;
    }

    if (event.code === 'ArrowLeft') {
      this.player.lane = Math.max(0, this.player.lane - 1);
      this.onLaneChange?.(this.player.lane);
    }

    if (event.code === 'ArrowRight') {
      this.player.lane = Math.min(2, this.player.lane + 1);
      this.onLaneChange?.(this.player.lane);
    }
  }

  loop(time) {
    if (!this.running || this.isPaused) return;
    const delta = (time - this.lastFrame) / 1000;
    this.lastFrame = time;

    this.update(delta);
    this.draw();

    requestAnimationFrame((next) => this.loop(next));
  }

  update(delta) {
    this.speed = Math.min(14, this.speed + delta * 0.08);
    this.distance += this.speed * delta * 10;

    if (this.player.isJumping) {
      this.player.velocityY += 30 * delta;
      this.player.y += this.player.velocityY;
      if (this.player.y >= 0) {
        this.player.y = 0;
        this.player.isJumping = false;
      }
    }

    this.nextObstacle -= this.speed * delta * 12;
    if (this.nextObstacle <= 0) {
      this.spawnObstacle();
      this.nextObstacle = 120 + Math.random() * 120;
    }

    this.obstacles.forEach((obstacle) => {
      obstacle.x -= this.speed * delta * 80;
    });

    this.obstacles = this.obstacles.filter((obstacle) => obstacle.x > -80);

    this.checkCollision();

    if (!this.minigameTriggered && this.distance >= this.nextMinigame) {
      this.minigameTriggered = true;
      this.onMinigame?.();
    }

    this.onStats?.({ distance: this.distance, speed: this.speed, lives: this.lives });
  }

  randomMinigameDistance() {
    return this.distance + 150 + Math.random() * 100;
  }

  spawnObstacle() {
    const obstacle = { ...OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)] };
    obstacle.lane = Math.floor(Math.random() * 3);
    obstacle.x = this.canvas.width + 40;
    this.obstacles.push(obstacle);
  }

  checkCollision() {
    const playerX = 140;
    const playerLane = this.player.lane;
    const playerHit = this.obstacles.find((obstacle) => Math.abs(obstacle.x - playerX) < 30);

    if (!playerHit) return;

    let hit = false;
    if (playerHit.type === 'lane' && playerHit.lane === playerLane) {
      hit = true;
    }
    if (playerHit.type === 'jump' && !this.player.isJumping && playerHit.lane === playerLane) {
      hit = true;
    }
    if (playerHit.type === 'duck' && !this.player.isDucking && playerHit.lane === playerLane) {
      hit = true;
    }

    if (hit) {
      this.lives -= 1;
      playerHit.x = -100;
      if (this.lives <= 0) {
        this.onGameOver?.(this.distance);
        this.running = false;
      }
    }
  }

  drawLane(ctx, laneIndex, height) {
    const laneHeight = height / 3;
    const y = laneIndex * laneHeight;
    ctx.fillStyle = '#0c172b';
    ctx.fillRect(0, y, this.canvas.width, laneHeight - 4);
    ctx.strokeStyle = '#1c2a44';
    ctx.strokeRect(0, y, this.canvas.width, laneHeight - 4);
  }

  drawPlayer(ctx, laneIndex, height) {
    const laneHeight = height / 3;
    const y = laneIndex * laneHeight + laneHeight / 2 + this.player.y;
    ctx.fillStyle = '#ffb36a';
    ctx.beginPath();
    ctx.arc(140, y - 10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#243b61';
    ctx.fillRect(120, y, 40, this.player.isDucking ? 20 : 36);
    ctx.fillStyle = '#3b5a8a';
    ctx.fillRect(110, y + 8, 12, 24);
  }

  drawObstacle(ctx, obstacle, height) {
    const laneHeight = height / 3;
    const y = obstacle.lane * laneHeight + laneHeight / 2;
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, y - 15, 40, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(obstacle.label, obstacle.x - 4, y - 20);
  }

  drawBackground(ctx, width, height) {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#13213b';
    ctx.fillRect(0, height * 0.65, width, height * 0.35);
  }

  draw() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);
    this.drawBackground(ctx, width, height);
    this.drawLane(ctx, 0, height);
    this.drawLane(ctx, 1, height);
    this.drawLane(ctx, 2, height);
    this.drawPlayer(ctx, this.player.lane, height);
    this.obstacles.forEach((obstacle) => this.drawObstacle(ctx, obstacle, height));
  }

  drawIdle() {
    this.draw();
  }

  resumeAfterMinigame() {
    this.minigameTriggered = false;
    this.nextMinigame = this.randomMinigameDistance();
  }

  resume() {
    if (!this.running) return;
    this.isPaused = false;
    this.minigameTriggered = false;
    this.nextMinigame = this.randomMinigameDistance();
    this.lastFrame = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }
}
