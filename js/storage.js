// ============================================
// storage.js — tudo que mexe no LocalStorage fica AQUI.
// Os outros arquivos nunca falam direto com o localStorage:
// eles pedem pra este arquivo. Assim, se um dia mudar como
// salvamos os dados, só este arquivo muda.
// ============================================

const PREFIX = "snakeexe:"; // evita bagunçar com dados de outros sites

// Salva qualquer valor (número, texto, objeto...) sob um nome.
export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn("Não foi possível salvar:", error);
  }
}

// Lê um valor salvo. Se não existir (ou der erro), devolve o "fallback".
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn("Não foi possível ler:", error);
    return fallback;
  }
}

// Recordes do Classic, um por dificuldade (como pede o documento).
export function getHighScores() {
  return load("highscores:classic", { easy: 0, normal: 0, hard: 0 });
}

// Maior recorde entre todas as dificuldades (usado no menu principal).
export function getBestScore() {
  const scores = getHighScores();
  return Math.max(scores.easy, scores.normal, scores.hard);
}
