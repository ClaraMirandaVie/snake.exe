
import { Snake, DIRECTIONS } from "./snake.js";
import { spawnFood } from "./food.js";

// ---------- Configurações ----------
const GRID_SIZE = 20;   // tabuleiro de 20 x 20 casas
const CELL = 24;        // cada casa tem 24px (20 * 24 = 480px do canvas)
const POINTS_PER_FOOD = 10;

// Tempo entre um passo e outro, em milissegundos.
// Quanto MENOR o número, mais RÁPIDA a cobrinha.
const SPEEDS = { easy: 180, normal: 120, hard: 70 };

const COLORS = {
  head: "#ffffff",
  body: "#22e3e3",
  food: "#ff6b81",
};

// ---------- Elementos da página ----------
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("hud-score");
const gameOverEl = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");

// ---------- Estado da partida ----------
let snake;
let food;
let score;
let tickMs;           
let lastTick;         
let animationId;      
let running = false;
let directionQueue;   

// ---------- Começar / parar ----------
export function startGame(speed) {
  stopGame(); // garante que não tem outro loop rodando

  snake = new Snake(5, 10);
  food = spawnFood(snake.body, GRID_SIZE);
  score = 0;
  tickMs = SPEEDS[speed];
  directionQueue = [];

  scoreEl.textContent = score;
  gameOverEl.classList.remove("visible");

  running = true;
  lastTick = performance.now();
  draw();
  animationId = requestAnimationFrame(loop);
}

export function stopGame() {
  running = false;
  cancelAnimationFrame(animationId);
}

function endGame() {
  stopGame();
  finalScoreEl.textContent = score;
  gameOverEl.classList.add("visible");
}

// ---------- O loop do jogo ----------
function loop(time) {
  if (time - lastTick >= tickMs) {
    lastTick = time;
    update();
  }
  if (running) {
    animationId = requestAnimationFrame(loop);
  }
}

function update() {
  if (directionQueue.length > 0) {
    snake.direction = directionQueue.shift();
  }

  // 2) Calcula pra onde a cabeça vai
  const next = snake.getNextHead();

  // 3) Parede?
  if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) {
    endGame();
    return;
  }

  // 4) Vai comer?
  const willEat = food !== null && next.x === food.x && next.y === food.y;

  // 5) Bateu no próprio corpo?
  if (snake.hitsItself(next, willEat)) {
    endGame();
    return;
  }

  // 6) Tá tudo certo: anda!
  snake.move(willEat);

  if (willEat) {
    score += POINTS_PER_FOOD;
    scoreEl.textContent = score;
    food = spawnFood(snake.body, GRID_SIZE);
    if (food === null) {
      endGame(); // tabuleiro cheio, não tem mais onde pôr comida
      return;
    }
  }

  draw();
}

// ---------- Desenho ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 10;

  if (food) {
    ctx.shadowColor = COLORS.food;
    ctx.fillStyle = COLORS.food;
    drawCell(food.x, food.y);
  }

  snake.body.forEach((part, index) => {
    const color = index === 0 ? COLORS.head : COLORS.body;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    drawCell(part.x, part.y);
  });

  ctx.shadowBlur = 0;
}

function drawCell(x, y) {
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
}

// ---------- Teclado ----------
const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTIONS.up,
  ArrowDown: DIRECTIONS.down,
  ArrowLeft: DIRECTIONS.left,
  ArrowRight: DIRECTIONS.right,
};

document.addEventListener("keydown", (event) => {
  const newDirection = KEY_TO_DIRECTION[event.key];
  if (!newDirection || !running) return;

  event.preventDefault(); // evita a página rolar com as setas
  queueDirection(newDirection);
});


function queueDirection(newDirection) {
  const last = directionQueue.length > 0
    ? directionQueue[directionQueue.length - 1]
    : snake.direction;

  const isSame = newDirection === last;
  const isReverse = newDirection.x === -last.x && newDirection.y === -last.y;

  if (isSame || isReverse) return;
  if (directionQueue.length < 2) {
    directionQueue.push(newDirection);
  }
}