// ============================================
// menu.js — navegação entre telas.
// ============================================

import { getBestScore, getHighScores } from "./storage.js";
import { startGame, stopGame } from "./game.js";

export const selection = {
  mode: null,  // "classic"
  speed: null, // "easy" | "normal" | "hard"
};

const NOMES_DE_MODO = { classic: "Classic" };
const NOMES_DE_VELOCIDADE = { easy: "Easy", normal: "Normal", hard: "Hard" };

const screens = document.querySelectorAll(".screen");

export function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `screen-${name}`);
  });

  if (name === "main-menu") updateMenuRecord();

  if (name === "game") {
    updateGameHud();
    startGame(selection.speed);
  } else {
    stopGame();
  }
}

function updateMenuRecord() {
  document.getElementById("record-value").textContent = getBestScore();
}

function updateGameHud() {
  const modo = NOMES_DE_MODO[selection.mode];
  const velocidade = NOMES_DE_VELOCIDADE[selection.speed];
  document.getElementById("hud-mode").textContent = `${modo} · ${velocidade}`;
  document.getElementById("hud-score").textContent = 0;
  document.getElementById("hud-record").textContent = getHighScores()[selection.speed];
}

export function initMenu() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.mode) selection.mode = button.dataset.mode;
    if (button.dataset.speed) selection.speed = button.dataset.speed;

    if (button.dataset.goto) showScreen(button.dataset.goto);

    if (button.dataset.action === "retry") startGame(selection.speed);
  });

  showScreen("main-menu");
}