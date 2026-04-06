const menuScreen = document.getElementById("menuScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startNumberInput = document.getElementById("startNumber");
const endNumberInput = document.getElementById("endNumber");
const startBtn = document.getElementById("startBtn");
const modeButtons = document.querySelectorAll(".mode-btn");

const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const wordText = document.getElementById("wordText");
const rangeInfo = document.getElementById("rangeInfo");
const choicesArea = document.getElementById("choicesArea");
const feedbackBox = document.getElementById("feedbackBox");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const retryBtn = document.getElementById("retryBtn");
const backBtn = document.getElementById("backBtn");
const speakBtn = document.getElementById("speakBtn");

const resultText = document.getElementById("resultText");
const resultRestartBtn = document.getElementById("resultRestartBtn");
const resultRetryBtn = document.getElementById("resultRetryBtn");
const resultBackBtn = document.getElementById("resultBackBtn");

let mode = "order";
let quizItems = [];
let currentIndex = 0;
let score = 0;
let currentSettings = { start: 501, end: 600, mode: "order" };
let answeredMap = {};

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

startBtn.addEventListener("click", () => {
  const start = Number(startNumberInput.value);
  const end = Number(endNumberInput.value);

  if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
    alert("開始番号と終了番号を正しく入力してください。");
    return;
  }

  const filtered = data.filter((item) => item.id >= start && item.id <= end);
  if (!filtered.length) {
    alert("該当する単語がありません。");
    return;
  }

  currentSettings = { start, end, mode };
  quizItems = [...filtered];

  if (mode === "random") {
    shuffleArray(quizItems);
  }

  currentIndex = 0;
  score = 0;
  answeredMap = {};

  showScreen("quiz");
  renderQuestion();
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < quizItems.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener("click", restartWithSameSettings);
resultRestartBtn.addEventListener("click", restartWithSameSettings);

retryBtn.addEventListener("click", () => showScreen("menu"));
resultRetryBtn.addEventListener("click", () => showScreen("menu"));
backBtn.addEventListener("click", () => showScreen("menu"));
resultBackBtn.addEventListener("click", () => showScreen("menu"));

speakBtn.addEventListener("click", () => {
  const item = quizItems[currentIndex];
  if (!item) return;
  const utterance = new SpeechSynthesisUtterance(item.word);
  utterance.lang = "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
});

function restartWithSameSettings() {
  startNumberInput.value = currentSettings.start;
  endNumberInput.value = currentSettings.end;
  mode = currentSettings.mode;
  modeButtons.forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });

  quizItems = data.filter((item) => item.id >= currentSettings.start && item.id <= currentSettings.end);
  if (mode === "random") {
    shuffleArray(quizItems);
  }

  currentIndex = 0;
  score = 0;
  answeredMap = {};
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const item = quizItems[currentIndex];
  if (!item) return;

  progressText.textContent = `${currentIndex + 1} / ${quizItems.length}`;
  scoreText.textContent = `Score: ${score}`;
  wordText.textContent = item.word;
  rangeInfo.textContent = `通し番号 ${item.id} ｜ 単語番号 ${item.wordNo}`;

  choicesArea.innerHTML = "";
  feedbackBox.classList.add("hidden");
  feedbackBox.innerHTML = "";

  item.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice;
    button.addEventListener("click", () => handleAnswer(index));
    choicesArea.appendChild(button);
  });

  const saved = answeredMap[item.id];
  if (saved) {
    applyAnswerState(saved.selectedIndex, saved.isCorrect, item);
  }
}

function handleAnswer(selectedIndex) {
  const item = quizItems[currentIndex];
  if (answeredMap[item.id]) return;

  const isCorrect = selectedIndex === item.correct;
  answeredMap[item.id] = { selectedIndex, isCorrect };

  if (isCorrect) {
    score += 1;
    scoreText.textContent = `Score: ${score}`;
  }

  applyAnswerState(selectedIndex, isCorrect, item);
}

function applyAnswerState(selectedIndex, isCorrect, item) {
  const buttons = Array.from(document.querySelectorAll(".choice-btn"));
  buttons.forEach((button, index) => {
    button.classList.add("disabled");
    if (index === item.correct) {
      button.classList.add("correct");
    }
    if (!isCorrect && index === selectedIndex) {
      button.classList.add("wrong");
    }
  });

  const statusClass = isCorrect ? "ok" : "ng";
  const statusText = isCorrect ? "⭕ 正解！" : "❌ 不正解";
  feedbackBox.innerHTML = `
    <div class="${statusClass}">${statusText}</div>
    <div><strong>正解：</strong>${item.choices[item.correct]}</div>
    <div><strong>単語番号：</strong>${item.wordNo}</div>
    <div><strong>例文：</strong>${item.sentence}</div>
    <div><strong>和訳：</strong>${item.jp}</div>
  `;
  feedbackBox.classList.remove("hidden");
}

function showResult() {
  const total = quizItems.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;
  resultText.textContent = `${score} / ${total} 問正解（${percentage}%）`;
  showScreen("result");
}

function showScreen(screenName) {
  menuScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  if (screenName === "menu") menuScreen.classList.remove("hidden");
  if (screenName === "quiz") quizScreen.classList.remove("hidden");
  if (screenName === "result") resultScreen.classList.remove("hidden");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
