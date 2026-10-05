const CATEGORIES = [
  "Pony-Name",
  "Ort in Equestria",
  "Bösewicht-Name",
  "Background-Charakter-Name",
  "Tier-/Pet-Name",
  "Cutie-Mark-Motiv",
  "Beruf in Equestria",
  "Essen/Süßigkeiten",
  "Lied aus MLP",
  "Rasse",
  "Charakter ohne Cutie Mark",
  "Magischer Gegenstand",
  "Etwas, was Discord gemacht hat",
  "Verwandter der Mane Six",
  "Charakter aus Equestria Girls",
  "Mitglied der Wonderbolts",
  "Grund, warum Celestia dich verbannt",
  "Sache, die Pinkie Pie nicht unbeaufsichtigt haben sollte",
  "Schlechter Name für ein Pony",
  "Cutie Mark, das du nie haben wolltest",
  "Beruf, den Rainbow Dash hassen würde",
  "Etwas, das Fluttershy zum Ausrasten bringen würde",
  "Etwas, das Rarity niemals tragen würde",
  "Grund, warum Twilight 3 Tage nicht schläft",
  "Applejacks dunkelstes Geheimnis",
  "Ding, das Discord in deinem Haus verändern würde",
  "Schlechtes Geschenk für Prinzessin Luna",
  "Name für eine fragwürdige Taverne in Equestria",
  "Grund für Hausverbot im Sugarcube Corner",
  "Peinlicher Zauberunfall",
  "Etwas, das du niemals in Zecoras Trank werfen solltest",
  "Magische Fähigkeit",
  "Grund für eine Narbe",
  "Name einer eigenen Rasse",
  "Gegenstand aus Twilights Bibliothek",
  "Etwas aus Raritys Boutique",
  "Etwas, das Applejack auf der Farm hat",
  "Name für ein neues Element der Harmonie",
  "Name für einen neuen MLP-Bösewicht",
  "Name für einen neuen Royal Guard",
  "Name für einen neuen Wonderbolt",
  "Name für eine Pony-Band",
  "Name für ein MLP-Lied",
  "Name für einen Zauber",
  "Name eines bestehenden Zaubertranks",
  "Name für eine Schule in Equestria",
  "Name für ein Fest in Ponyville",
  "Name für einen Feiertag in Equestria",
  "Name für eine Zeitung in Equestria",
  "Name für einen Laden in Canterlot",
  "Etwas, das Celestia heimlich liebt",
  "Etwas, das Luna tagsüber macht",
  "Grund, warum Luna jemanden in einen Albtraum schickt",
  "Grund, warum Discord Hausverbot bekommt",
  "Grund, warum Pinkie Pie eine Party absagt",
  "Grund, warum Rainbow Dash zu spät kommt",
  "Grund, warum Twilight einen Nervenzusammenbruch bekommt",
  "Etwas, das man im Everfree Forest finden könnte",
  "Etwas, wovor Fluttershy Angst haben könnte",
  "Grund, warum Rainbow Dash aus den Wonderbolts fliegt",
  "Etwas, das Pinkie Pie auf eine Party mitbringt",
  "Etwas, das Discord in ein Lebewesen verwandeln würde",
  "Etwas, das Celestia niemals öffentlich zugeben würde",
  "Grund, warum ein Zauber nach hinten losgeht",
  "Nebenwirkung eines Zaubertranks",
  "Ein negatives Element der Disharmonie",
  "Etwas, das Chrysalis stehlen würde",
  "Grund, warum Chrysalis jemanden nicht ersetzen will",
  "Grund, warum Celestia einen Brief von Twilight ignoriert",
  "Etwas, das Twilight in einem Freundschaftsbrief niemals schreiben sollte",
  "Grund für eine Katastrophe in Ponyville",
  "Grund, warum Ponyville evakuiert werden muss",
  "Etwas, das Discord mit Celestias Schloss anstellen würde",
  "Etwas, das Chrysalis niemals stehlen würde",
  "Etwas, das Celestia heimlich vor Luna versteckt",
  "Grund, warum Luna Celestia mitten in der Nacht weckt",
  "Grund, warum Twilight einen Brief mit „ES TUT MIR LEID“ beginnt"
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(letter => !["Q", "X", "Y"].includes(letter));

const state = {
  player: "",
  round: 1,
  totalScore: 0,
  roundScore: 0,
  categoriesPerRound: 10,
  timerLength: 90,
  remaining: 90,
  timerId: null,
  letter: "A",
  activeCategories: [],
  answers: [],
  scores: [],
  usedCategoryIndices: []
};

const $ = id => document.getElementById(id);
const setupPanel = $("setupPanel");
const gamePanel = $("gamePanel");
const scorePanel = $("scorePanel");
const endPanel = $("endPanel");

$("categoryCountBadge").textContent = `${CATEGORIES.length} Kategorien`;

function randomLetter(exclude = "") {
  const options = LETTERS.filter(l => l !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function pickCategories(count) {
  let available = CATEGORIES.map((_, i) => i).filter(i => !state.usedCategoryIndices.includes(i));
  if (available.length < count) {
    state.usedCategoryIndices = [];
    available = CATEGORIES.map((_, i) => i);
  }
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, count);
  state.usedCategoryIndices.push(...chosen);
  return chosen.map(i => CATEGORIES[i]);
}

function formatTime(totalSeconds) {
  const min = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const sec = (totalSeconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function showPanel(panel) {
  [setupPanel, gamePanel, scorePanel, endPanel].forEach(p => p.classList.add("hidden"));
  panel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerUI() {
  $("timerDisplay").textContent = state.timerLength === 0 ? "∞" : formatTime(state.remaining);
  const card = $("timerCard");
  card.classList.remove("warning", "danger");
  if (state.timerLength > 0 && state.remaining <= 15) card.classList.add("danger");
  else if (state.timerLength > 0 && state.remaining <= 30) card.classList.add("warning");
}

function startTimer() {
  stopTimer();
  state.remaining = state.timerLength;
  updateTimerUI();
  if (state.timerLength === 0) return;
  state.timerId = setInterval(() => {
    state.remaining -= 1;
    updateTimerUI();
    if (state.remaining <= 0) {
      stopTimer();
      scoreRound();
    }
  }, 1000);
}

function renderRound() {
  $("roundLabel").textContent = `Runde ${state.round}`;
  $("playerDisplay").textContent = state.player ? `${state.player}, los geht's!` : "Los geht's!";
  $("letterDisplay").textContent = state.letter;
  $("totalScoreDisplay").textContent = state.totalScore;

  const form = $("answersForm");
  form.innerHTML = "";
  state.activeCategories.forEach((category, index) => {
    const row = document.createElement("div");
    row.className = "answer-row";
    row.innerHTML = `
      <label class="answer-label" for="answer-${index}"><span class="answer-number">${index + 1}.</span>${category}</label>
      <input class="answer-input" id="answer-${index}" autocomplete="off" spellcheck="false" placeholder="Antwort mit ${state.letter} …">
    `;
    form.appendChild(row);
  });
}

function beginRound() {
  state.letter = randomLetter(state.letter);
  state.activeCategories = pickCategories(state.categoriesPerRound);
  state.answers = Array(state.activeCategories.length).fill("");
  state.scores = Array(state.activeCategories.length).fill(null);
  renderRound();
  showPanel(gamePanel);
  startTimer();
  setTimeout(() => document.querySelector(".answer-input")?.focus(), 150);
}

function collectAnswers() {
  state.answers = state.activeCategories.map((_, i) => $( `answer-${i}` )?.value.trim() || "");
}

function scoreRound() {
  stopTimer();
  collectAnswers();
  state.roundScore = 0;
  state.scores = state.answers.map(() => null);
  renderScoreList();
  showPanel(scorePanel);
}

function renderScoreList() {
  const container = $("scoreList");
  container.innerHTML = "";
  state.activeCategories.forEach((category, index) => {
    const item = document.createElement("div");
    item.className = "score-item";
    const answer = state.answers[index] || "— keine Antwort —";
    item.innerHTML = `
      <div class="score-item-top">
        <div>
          <div class="score-category">${index + 1}. ${escapeHtml(category)}</div>
          <div class="score-answer">${escapeHtml(answer)}</div>
        </div>
      </div>
      <div class="score-buttons" data-index="${index}">
        <button class="point-btn zero" type="button" data-points="0">0</button>
        <button class="point-btn" type="button" data-points="5">5</button>
        <button class="point-btn" type="button" data-points="10">10</button>
        <button class="point-btn twenty" type="button" data-points="20">20</button>
      </div>
    `;
    container.appendChild(item);
  });
  $("roundScoreDisplay").textContent = "0";

  container.querySelectorAll(".point-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.parentElement;
      const index = Number(group.dataset.index);
      const points = Number(btn.dataset.points);
      state.scores[index] = points;
      group.querySelectorAll(".point-btn").forEach(b => b.classList.toggle("selected", b === btn));
      state.roundScore = state.scores.reduce((sum, value) => sum + (value ?? 0), 0);
      $("roundScoreDisplay").textContent = state.roundScore;
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function finalizeCurrentRound() {
  state.totalScore += state.roundScore;
  state.roundScore = 0;
}

function startGame() {
  state.player = $("playerName").value.trim();
  state.categoriesPerRound = Number($("categoryAmount").value);
  state.timerLength = Number($("timerLength").value);
  state.round = 1;
  state.totalScore = 0;
  state.usedCategoryIndices = [];
  beginRound();
}

function finishGame() {
  finalizeCurrentRound();
  $("finalScoreDisplay").textContent = state.totalScore;
  const who = state.player ? `${state.player}, du` : "Du";
  $("finalHeadline").textContent = "Pony-Chaos abgeschlossen!";
  $("finalSummary").textContent = `${who} hast ${state.round} Runde${state.round === 1 ? "" : "n"} gespielt und insgesamt ${state.totalScore} Punkte gesammelt.`;
  showPanel(endPanel);
}

$("startGameBtn").addEventListener("click", startGame);
$("stopRoundBtn").addEventListener("click", scoreRound);
$("newLetterBtn").addEventListener("click", () => {
  state.letter = randomLetter(state.letter);
  $("letterDisplay").textContent = state.letter;
  document.querySelectorAll(".answer-input").forEach(input => {
    input.placeholder = `Antwort mit ${state.letter} …`;
  });
});
$("restartTimerBtn").addEventListener("click", startTimer);
$("nextRoundBtn").addEventListener("click", () => {
  finalizeCurrentRound();
  state.round += 1;
  beginRound();
});
$("finishGameBtn").addEventListener("click", finishGame);
$("playAgainBtn").addEventListener("click", () => {
  stopTimer();
  showPanel(setupPanel);
});

const dialog = $("categoriesDialog");
function renderCategoryDialog(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = CATEGORIES.filter(c => c.toLowerCase().includes(normalized));
  $("categoriesList").innerHTML = filtered.map(c => `<li>${escapeHtml(c)}</li>`).join("");
  $("dialogCount").textContent = filtered.length;
}
$("showCategoriesBtn").addEventListener("click", () => {
  renderCategoryDialog();
  $("categorySearch").value = "";
  dialog.showModal();
});
$("closeDialogBtn").addEventListener("click", () => dialog.close());
$("categorySearch").addEventListener("input", e => renderCategoryDialog(e.target.value));
dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close();
});

window.addEventListener("beforeunload", stopTimer);
