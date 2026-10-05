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


const WINNER_GIFS = [
  "winner-01.gif",
  "winner-02.gif",
  "winner-03.gif",
  "winner-04.gif",
  "winner-05.gif",
  "winner-06.gif",
  "winner-07.gif",
  "winner-08.gif",
  "winner-09.gif",
  "winner-10.gif"
];

function winnerGifForGame(key) {
  const text = String(key || "pony");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return WINNER_GIFS[Math.abs(hash) % WINNER_GIFS.length];
}

function randomWinnerGif() {
  return WINNER_GIFS[Math.floor(Math.random() * WINNER_GIFS.length)];
}

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
const PROFILE_KEY = "mlp-slv-profile-v2";
const LEVEL_ORDER = ["four-different", "three-sequential", "two-same", "one-double"];

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
  playerName: "",
  profileWins: 0,
  profileLoaded: false,
  winnerPopupKey: ""
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
  const wasAlreadyVisible = !panel.classList.contains("hidden");
  [setupPanel, lobbyPanel, gamePanel, scorePanel, endPanel].forEach(p => p.classList.add("hidden"));
  panel.classList.remove("hidden");
  if (!wasAlreadyVisible) window.scrollTo({ top: 0, behavior: "smooth" });
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

function syncTimeButtons(targetId, value, disabled = false) {
  const target = $(targetId);
  if (!target) return;
  target.value = String(value);
  document.querySelectorAll(`[data-time-group="${targetId}"] .time-option`).forEach(button => {
    button.classList.toggle("selected", String(button.dataset.seconds) === String(value));
    button.disabled = disabled;
    button.setAttribute("aria-pressed", String(button.dataset.seconds) === String(value) ? "true" : "false");
  });
}

function setScoreMessage(message = "", isError = false) {
  const el = $("scoreMessage");
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "var(--danger)" : "var(--gold)";
}

function readLocalProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return {
      name: String(parsed.name || "").slice(0, 24),
      wins: Math.max(0, Number(parsed.wins || 0) || 0)
    };
  } catch {
    return { name: "", wins: 0 };
  }
}

function writeLocalProfile(name = state.playerName, wins = state.profileWins) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: String(name || "").slice(0, 24),
      wins: Math.max(0, Number(wins || 0) || 0)
    }));
  } catch (error) {
    console.warn("Profil konnte lokal nicht gespeichert werden", error);
  }
}

function updateProfileBadge() {
  $("profileWinsBadge").textContent = `🏆 ${state.profileWins} ${state.profileWins === 1 ? "Sieg" : "Siege"}`;
}

