import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  onDisconnect,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAC_hzJVQNLC660Kcox7rY9UY7DLIVjpAw",
  authDomain: "pony-game-7e138.firebaseapp.com",
  projectId: "pony-game-7e138",
  storageBucket: "pony-game-7e138.firebasestorage.app",
  messagingSenderId: "613732229064",
  appId: "1:613732229064:web:2e2956cefa5843c49daafd",
  measurementId: "G-E1NES6B4T3",
  databaseURL: "https://pony-game-7e138-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

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
const ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const state = {
  user: null,
  roomCode: "",
  room: null,
  isHost: false,
  roomUnsubscribe: null,
  offsetUnsubscribe: null,
  serverOffset: 0,
  timerId: null,
  renderKey: "",
  localRoundKey: "",
  playerName: ""
};

const $ = id => document.getElementById(id);
const setupPanel = $("setupPanel");
const lobbyPanel = $("lobbyPanel");
const gamePanel = $("gamePanel");
const scorePanel = $("scorePanel");
const endPanel = $("endPanel");

$("categoryCountBadge").textContent = `${CATEGORIES.length} Kategorien`;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showPanel(panel) {
  [setupPanel, lobbyPanel, gamePanel, scorePanel, endPanel].forEach(p => p.classList.add("hidden"));
  panel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setSetupMessage(message, isError = false) {
  const el = $("setupMessage");
  el.textContent = message;
  el.style.color = isError ? "var(--danger)" : "var(--gold)";
}

function setConnection(text, mode = "") {
  const el = $("connectionStatus");
  el.textContent = text;
  el.classList.remove("online", "error");
  if (mode) el.classList.add(mode);
}

function cleanName() {
  return $("playerName").value.trim().slice(0, 24);
}

function normalizeRoomCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function randomRoomCode() {
  let result = "";
  for (let i = 0; i < 6; i += 1) {
    result += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  }
  return result;
}

function randomLetter(exclude = "") {
  const options = LETTERS.filter(letter => letter !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const min = Math.floor(safe / 60).toString().padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function serverNow() {
  return Date.now() + state.serverOffset;
}

function stopLocalTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function playerEntries(room = state.room) {
  return Object.entries(room?.players || {}).sort((a, b) => {
    const aTime = Number(a[1]?.joinedAt || 0);
    const bTime = Number(b[1]?.joinedAt || 0);
    return aTime - bTime;
  });
}

function roundData(room = state.room) {
  const n = Number(room?.currentRoundNumber || 0);
  return room?.rounds?.[n] || null;
}

function categoryIndicesForRound(round) {
  if (!round?.categoryIndices) return [];
  if (Array.isArray(round.categoryIndices)) return round.categoryIndices.map(Number);
  return Object.values(round.categoryIndices).map(Number);
}

function totalScoreFor(uid, room = state.room) {
  let total = 0;
  Object.values(room?.rounds || {}).forEach(round => {
    const scores = round?.scores?.[uid] || {};
    Object.values(scores).forEach(value => {
      const points = Number(value);
      if (Number.isFinite(points)) total += points;
    });
  });
  return total;
}

function roundScoreFor(uid, round) {
  return Object.values(round?.scores?.[uid] || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function usedCategoryIndices(room = state.room) {
  const used = [];
  Object.values(room?.rounds || {}).forEach(round => {
    used.push(...categoryIndicesForRound(round));
  });
  return used;
}

function pickCategoryIndices(count, room = state.room) {
  const used = new Set(usedCategoryIndices(room));
  let available = CATEGORIES.map((_, index) => index).filter(index => !used.has(index));
  if (available.length < count) available = CATEGORIES.map((_, index) => index);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function setHostVisibility() {
  document.querySelectorAll(".host-only").forEach(el => el.classList.toggle("hidden", !state.isHost));
  document.querySelectorAll(".non-host-wait").forEach(el => el.classList.toggle("hidden", state.isHost));
}

async function ensurePlayerDisconnectCleanup() {
  if (!state.user || !state.roomCode) return;
  const pRef = ref(db, `rooms/${state.roomCode}/players/${state.user.uid}`);
  try {
    await onDisconnect(pRef).remove();
  } catch (error) {
    console.warn("onDisconnect konnte nicht gesetzt werden", error);
  }
}

function subscribeToRoom(code) {
  if (state.roomUnsubscribe) state.roomUnsubscribe();
  const roomRef = ref(db, `rooms/${code}`);
  state.roomUnsubscribe = onValue(roomRef, snapshot => {
    if (!snapshot.exists()) {
      leaveRoomLocal("Der Raum existiert nicht mehr.");
      return;
    }
    state.room = snapshot.val();
    state.isHost = state.room.hostUid === state.user?.uid;
    setHostVisibility();
    renderFromRoom();
  }, error => {
    console.error(error);
    leaveRoomLocal("Verbindung zum Raum verloren.");
  });
}

async function createRoom() {
  if (!state.user) {
    setSetupMessage("Firebase ist noch nicht bereit.", true);
    return;
  }
  const name = cleanName();
  if (!name) {
    setSetupMessage("Bitte gib zuerst deinen Spielernamen ein.", true);
    $("playerName").focus();
    return;
  }

  $("createRoomBtn").disabled = true;
  setSetupMessage("Raum wird erstellt …");

  try {
    let code = "";
    let created = false;
    for (let attempt = 0; attempt < 8 && !created; attempt += 1) {
      code = randomRoomCode();
      const roomRef = ref(db, `rooms/${code}`);
      const initialRoom = {
        hostUid: state.user.uid,
        createdAt: serverTimestamp(),
        status: "lobby",
        currentRoundNumber: 0,
        settings: {
          categoryAmount: Number($("categoryAmount").value),
          timerLength: Number($("timerLength").value)
        },
        players: {
          [state.user.uid]: {
            name,
            joinedAt: serverTimestamp()
          }
        }
      };
      const result = await runTransaction(roomRef, current => current === null ? initialRoom : undefined);
      created = result.committed;
    }

    if (!created) throw new Error("Kein freier Raumcode gefunden.");

    state.playerName = name;
    state.roomCode = code;
    state.renderKey = "";
    await ensurePlayerDisconnectCleanup();
    subscribeToRoom(code);
    setSetupMessage("");
  } catch (error) {
    console.error(error);
    setSetupMessage(`Raum konnte nicht erstellt werden: ${error.message}`, true);
  } finally {
    $("createRoomBtn").disabled = false;
  }
}

async function joinRoom() {
  if (!state.user) {
    setSetupMessage("Firebase ist noch nicht bereit.", true);
    return;
  }
  const name = cleanName();
  const code = normalizeRoomCode($("roomCodeInput").value);
  $("roomCodeInput").value = code;

  if (!name) {
    setSetupMessage("Bitte gib zuerst deinen Spielernamen ein.", true);
    $("playerName").focus();
    return;
  }
  if (code.length !== 6) {
    setSetupMessage("Der Raumcode muss 6 Zeichen haben.", true);
    $("roomCodeInput").focus();
    return;
  }

  $("joinRoomBtn").disabled = true;
  setSetupMessage("Raum wird gesucht …");

  try {
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) throw new Error("Dieser Raum wurde nicht gefunden.");

    const playerRef = ref(db, `rooms/${code}/players/${state.user.uid}`);
    const oldPlayer = (await get(playerRef)).val() || {};
    await set(playerRef, {
      ...oldPlayer,
      name,
      joinedAt: oldPlayer.joinedAt || serverTimestamp()
    });

    state.playerName = name;
    state.roomCode = code;
    state.renderKey = "";
    await ensurePlayerDisconnectCleanup();
    subscribeToRoom(code);
    setSetupMessage("");
  } catch (error) {
    console.error(error);
    setSetupMessage(error.message || "Beitreten fehlgeschlagen.", true);
  } finally {
    $("joinRoomBtn").disabled = false;
  }
}

function renderLobby() {
  stopLocalTimer();
  showPanel(lobbyPanel);
  $("lobbyRoomCode").textContent = state.roomCode;
  $("roleBadge").textContent = state.isHost ? "HOST" : "SPIELER";

  const players = playerEntries();
  $("playerList").innerHTML = players.map(([uid, player]) => {
    const tags = [];
    if (uid === state.room.hostUid) tags.push("HOST");
    if (uid === state.user?.uid) tags.push("DU");
    return `<div class="player-chip"><strong>${escapeHtml(player.name || "Pony")}</strong><span>${tags.join(" · ")}</span></div>`;
  }).join("");

  const settings = state.room.settings || {};
  $("lobbyCategoryAmount").value = String(settings.categoryAmount || 10);
  $("lobbyTimerLength").value = String(settings.timerLength ?? 90);
  $("lobbyCategoryAmount").disabled = !state.isHost;
  $("lobbyTimerLength").disabled = !state.isHost;
  $("hostSettingsHint").textContent = state.isHost
    ? "Du bist Host. Änderungen gelten sofort für alle."
    : "Nur der Host kann diese Einstellungen ändern.";
}

function currentRoundKey() {
  const round = roundData();
  if (!round) return "";
  return `${state.room.currentRoundNumber}|${round.letter}|${categoryIndicesForRound(round).join(",")}`;
}

function renderGame() {
  const round = roundData();
  if (!round) return;
  showPanel(gamePanel);
  $("roundLabel").textContent = `Runde ${state.room.currentRoundNumber} · Raum ${state.roomCode}`;
  const me = state.room.players?.[state.user.uid];
  $("playerDisplay").textContent = `${me?.name || state.playerName || "Pony"}, los geht's!`;
  $("letterDisplay").textContent = round.letter || "?";
  $("totalScoreDisplay").textContent = totalScoreFor(state.user.uid);

  const key = currentRoundKey();
  if (state.localRoundKey !== key) {
    state.localRoundKey = key;
    const form = $("answersForm");
    form.innerHTML = "";
    const indices = categoryIndicesForRound(round);
    const myAnswers = round.answers?.[state.user.uid] || {};

    indices.forEach((categoryIndex, index) => {
      const category = CATEGORIES[categoryIndex] || "Unbekannte Kategorie";
      const row = document.createElement("div");
      row.className = "answer-row";
      row.innerHTML = `
        <label class="answer-label" for="answer-${index}"><span class="answer-number">${index + 1}.</span>${escapeHtml(category)}</label>
        <input class="answer-input" id="answer-${index}" data-index="${index}" autocomplete="off" spellcheck="false" placeholder="Antwort mit ${escapeHtml(round.letter || "?")} …" value="${escapeHtml(myAnswers[index] || "")}">
      `;
      form.appendChild(row);
    });

    form.querySelectorAll(".answer-input").forEach(input => {
      input.addEventListener("input", async event => {
        const answerIndex = event.currentTarget.dataset.index;
        const value = event.currentTarget.value.slice(0, 120);
        try {
          await set(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}/answers/${state.user.uid}/${answerIndex}`), value || null);
        } catch (error) {
          console.error("Antwort konnte nicht gespeichert werden", error);
        }
      });
    });
    setTimeout(() => form.querySelector(".answer-input")?.focus(), 120);
  } else {
    document.querySelectorAll(".answer-input").forEach(input => {
      input.placeholder = `Antwort mit ${round.letter || "?"} …`;
    });
  }

  startRoundClock(round);
}

function startRoundClock(round) {
  stopLocalTimer();

  const updateClock = () => {
    const duration = Number(round.duration || state.room.settings?.timerLength || 0);
    const timerCard = $("timerCard");
    timerCard.classList.remove("warning", "danger");

    if (duration === 0 || !round.endsAt) {
      $("timerDisplay").textContent = "∞";
      return;
    }

    const seconds = Math.max(0, Math.ceil((Number(round.endsAt) - serverNow()) / 1000));
    $("timerDisplay").textContent = formatTime(seconds);
    if (seconds <= 15) timerCard.classList.add("danger");
    else if (seconds <= 30) timerCard.classList.add("warning");

    if (seconds <= 0) {
      stopLocalTimer();
      if (state.isHost && state.room?.status === "playing") stopRound("Zeit abgelaufen");
    }
  };

  updateClock();
  if (Number(round.duration || 0) > 0) state.timerId = setInterval(updateClock, 250);
}

async function updateLobbySettings() {
  if (!state.isHost || !state.roomCode) return;
  await update(ref(db, `rooms/${state.roomCode}/settings`), {
    categoryAmount: Number($("lobbyCategoryAmount").value),
    timerLength: Number($("lobbyTimerLength").value)
  });
}

async function startNextRound() {
  if (!state.isHost || !state.roomCode || !state.room) return;
  const nextNumber = Number(state.room.currentRoundNumber || 0) + 1;
  const count = Number(state.room.settings?.categoryAmount || 10);
  const duration = Number(state.room.settings?.timerLength ?? 90);
  const previousRound = roundData();
  const letter = randomLetter(previousRound?.letter || "");
  const categoryIndices = pickCategoryIndices(count);
  const startedAt = serverNow();
  const round = {
    letter,
    categoryIndices,
    duration,
    startedAt,
    endsAt: duration > 0 ? startedAt + duration * 1000 : 0,
    answers: {},
    scores: {},
    ready: {}
  };

  state.localRoundKey = "";
  await update(ref(db, `rooms/${state.roomCode}`), {
    status: "playing",
    currentRoundNumber: nextNumber,
    [`rounds/${nextNumber}`]: round
  });
}

async function stopRound(reason = "STOP") {
  if (!state.roomCode || state.room?.status !== "playing") return;
  try {
    await update(ref(db, `rooms/${state.roomCode}`), {
      status: "scoring",
      [`rounds/${state.room.currentRoundNumber}/stoppedAt`]: serverNow(),
      [`rounds/${state.room.currentRoundNumber}/stopReason`]: reason
    });
  } catch (error) {
    console.error(error);
  }
}

async function changeLetterForAll() {
  if (!state.isHost) return;
  const round = roundData();
  if (!round) return;
  const letter = randomLetter(round.letter || "");
  state.localRoundKey = "";
  await set(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}/letter`), letter);
}

async function restartTimerForAll() {
  if (!state.isHost) return;
  const round = roundData();
  if (!round) return;
  const duration = Number(round.duration ?? state.room.settings?.timerLength ?? 90);
  const now = serverNow();
  await update(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}`), {
    startedAt: now,
    endsAt: duration > 0 ? now + duration * 1000 : 0
  });
}

function playerReadyCount(round) {
  const players = playerEntries();
  let ready = 0;
  players.forEach(([uid]) => {
    if (round?.ready?.[uid]) ready += 1;
  });
  return { ready, total: players.length };
}

function renderScoring() {
  stopLocalTimer();
  showPanel(scorePanel);
  const round = roundData();
  if (!round) return;

  const roundNumber = state.room.currentRoundNumber;
  $("scoreRoundLabel").textContent = `Auswertung · Runde ${roundNumber} · Raum ${state.roomCode}`;
  $("roundScoreDisplay").textContent = roundScoreFor(state.user.uid, round);

  const indices = categoryIndicesForRound(round);
  const players = playerEntries();
  const container = $("scoreList");
  container.innerHTML = "";

  indices.forEach((categoryIndex, answerIndex) => {
    const item = document.createElement("div");
    item.className = "score-item";
    const category = CATEGORIES[categoryIndex] || "Unbekannte Kategorie";
    const rows = players.map(([uid, player]) => {
      const answer = round.answers?.[uid]?.[answerIndex] || "";
      const isMe = uid === state.user.uid;
      const score = round.scores?.[uid]?.[answerIndex];
      let scoring = "";

      if (isMe) {
        if (!answer.trim()) {
          scoring = `<span class="empty-answer">0 Punkte</span>`;
        } else {
          scoring = `<div class="score-buttons" data-index="${answerIndex}">
            ${[0, 5, 10, 20].map(points => `<button class="point-btn ${points === 0 ? "zero" : ""} ${points === 20 ? "twenty" : ""} ${Number(score) === points ? "selected" : ""}" type="button" data-points="${points}">${points}</button>`).join("")}
          </div>`;
        }
      } else if (score !== undefined && score !== null) {
        scoring = `<strong>${Number(score) || 0} P.</strong>`;
      } else {
        scoring = `<span class="empty-answer">—</span>`;
      }

      return `<div class="comparison-row ${isMe ? "me" : ""}">
        <div class="comparison-name">${escapeHtml(player.name || "Pony")}${isMe ? " (du)" : ""}</div>
        <div class="comparison-answer ${answer ? "" : "empty-answer"}">${answer ? escapeHtml(answer) : "keine Antwort"}</div>
        <div>${scoring}</div>
      </div>`;
    }).join("");

    item.innerHTML = `<div class="score-category">${answerIndex + 1}. ${escapeHtml(category)}</div><div class="comparison-list">${rows}</div>`;
    container.appendChild(item);
  });

  container.querySelectorAll(".score-buttons .point-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const group = button.closest(".score-buttons");
      const answerIndex = group.dataset.index;
      const points = Number(button.dataset.points);
      await set(ref(db, `rooms/${state.roomCode}/rounds/${roundNumber}/scores/${state.user.uid}/${answerIndex}`), points);
    });
  });

  const readyState = playerReadyCount(round);
  $("readyStatus").textContent = `${readyState.ready}/${readyState.total} Spieler fertig`;
  const meReady = Boolean(round.ready?.[state.user.uid]);
  $("readyBtn").disabled = meReady;
  $("readyBtn").textContent = meReady ? "Bewertung abgeschlossen ✓" : "Meine Bewertung ist fertig";
}

async function markReady() {
  const round = roundData();
  if (!round) return;
  await set(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}/ready/${state.user.uid}`), true);
}

async function finishGame() {
  if (!state.isHost) return;
  await set(ref(db, `rooms/${state.roomCode}/status`), "finished");
}

function renderEnd() {
  stopLocalTimer();
  showPanel(endPanel);
  const results = playerEntries().map(([uid, player]) => ({
    uid,
    name: player.name || "Pony",
    score: totalScoreFor(uid)
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "de"));

  $("leaderboard").innerHTML = results.map((player, index) => `
    <div class="leader-row">
      <div class="leader-rank">#${index + 1}</div>
      <div class="leader-name">${escapeHtml(player.name)}${player.uid === state.user.uid ? " (du)" : ""}</div>
      <div class="leader-score">${player.score} P.</div>
    </div>
  `).join("");
}

async function backToLobby() {
  if (!state.isHost || !state.roomCode) return;
  state.localRoundKey = "";
  await update(ref(db, `rooms/${state.roomCode}`), {
    status: "lobby",
    currentRoundNumber: 0,
    rounds: null
  });
}

function renderFromRoom() {
  if (!state.room) return;
  setHostVisibility();
  const status = state.room.status || "lobby";
  const key = `${status}|${state.room.currentRoundNumber || 0}|${currentRoundKey()}|${Object.keys(state.room.players || {}).length}`;

  if (status === "lobby") renderLobby();
  else if (status === "playing") renderGame();
  else if (status === "scoring") renderScoring();
  else if (status === "finished") renderEnd();

  state.renderKey = key;
}

async function leaveRoom() {
  if (state.user && state.roomCode) {
    try {
      await remove(ref(db, `rooms/${state.roomCode}/players/${state.user.uid}`));
    } catch (error) {
      console.warn(error);
    }
  }
  leaveRoomLocal();
}

function leaveRoomLocal(message = "") {
  stopLocalTimer();
  if (state.roomUnsubscribe) {
    state.roomUnsubscribe();
    state.roomUnsubscribe = null;
  }
  state.room = null;
  state.roomCode = "";
  state.isHost = false;
  state.localRoundKey = "";
  state.renderKey = "";
  setHostVisibility();
  showPanel(setupPanel);
  if (message) setSetupMessage(message, true);
}

$("createRoomBtn").addEventListener("click", createRoom);
$("joinRoomBtn").addEventListener("click", joinRoom);
$("roomCodeInput").addEventListener("input", event => {
  event.target.value = normalizeRoomCode(event.target.value);
});
$("roomCodeInput").addEventListener("keydown", event => {
  if (event.key === "Enter") joinRoom();
});
$("lobbyCategoryAmount").addEventListener("change", updateLobbySettings);
$("lobbyTimerLength").addEventListener("change", updateLobbySettings);
$("hostStartBtn").addEventListener("click", startNextRound);
$("leaveRoomBtn").addEventListener("click", leaveRoom);
$("leaveRoomFromEndBtn").addEventListener("click", leaveRoom);
$("stopRoundBtn").addEventListener("click", () => stopRound("STOP gedrückt"));
$("newLetterBtn").addEventListener("click", changeLetterForAll);
$("restartTimerBtn").addEventListener("click", restartTimerForAll);
$("readyBtn").addEventListener("click", markReady);
$("nextRoundBtn").addEventListener("click", startNextRound);
$("finishGameBtn").addEventListener("click", finishGame);
$("backToLobbyBtn").addEventListener("click", backToLobby);

const dialog = $("categoriesDialog");
function renderCategoryDialog(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = CATEGORIES.filter(category => category.toLowerCase().includes(normalized));
  $("categoriesList").innerHTML = filtered.map(category => `<li>${escapeHtml(category)}</li>`).join("");
  $("dialogCount").textContent = filtered.length;
}
$("showCategoriesBtn").addEventListener("click", () => {
  renderCategoryDialog();
  $("categorySearch").value = "";
  dialog.showModal();
});
$("closeDialogBtn").addEventListener("click", () => dialog.close());
$("categorySearch").addEventListener("input", event => renderCategoryDialog(event.target.value));
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

state.offsetUnsubscribe = onValue(ref(db, ".info/serverTimeOffset"), snapshot => {
  state.serverOffset = Number(snapshot.val() || 0);
});

onAuthStateChanged(auth, user => {
  if (user) {
    state.user = user;
    setConnection("Firebase verbunden · Multiplayer bereit", "online");
    $("createRoomBtn").disabled = false;
    $("joinRoomBtn").disabled = false;
  } else {
    setConnection("Anonyme Anmeldung wird gestartet …");
  }
});

$("createRoomBtn").disabled = true;
$("joinRoomBtn").disabled = true;
signInAnonymously(auth).catch(error => {
  console.error(error);
  setConnection(`Firebase-Fehler: ${error.code || error.message}`, "error");
  setSetupMessage("Die anonyme Anmeldung hat nicht funktioniert. Prüfe Firebase Authentication.", true);
});

window.addEventListener("beforeunload", stopLocalTimer);