async function loadProfileForUser() {
  if (!state.user) return;
  const local = readLocalProfile();
  let remote = {};
  try {
    remote = (await get(ref(db, `profiles/${state.user.uid}`))).val() || {};
  } catch (error) {
    console.warn("Firebase-Profil konnte nicht geladen werden", error);
  }

  state.playerName = local.name || String(remote.name || "").slice(0, 24);
  state.profileWins = Math.max(Number(local.wins || 0), Number(remote.wins || 0));
  state.profileLoaded = true;

  if (state.playerName && !$("playerName").value) $("playerName").value = state.playerName;
  updateProfileBadge();
  writeLocalProfile();

  try {
    await update(ref(db, `profiles/${state.user.uid}`), {
      name: state.playerName || String(remote.name || ""),
      wins: state.profileWins,
      lastSeenAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Firebase-Profil konnte nicht synchronisiert werden", error);
  }
}

async function saveProfileName(name) {
  state.playerName = String(name || "").trim().slice(0, 24);
  writeLocalProfile();
  if (!state.user) return;
  try {
    await update(ref(db, `profiles/${state.user.uid}`), {
      name: state.playerName,
      wins: state.profileWins,
      lastSeenAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Name konnte nicht im Profil gespeichert werden", error);
  }
}

function cleanName() {
  return $("playerName").value.trim().slice(0, 24);
}

function normalizeRoomCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function randomRoomCode() {
  let result = "";
  for (let i = 0; i < 6; i += 1) result += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  return result;
}

function randomLetter(exclude = "") {
  const excluded = new Set(Array.isArray(exclude) ? exclude : [exclude]);
  const options = LETTERS.filter(letter => !excluded.has(letter));
  return options[Math.floor(Math.random() * options.length)];
}

function randomUniqueLetters(count, exclude = []) {
  const excluded = new Set(Array.isArray(exclude) ? exclude : [exclude]);
  const options = LETTERS.filter(letter => !excluded.has(letter)).sort(() => Math.random() - 0.5);
  if (options.length >= count) return options.slice(0, count);
  return LETTERS.slice().sort(() => Math.random() - 0.5).slice(0, count);
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

function totalTermsTarget(room = state.room) {
  return Number(room?.settings?.totalTerms || room?.settings?.categoryAmount || 10);
}

function isNoTimePressure(round = roundData()) {
  if (round && Object.prototype.hasOwnProperty.call(round, "noTimePressure")) return Boolean(round.noTimePressure);
  return Boolean(state.room?.settings?.noTimePressure);
}

function answerReadyBucket(round) {
  return round?.mode === "three-sequential" ? `step${Number(round.activeStep || 0)}` : "round";
}

function answerReadyState(round) {
  const bucket = answerReadyBucket(round);
  const readyMap = round?.answerReady?.[bucket] || {};
  const players = playerEntries();
  const ready = players.reduce((sum, [uid]) => sum + (readyMap?.[uid] ? 1 : 0), 0);
  return {
    bucket,
    ready,
    total: players.length,
    meReady: Boolean(state.user?.uid && readyMap?.[state.user.uid])
  };
}

function playerEntries(room = state.room) {
  return Object.entries(room?.players || {}).sort((a, b) => Number(a[1]?.joinedAt || 0) - Number(b[1]?.joinedAt || 0));
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

function lettersForRound(round) {
  if (Array.isArray(round?.letters)) return round.letters;
  if (round?.letters && typeof round.letters === "object") return Object.values(round.letters);
  return [];
}

function formatScore(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(".", ",");
}

function receivedScoreForSlot(round, targetUid, slotIndex) {
  const votes = [];
  Object.entries(round?.votes || {}).forEach(([voterUid, targets]) => {
    if (voterUid === targetUid) return;
    const raw = targets?.[targetUid]?.[slotIndex];
    if (raw === undefined || raw === null || raw === "") return;
    const points = Number(raw);
    if (Number.isFinite(points)) votes.push(points);
  });
  if (votes.length) return votes.reduce((sum, points) => sum + points, 0) / votes.length;

  // Abwärtskompatibilität zu Räumen aus der alten Version.
  const legacy = round?.scores?.[targetUid]?.[slotIndex];
  return legacy === undefined || legacy === null ? 0 : (Number(legacy) || 0);
}

function roundScoreFor(uid, round) {
  return answerSlots(round, true).reduce((sum, slot) => sum + receivedScoreForSlot(round, uid, slot.slotIndex), 0);
}

function totalScoreFor(uid, room = state.room) {
  return Object.values(room?.rounds || {}).reduce((sum, round) => sum + roundScoreFor(uid, round), 0);
}

function usedCategoryIndices(room = state.room) {
  const used = [];
  Object.values(room?.rounds || {}).forEach(round => used.push(...categoryIndicesForRound(round)));
  return used;
}

function playedTermCount(room = state.room) {
  return Object.values(room?.rounds || {}).reduce((sum, round) => sum + categoryIndicesForRound(round).length, 0);
}

// Fisher-Yates statt sort(() => Math.random() - .5): echte, gleichmäßige Durchmischung.
function shuffled(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    let j;
    if (globalThis.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buffer);
      j = buffer[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function categoryHistory(room = state.room) {
  const raw = room?.categoryHistory;
  const values = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
  return values.map(Number).filter(index => Number.isInteger(index) && index >= 0 && index < CATEGORIES.length);
}

function categoryTheme(index) {
  const text = String(CATEGORIES[index] || "").toLowerCase();
  if (text.includes("discord")) return "discord";
  if (text.includes("celestia") || text.includes("luna") || text.includes("prinzessin")) return "royal";
  if (text.includes("twilight")) return "twilight";
  if (text.includes("pinkie")) return "pinkie";
  if (text.includes("rainbow")) return "rainbow";
  if (text.includes("fluttershy")) return "fluttershy";
  if (text.includes("rarity")) return "rarity";
  if (text.includes("applejack")) return "applejack";
  if (text.includes("chrysalis")) return "chrysalis";
  if (text.includes("cutie")) return "cutiemark";
  if (text.includes("zauber") || text.includes("magisch") || text.includes("magie") || text.includes("trank")) return "magic";
  return `other-${index}`;
}

function pickCategoryIndices(count, room = state.room) {
  // Innerhalb eines Spiels: NIE dieselbe Kategorie doppelt, solange der Pool reicht.
  const usedThisGame = new Set(usedCategoryIndices(room));
  const allUnused = CATEGORIES.map((_, index) => index).filter(index => !usedThisGame.has(index));
  if (!allUnused.length) return [];

  // Zusätzlich möglichst keine Kategorien aus den letzten Spielen wiederholen.
  const recent = new Set(categoryHistory(room).slice(-40));
  const fresh = shuffled(allUnused.filter(index => !recent.has(index)));
  const older = shuffled(allUnused.filter(index => recent.has(index)));
  const pool = [...fresh, ...older];

  // In einer Mehrfachrunde möglichst verschiedene Themen mischen (z.B. nicht 3x Discord direkt nebeneinander).
  const picked = [];
  const themes = new Set();
  for (const index of pool) {
    if (picked.length >= count) break;
    const theme = categoryTheme(index);
    if (themes.has(theme)) continue;
    picked.push(index);
    themes.add(theme);
  }
  if (picked.length < count) {
    for (const index of pool) {
      if (picked.length >= count) break;
      if (!picked.includes(index)) picked.push(index);
    }
  }
  return picked;
}

function levelMeta(roundNumber) {
  const levelNumber = ((Number(roundNumber) - 1) % 4) + 1;
  const blockNumber = Math.floor((Number(roundNumber) - 1) / 4) + 1;
  return {
    levelNumber,
    blockNumber,
    mode: LEVEL_ORDER[levelNumber - 1]
  };
}

function modeCategoryCount(mode) {
  if (mode === "four-different") return 4;
  if (mode === "three-sequential") return 3;
  if (mode === "two-same") return 2;
  return 1;
}

function levelTitle(round) {
  const blockTotal = Math.ceil(totalTermsTarget() / 10);
  const prefix = blockTotal > 1 ? `Block ${round.blockNumber}/${blockTotal} · ` : "";
  if (round.mode === "three-sequential") return `${prefix}Level 2 · Frage ${Number(round.activeStep || 0) + 1}/3`;
  return `${prefix}Level ${round.levelNumber}`;
}

function levelInstruction(round) {
  if (round.mode === "four-different") return "4 Fragen gleichzeitig – jede Frage hat einen anderen Buchstaben.";
  if (round.mode === "three-sequential") return "3 Fragen nacheinander – gerade siehst du nur die aktuelle Frage.";
  if (round.mode === "two-same") return "2 Fragen gleichzeitig – beide müssen mit demselben Buchstaben beantwortet werden.";
  return "1 Frage – finde 2 verschiedene Antworten mit demselben Buchstaben.";
}

function answerSlots(round, scoring = false) {
  const indices = categoryIndicesForRound(round);
  const letters = lettersForRound(round);
  if (round.mode === "four-different") {
    return indices.map((categoryIndex, i) => ({ slotIndex: i, categoryIndex, letter: letters[i] || "?", variant: "" }));
  }
  if (round.mode === "three-sequential") {
    const all = indices.map((categoryIndex, i) => ({ slotIndex: i, categoryIndex, letter: letters[i] || "?", variant: `Frage ${i + 1}` }));
    return scoring ? all : [all[Math.min(2, Math.max(0, Number(round.activeStep || 0)))]].filter(Boolean);
  }
  if (round.mode === "two-same") {
    return indices.map((categoryIndex, i) => ({ slotIndex: i, categoryIndex, letter: round.letter || "?", variant: "" }));
  }
  const categoryIndex = indices[0];
  return [
    { slotIndex: 0, categoryIndex, letter: round.letter || "?", variant: "Antwort 1" },
    { slotIndex: 1, categoryIndex, letter: round.letter || "?", variant: "Antwort 2" }
  ];
}

function setHostVisibility() {
  document.querySelectorAll(".host-only").forEach(el => el.classList.toggle("hidden", !state.isHost));
  document.querySelectorAll(".non-host-wait").forEach(el => el.classList.toggle("hidden", state.isHost));
}

async function ensurePlayerDisconnectCleanup() {
  if (!state.user || !state.roomCode) return;
  try {
    await onDisconnect(ref(db, `rooms/${state.roomCode}/players/${state.user.uid}`)).remove();
  } catch (error) {
    console.warn("onDisconnect konnte nicht gesetzt werden", error);
  }
}

function subscribeToRoom(code) {
  if (state.roomUnsubscribe) state.roomUnsubscribe();
  state.roomUnsubscribe = onValue(ref(db, `rooms/${code}`), snapshot => {
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
  if (!state.user) return setSetupMessage("Firebase ist noch nicht bereit.", true);
  const name = cleanName();
  if (!name) {
    setSetupMessage("Bitte gib zuerst deinen Spielernamen ein.", true);
    $("playerName").focus();
    return;
  }

  $("createRoomBtn").disabled = true;
  setSetupMessage("Raum wird erstellt …");
  await saveProfileName(name);

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
          totalTerms: Number($("categoryAmount").value),
          timerLength: Number($("timerLength").value),
          noTimePressure: Boolean($("noTimePressure").checked)
        },
        players: {
          [state.user.uid]: {
            name,
            wins: state.profileWins,
            joinedAt: serverTimestamp()
          }
        }
      };
      const result = await runTransaction(roomRef, current => current === null ? initialRoom : undefined);
      created = result.committed;
    }
    if (!created) throw new Error("Kein freier Raumcode gefunden.");

    state.roomCode = code;
    state.renderKey = "";
    state.winnerPopupKey = "";
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
  if (!state.user) return setSetupMessage("Firebase ist noch nicht bereit.", true);
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
  await saveProfileName(name);

  try {
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) throw new Error("Dieser Raum wurde nicht gefunden.");

    const playerRef = ref(db, `rooms/${code}/players/${state.user.uid}`);
    const oldPlayer = (await get(playerRef)).val() || {};
    await set(playerRef, {
      ...oldPlayer,
      name,
      wins: state.profileWins,
      joinedAt: oldPlayer.joinedAt || serverTimestamp()
    });

    state.roomCode = code;
    state.renderKey = "";
    state.winnerPopupKey = "";
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

  $("playerList").innerHTML = playerEntries().map(([uid, player]) => {
    const tags = [];
    if (uid === state.room.hostUid) tags.push("HOST");
    if (uid === state.user?.uid) tags.push("DU");
    const wins = Math.max(0, Number(player.wins || 0));
    return `<div class="player-chip">
      <strong>${escapeHtml(player.name || "Pony")}</strong>
      <span>🏆 ${wins} ${wins === 1 ? "Sieg" : "Siege"}${tags.length ? ` · ${tags.join(" · ")}` : ""}</span>
    </div>`;
  }).join("");

  const settings = state.room.settings || {};
  const noTimePressure = Boolean(settings.noTimePressure);
  $("lobbyCategoryAmount").value = String(settings.totalTerms || settings.categoryAmount || 10);
  $("lobbyNoTimePressure").checked = noTimePressure;
  $("lobbyNoTimePressure").disabled = !state.isHost;
  syncTimeButtons("lobbyTimerLength", settings.timerLength ?? 90, !state.isHost || noTimePressure);
  $("lobbyCategoryAmount").disabled = !state.isHost;
  $("hostSettingsHint").textContent = state.isHost
    ? (noTimePressure
      ? "Ohne Zeitdruck ist aktiv: Jeder darf in Ruhe fertig werden. Weiter geht es erst, wenn alle fertig sind."
      : "Du bist Host. Die gewählte Rundenzeit gilt für das ganze Spiel und startet bei jedem neuen Abschnitt wieder neu. Je 10 Begriffe wird ein kompletter 4→3→2→1-Levelblock gespielt.")
    : (noTimePressure ? "Ohne Zeitdruck ist aktiv. Erst wenn alle fertig sind, geht es weiter." : "Nur der Host kann die Rundenzeit bzw. Ohne-Zeitdruck für das ganze Spiel festlegen.");
}

function currentRoundKey() {
  const round = roundData();
  if (!round) return "";
  const letterPart = round.letter || lettersForRound(round).join("");
  return `${state.room.currentRoundNumber}|${round.mode}|${round.activeStep || 0}|${letterPart}|${categoryIndicesForRound(round).join(",")}`;
}

function renderGame() {
  const round = roundData();
  if (!round) return;
  showPanel(gamePanel);

  $("roundLabel").textContent = `${levelTitle(round)} · Raum ${state.roomCode}`;
  $("levelInstruction").textContent = levelInstruction(round);
  const me = state.room.players?.[state.user.uid];
  $("playerDisplay").textContent = `${me?.name || state.playerName || "Pony"}, los geht's!`;

  const slots = answerSlots(round, false);
  if (round.mode === "four-different") {
    $("letterStatLabel").textContent = "Buchstaben";
    $("letterDisplay").textContent = lettersForRound(round).join(" · ");
    $("letterDisplay").classList.add("multi-letter");
  } else {
    $("letterStatLabel").textContent = "Buchstabe";
    $("letterDisplay").textContent = slots[0]?.letter || round.letter || "?";
    $("letterDisplay").classList.remove("multi-letter");
  }

  const relaxedMode = isNoTimePressure(round);
  const readyState = relaxedMode ? answerReadyState(round) : null;
  $("timerStatLabel").textContent = relaxedMode ? "Ohne Zeitdruck" : "Zeit";
  $("timerCard").classList.toggle("relaxed", relaxedMode);
  $("restartTimerBtn").classList.toggle("hidden", relaxedMode || !state.isHost);
  $("stopRoundBtn").classList.toggle("btn-finished", relaxedMode);
  $("stopRoundBtn").textContent = relaxedMode
    ? (readyState.meReady ? "Fertig ✓" : "Ich bin fertig ✓")
    : "STOP FÜR ALLE!";
  $("stopRoundBtn").disabled = Boolean(relaxedMode && readyState.meReady);

  if (relaxedMode) {
    $("stopHint").textContent = readyState.meReady
      ? `Du bist fertig · ${readyState.ready}/${readyState.total} Spieler fertig. Warte entspannt auf die anderen.`
      : `${readyState.ready}/${readyState.total} Spieler fertig. Du kannst in Ruhe weitermachen – niemand kann deine Zeit beenden.`;
  } else {
    $("stopHint").textContent = round.mode === "three-sequential"
      ? `STOP beendet Frage ${Number(round.activeStep || 0) + 1}. Danach kommt ${Number(round.activeStep || 0) < 2 ? "direkt die nächste Frage" : "die Auswertung"}.`
      : "Jeder Spieler kann STOP drücken. Dann endet dieses Level gleichzeitig für alle.";
  }

  const key = currentRoundKey();
  if (state.localRoundKey !== key) {
    state.localRoundKey = key;
    const form = $("answersForm");
    form.innerHTML = "";
    const myAnswers = round.answers?.[state.user.uid] || {};

    slots.forEach((slot, visualIndex) => {
      const category = CATEGORIES[slot.categoryIndex] || "Unbekannte Kategorie";
      const row = document.createElement("div");
      row.className = "answer-row";
      const prefix = round.mode === "one-double" ? slot.variant : (round.mode === "three-sequential" ? slot.variant : `${visualIndex + 1}.`);
      row.innerHTML = `
        <label class="answer-label" for="answer-${slot.slotIndex}">
          <span class="question-letter">${escapeHtml(slot.letter)}</span>
          <span><span class="answer-number">${escapeHtml(prefix)}</span>${escapeHtml(category)}</span>
        </label>
        <input class="answer-input" id="answer-${slot.slotIndex}" data-index="${slot.slotIndex}" autocomplete="off" spellcheck="false" placeholder="Antwort mit ${escapeHtml(slot.letter)} …" value="${escapeHtml(myAnswers[slot.slotIndex] || "")}">
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
  }

  $("answersForm").querySelectorAll(".answer-input").forEach(input => {
    input.disabled = Boolean(relaxedMode && readyState?.meReady);
  });

  startRoundClock(round);
}

function startRoundClock(round) {
  stopLocalTimer();
  const timerCard = $("timerCard");
  timerCard.classList.remove("warning", "danger");

  if (isNoTimePressure(round)) {
    timerCard.classList.add("relaxed");
    $("timerDisplay").textContent = "∞";
    return;
  }

  timerCard.classList.remove("relaxed");
  const updateClock = () => {
    const duration = Number(round.duration || state.room.settings?.timerLength || 90);
    timerCard.classList.remove("warning", "danger");
    const seconds = Math.max(0, Math.ceil((Number(round.endsAt) - serverNow()) / 1000));
    $("timerDisplay").textContent = formatTime(seconds);
    if (seconds <= 15) timerCard.classList.add("danger");
    else if (seconds <= 30) timerCard.classList.add("warning");

    if (seconds <= 0) {
      stopLocalTimer();
      if (state.isHost && state.room?.status === "playing") advanceOrScore("Zeit abgelaufen");
    }
  };
  updateClock();
  state.timerId = setInterval(updateClock, 250);
}

async function updateLobbySettings() {
  if (!state.isHost || !state.roomCode) return;
  await update(ref(db, `rooms/${state.roomCode}/settings`), {
    totalTerms: Number($("lobbyCategoryAmount").value),
    timerLength: Number($("lobbyTimerLength").value),
    noTimePressure: Boolean($("lobbyNoTimePressure").checked)
  });
}

function makeRound(nextNumber) {
  const meta = levelMeta(nextNumber);
  const duration = Number(state.room.settings?.timerLength ?? 90);
  const noTimePressure = Boolean(state.room.settings?.noTimePressure);
  const categoryIndices = pickCategoryIndices(modeCategoryCount(meta.mode));
  const startedAt = serverNow();
  const round = {
    mode: meta.mode,
    levelNumber: meta.levelNumber,
    blockNumber: meta.blockNumber,
    categoryIndices,
    duration,
    noTimePressure,
    startedAt,
    endsAt: noTimePressure ? 0 : startedAt + duration * 1000,
    answers: {},
    answerReady: {},
    votes: {},
    ready: {}
  };

  if (meta.mode === "four-different") round.letters = randomUniqueLetters(4);
  if (meta.mode === "three-sequential") {
    round.letters = randomUniqueLetters(3);
    round.activeStep = 0;
  }
  if (meta.mode === "two-same" || meta.mode === "one-double") round.letter = randomLetter();
  return round;
}

async function startNextRound() {
  if (!state.isHost || !state.roomCode || !state.room) return;
  if (playedTermCount() >= totalTermsTarget()) return finishGame();
  const nextNumber = Number(state.room.currentRoundNumber || 0) + 1;
  const round = makeRound(nextNumber);
  const history = [...categoryHistory(), ...categoryIndicesForRound(round)].slice(-40);
  state.localRoundKey = "";
  await update(ref(db, `rooms/${state.roomCode}`), {
    status: "playing",
    currentRoundNumber: nextNumber,
    categoryHistory: history,
    [`rounds/${nextNumber}`]: round
  });
}

async function saveVisibleAnswers() {
  if (!state.user || !state.roomCode || state.room?.status !== "playing") return;
  const roundNumber = Number(state.room.currentRoundNumber);
  const writes = Array.from($("answersForm").querySelectorAll(".answer-input")).map(input => {
    const answerIndex = input.dataset.index;
    const value = input.value.slice(0, 120);
    return set(ref(db, `rooms/${state.roomCode}/rounds/${roundNumber}/answers/${state.user.uid}/${answerIndex}`), value || null);
  });
  await Promise.all(writes);
}

async function markAnswerFinished() {
  if (!state.user || !state.roomCode || state.room?.status !== "playing") return;
  try {
    await saveVisibleAnswers();
  } catch (error) {
    console.error("Antworten konnten vor dem Fertigmelden nicht gespeichert werden", error);
  }
  const expectedRoundNumber = Number(state.room.currentRoundNumber);
  const expectedStep = Number(roundData()?.activeStep || 0);
  const now = serverNow();

  try {
    await runTransaction(ref(db, `rooms/${state.roomCode}`), room => {
      if (!room || room.status !== "playing" || Number(room.currentRoundNumber) !== expectedRoundNumber) return;
      const round = room.rounds?.[expectedRoundNumber];
      if (!round || !Boolean(round.noTimePressure ?? room.settings?.noTimePressure)) return;
      if (round.mode === "three-sequential" && Number(round.activeStep || 0) !== expectedStep) return;

      const bucket = round.mode === "three-sequential" ? `step${Number(round.activeStep || 0)}` : "round";
      round.answerReady = round.answerReady || {};
      round.answerReady[bucket] = round.answerReady[bucket] || {};
      round.answerReady[bucket][state.user.uid] = true;

      const playerUids = Object.keys(room.players || {});
      const allFinished = playerUids.length > 0 && playerUids.every(uid => Boolean(round.answerReady[bucket]?.[uid]));
      if (!allFinished) return room;

      if (round.mode === "three-sequential") {
        const activeStep = Number(round.activeStep || 0);
        if (activeStep < 2) {
          round.activeStep = activeStep + 1;
          round.startedAt = now;
          round.lastAdvanceReason = "Alle fertig";
          return room;
        }
      }

      room.status = "scoring";
      round.stoppedAt = now;
      round.stopReason = "Alle fertig";
      return room;
    });
  } catch (error) {
    console.error("Fertig-Status konnte nicht gespeichert werden", error);
  }
}

async function advanceOrScore(reason = "STOP") {
  if (!state.roomCode || state.room?.status !== "playing") return;
  const expectedRoundNumber = Number(state.room.currentRoundNumber);
  const expectedStep = Number(roundData()?.activeStep || 0);
  const now = serverNow();
  const roomRef = ref(db, `rooms/${state.roomCode}`);

  try {
    await runTransaction(roomRef, room => {
      if (!room || room.status !== "playing" || Number(room.currentRoundNumber) !== expectedRoundNumber) return;
      const round = room.rounds?.[expectedRoundNumber];
      if (!round) return;

      if (round.mode === "three-sequential") {
        const activeStep = Number(round.activeStep || 0);
        if (activeStep !== expectedStep) return;
        if (activeStep < 2) {
          round.activeStep = activeStep + 1;
          round.startedAt = now;
          round.endsAt = now + Number(round.duration || room.settings?.timerLength || 90) * 1000;
          round.lastAdvanceReason = reason;
          return room;
        }
      }

      room.status = "scoring";
      round.stoppedAt = now;
      round.stopReason = reason;
      return room;
    });
  } catch (error) {
    console.error(error);
  }
}

async function rerollLetters() {
  if (!state.isHost || !state.roomCode) return;
  const roundNumber = Number(state.room.currentRoundNumber);
  const roundRef = ref(db, `rooms/${state.roomCode}/rounds/${roundNumber}`);
  state.localRoundKey = "";

  await runTransaction(roundRef, round => {
    if (!round) return;
    if (round.mode === "four-different") {
      round.letters = randomUniqueLetters(4, lettersForRound(round));
      round.answers = {};
    } else if (round.mode === "three-sequential") {
      const step = Number(round.activeStep || 0);
      const letters = lettersForRound(round);
      const old = letters[step] || "";
      letters[step] = randomLetter([...letters, old]);
      round.letters = letters;
      const answers = round.answers || {};
      Object.keys(answers).forEach(uid => {
        if (answers[uid]) delete answers[uid][step];
      });
      round.answers = answers;
    } else {
      round.letter = randomLetter(round.letter || "");
      round.answers = {};
    }
    round.answerReady = {};
    return round;
  });
}

async function restartTimerForAll() {
  if (!state.isHost) return;
  const round = roundData();
  if (!round || isNoTimePressure(round)) return;
  const duration = Number(round.duration ?? state.room.settings?.timerLength ?? 90);
  const now = serverNow();
  await update(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}`), {
    startedAt: now,
    endsAt: now + duration * 1000
  });
}

function playerReadyCount(round) {
  const players = playerEntries();
  let ready = 0;
  players.forEach(([uid]) => { if (round?.ready?.[uid]) ready += 1; });
  return { ready, total: players.length };
}

function requiredVotesFor(voterUid, round) {
  const slots = answerSlots(round, true);
  const missing = [];
  playerEntries().forEach(([targetUid, player]) => {
    if (targetUid === voterUid) return;
    slots.forEach(slot => {
      const answer = String(round?.answers?.[targetUid]?.[slot.slotIndex] || "").trim();
      if (!answer) return;
      const vote = round?.votes?.[voterUid]?.[targetUid]?.[slot.slotIndex];
      if (vote === undefined || vote === null || vote === "") {
        missing.push({ targetUid, playerName: player?.name || "Pony", slotIndex: slot.slotIndex });
      }
    });
  });
  return missing;
}

function renderScoring() {
  stopLocalTimer();
  showPanel(scorePanel);
  const round = roundData();
  if (!round) return;

  const roundNumber = state.room.currentRoundNumber;
  $("scoreRoundLabel").textContent = `Auswertung · ${levelTitle(round)} · Raum ${state.roomCode}`;
  setScoreMessage("");

  const slots = answerSlots(round, true);
  const players = playerEntries();
  const meReady = Boolean(round.ready?.[state.user.uid]);
  const readyState = playerReadyCount(round);
  const allRatingsFinished = readyState.total > 0 && readyState.ready >= readyState.total;
  const container = $("scoreList");
  container.innerHTML = "";
  // Eigene Punkte werden vor dem Spielende nirgends angezeigt.

  slots.forEach((slot, visualIndex) => {
    const item = document.createElement("div");
    item.className = "score-item";
    const category = CATEGORIES[slot.categoryIndex] || "Unbekannte Kategorie";
    const rows = players.map(([uid, player]) => {
      const answer = String(round.answers?.[uid]?.[slot.slotIndex] || "");
      const isMe = uid === state.user.uid;
      let scoring = "";

      if (isMe) {
        if (!answer.trim()) {
          scoring = `<span class="score-hidden">🔒 Eigene Punkte bis zum Spielende verborgen · Antwort leer</span>`;
        } else {
          scoring = `<span class="score-hidden">🔒 Eigene Punkte bis zum Spielende verborgen</span>`;
        }
      } else if (!answer.trim()) {
        scoring = `<span class="empty-answer">0 P. · keine Antwort</span>`;
      } else {
        const myVote = round.votes?.[state.user.uid]?.[uid]?.[slot.slotIndex];
        scoring = `<div class="score-buttons" data-target="${escapeHtml(uid)}" data-index="${slot.slotIndex}">${[0, 5, 10, 20].map(points => `<button class="point-btn ${points === 0 ? "zero" : ""} ${points === 20 ? "twenty" : ""} ${Number(myVote) === points ? "selected" : ""}" type="button" data-points="${points}" ${meReady ? "disabled" : ""}>${points}</button>`).join("")}</div>`;
      }

      return `<div class="comparison-row ${isMe ? "me" : ""}">
        <div class="comparison-name">${escapeHtml(player.name || "Pony")}${isMe ? " (du)" : ""}</div>
        <div class="comparison-answer ${answer ? "" : "empty-answer"}">${answer ? escapeHtml(answer) : "keine Antwort"}</div>
        <div>${scoring}</div>
      </div>`;
    }).join("");

    const variant = slot.variant ? `<small>${escapeHtml(slot.variant)}</small>` : "";
    item.innerHTML = `<div class="score-category"><span class="score-letter">${escapeHtml(slot.letter)}</span>${visualIndex + 1}. ${escapeHtml(category)} ${variant}</div><div class="comparison-list">${rows}</div>`;
    container.appendChild(item);
  });

  container.querySelectorAll(".score-buttons .point-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const group = button.closest(".score-buttons");
      const targetUid = group.dataset.target;
      const answerIndex = group.dataset.index;
      const points = Number(button.dataset.points);
      if (!targetUid || targetUid === state.user.uid || meReady) return;
      await set(ref(db, `rooms/${state.roomCode}/rounds/${roundNumber}/votes/${state.user.uid}/${targetUid}/${answerIndex}`), points);
    });
  });

  $("readyStatus").textContent = `${readyState.ready}/${readyState.total} Spieler fertig`;
  $("readyBtn").disabled = meReady;
  $("readyBtn").textContent = meReady ? "Bewertung abgeschlossen ✓" : "Bewertung der anderen fertig";

  const missing = requiredVotesFor(state.user.uid, round);
  if (allRatingsFinished) {
    setScoreMessage("Alle Bewertungen dieser Runde sind abgeschlossen. Dein eigener Punktestand bleibt bis zum Spielende verborgen. 🔒");
  } else if (!meReady && missing.length) {
    setScoreMessage(`Noch ${missing.length} Antwort${missing.length === 1 ? "" : "en"} der anderen bewerten. Dein eigener Punktestand bleibt bis zum Spielende verborgen.`);
  } else if (meReady) {
    setScoreMessage("Deine Bewertungen sind gespeichert. Deinen eigenen Punktestand siehst du erst am Spielende. ✓");
  } else {
    setScoreMessage("Bewerte die Antworten der anderen. Deinen eigenen Punktestand siehst du erst am Spielende.");
  }

  const gameComplete = playedTermCount() >= totalTermsTarget();
  $("nextRoundBtn").textContent = gameComplete ? "Gewinner anzeigen 👑" : "Nächstes Level starten";
  $("nextRoundBtn").disabled = readyState.total === 0 || readyState.ready < readyState.total;
  $("finishGameBtn").classList.toggle("hidden", !state.isHost || gameComplete);
  $("waitForHostText").textContent = gameComplete
    ? "Alle Bewertungen fertig? Dann zeigt der Host den Gewinner an."
    : "Warte darauf, dass der Host das nächste Level startet.";
}

async function markReady() {
  const round = roundData();
  if (!round) return;
  const missing = requiredVotesFor(state.user.uid, round);
  if (missing.length) {
    setScoreMessage(`Bitte bewerte zuerst noch ${missing.length} Antwort${missing.length === 1 ? "" : "en"} der anderen.`, true);
    return;
  }
  await set(ref(db, `rooms/${state.roomCode}/rounds/${state.room.currentRoundNumber}/ready/${state.user.uid}`), true);
}

function calculateResults(room = state.room) {
  return playerEntries(room).map(([uid, player]) => ({
    uid,
    name: player.name || "Pony",
    score: totalScoreFor(uid, room),
    wins: Math.max(0, Number(player.wins || 0))
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "de"));
}

async function finishGame() {
  if (!state.isHost || !state.roomCode || !state.room) return;
  const results = calculateResults();
  if (!results.length) return;
  const maxScore = results[0].score;
  const winnerUids = results.filter(player => player.score === maxScore).map(player => player.uid);
  const now = serverNow();
  const selectedWinnerGif = randomWinnerGif();

  const transaction = await runTransaction(ref(db, `rooms/${state.roomCode}`), room => {
    if (!room) return;
    if (room.winnerRecorded) return;
    room.status = "finished";
    room.finishedAt = now;
    room.winnerRecorded = true;
    room.winnerScore = maxScore;
    room.winnerGif = selectedWinnerGif;
    room.winnerUids = {};
    winnerUids.forEach(uid => { room.winnerUids[uid] = true; });
    return room;
  });

  if (!transaction.committed) return;

  for (const uid of winnerUids) {
    try {
      const winTx = await runTransaction(ref(db, `profiles/${uid}/wins`), current => Math.max(0, Number(current || 0)) + 1);
      const newWins = Math.max(0, Number(winTx.snapshot.val() || 0));
      await set(ref(db, `rooms/${state.roomCode}/players/${uid}/wins`), newWins);
      if (uid === state.user.uid) {
        state.profileWins = newWins;
        updateProfileBadge();
        writeLocalProfile();
      }
    } catch (error) {
      console.warn("Sieg konnte nicht gespeichert werden", error);
    }
  }
}

function renderEnd() {
  stopLocalTimer();
  showPanel(endPanel);
  const results = calculateResults();
  $("leaderboard").innerHTML = results.map((player, index) => `
    <div class="leader-row">
      <div class="leader-rank">#${index + 1}</div>
      <div class="leader-name">${escapeHtml(player.name)}${player.uid === state.user.uid ? " (du)" : ""}<small>🏆 ${player.wins} ${player.wins === 1 ? "Sieg" : "Siege"}</small></div>
      <div class="leader-score">${formatScore(player.score)} P.</div>
    </div>
  `).join("");

  const maxScore = results[0]?.score ?? 0;
  const winners = results.filter(player => player.score === maxScore);
  const popupKey = String(state.room.finishedAt || "finished");
  if (state.winnerPopupKey !== popupKey) {
    state.winnerPopupKey = popupKey;
    $("winnerName").textContent = winners.map(player => player.name).join(" & ");
    $("winnerTitle").textContent = winners.length > 1 ? "Pony-Champions!" : "Pony-Champion!";
    $("winnerScore").textContent = `${formatScore(maxScore)} Punkte`;
    const gifFile = state.room.winnerGif || winnerGifForGame(`${state.roomCode || "room"}-${popupKey}-${maxScore}`);
    $("winnerGif").src = `${gifFile}?v=${encodeURIComponent(popupKey)}`;
    $("winnerPopup").classList.remove("hidden");
  }
}

async function backToLobby() {
  if (!state.isHost || !state.roomCode) return;
  state.localRoundKey = "";
  state.winnerPopupKey = "";
  await update(ref(db, `rooms/${state.roomCode}`), {
    status: "lobby",
    currentRoundNumber: 0,
    rounds: null,
    winnerRecorded: null,
    winnerUids: null,
    winnerScore: null,
    winnerGif: null,
    finishedAt: null
  });
}

function renderFromRoom() {
  if (!state.room) return;
  setHostVisibility();
  const status = state.room.status || "lobby";
  if (status === "lobby") renderLobby();
  else if (status === "playing") renderGame();
  else if (status === "scoring") renderScoring();
  else if (status === "finished") renderEnd();
}

async function leaveRoom() {
  if (state.user && state.roomCode) {
    try { await remove(ref(db, `rooms/${state.roomCode}/players/${state.user.uid}`)); }
    catch (error) { console.warn(error); }
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
  state.winnerPopupKey = "";
  $("winnerPopup").classList.add("hidden");
  setHostVisibility();
  showPanel(setupPanel);
  if (message) setSetupMessage(message, true);
}

async function hostNextAction() {
  if (!state.isHost) return;
  if (playedTermCount() >= totalTermsTarget()) await finishGame();
  else await startNextRound();
}

document.querySelectorAll(".time-choice .time-option").forEach(button => {
  button.addEventListener("click", async () => {
    const group = button.closest(".time-choice");
    const targetId = group?.dataset.timeGroup;
    if (!targetId) return;
    if (targetId === "lobbyTimerLength" && !state.isHost) return;
    syncTimeButtons(targetId, Number(button.dataset.seconds), false);
    if (targetId === "lobbyTimerLength") await updateLobbySettings();
  });
});
function syncSetupPressureUI() {
  const relaxed = Boolean($("noTimePressure").checked);
  syncTimeButtons("timerLength", Number($("timerLength").value || 90), relaxed);
}

syncTimeButtons("timerLength", 90, false);
$("noTimePressure").addEventListener("change", syncSetupPressureUI);
$("lobbyNoTimePressure").addEventListener("change", updateLobbySettings);

$("createRoomBtn").addEventListener("click", createRoom);
$("joinRoomBtn").addEventListener("click", joinRoom);
$("playerName").addEventListener("change", () => {
  const name = cleanName();
  if (name) saveProfileName(name);
});
$("roomCodeInput").addEventListener("input", event => { event.target.value = normalizeRoomCode(event.target.value); });
// Enter soll im gesamten Spiel keine Aktion auslösen.
// So kann weder versehentlich ein Formular abgesendet noch ein Raum verlassen/neu geladen werden.
document.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
}, true);

$("answersForm").addEventListener("submit", event => event.preventDefault());
$("lobbyCategoryAmount").addEventListener("change", updateLobbySettings);

$("hostStartBtn").addEventListener("click", startNextRound);
$("leaveRoomBtn").addEventListener("click", leaveRoom);
$("leaveRoomFromEndBtn").addEventListener("click", leaveRoom);
$("stopRoundBtn").addEventListener("click", () => {
  if (isNoTimePressure()) markAnswerFinished();
  else advanceOrScore("STOP gedrückt");
});
$("newLetterBtn").addEventListener("click", rerollLetters);
$("restartTimerBtn").addEventListener("click", restartTimerForAll);
$("readyBtn").addEventListener("click", markReady);
$("nextRoundBtn").addEventListener("click", hostNextAction);
$("finishGameBtn").addEventListener("click", finishGame);
$("backToLobbyBtn").addEventListener("click", backToLobby);
function closeWinnerPopup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  $("winnerPopup").classList.add("hidden");
}

// Der komplette Schließen-Button ist eine echte, große Klick-/Touch-Fläche.
$("winnerCloseBtn").addEventListener("click", closeWinnerPopup);
$("winnerPopup").addEventListener("click", event => {
  if (event.target === $("winnerPopup")) closeWinnerPopup(event);
});

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
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

const initialLocalProfile = readLocalProfile();
if (initialLocalProfile.name) $("playerName").value = initialLocalProfile.name;
state.playerName = initialLocalProfile.name;
state.profileWins = initialLocalProfile.wins;
updateProfileBadge();

state.offsetUnsubscribe = onValue(ref(db, ".info/serverTimeOffset"), snapshot => {
  state.serverOffset = Number(snapshot.val() || 0);
});

onAuthStateChanged(auth, async user => {
  if (user) {
    state.user = user;
    await loadProfileForUser();
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
