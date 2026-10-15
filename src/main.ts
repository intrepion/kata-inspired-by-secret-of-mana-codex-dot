import "./style.css";
import {
  AREAS,
  DT,
  WIDTH,
  HEIGHT,
  createGame,
  step,
  attack,
  attackPower,
  cancelAttack,
  setAttackHeld,
  cast,
  switchParty,
  heal,
  interact,
  retry,
  serialize,
  restore,
  say,
  nearestEnemy,
  type Game,
  type Point,
} from "./domain";
import { draw } from "./render";
const SAVE = "wildheart-journey-v1";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<header class="masthead"><a class="brand" href="#" aria-label="Lanterns of the Wildheart home"><img src="/lantern.svg" alt=""/><span>LANTERNS <small>OF THE WILDHEART</small></span></a><div class="edition"><span class="live-dot"></span> AN ORIGINAL ADVENTURE <b>VOL. 01</b></div><button id="sound" class="quiet" aria-pressed="false">♫ Sound off</button></header>
<main><section class="intro"><div><p class="eyebrow">THREE TRAVELERS · ONE LIVING FOREST</p><h1>Carry the light.<br><em>Find your way home.</em></h1></div><p class="intro-copy">Beyond the last village, the forest has forgotten its song.<br>Take up your lantern. Some things are worth waking.</p></section>
<div class="adventure-layout"><section class="game-column" aria-label="Adventure"><div class="stage-wrap"><div class="stage-heading"><div><span id="area-subtitle" class="eyebrow"></span><h2 id="area-name"></h2></div><span class="compass">N <span>✧</span></span></div><canvas id="world" width="960" height="576" tabindex="0" role="img" aria-label="Adventure field. Click to walk. WASD or arrow keys to move, Space to strike, F magic, Q switch, E interact."></canvas><div class="stage-footer"><span id="world-status"></span><span>CLICK TO WALK <span class="separator">/</span> WASD TO MOVE</span></div><div id="bossbar" class="bossbar" hidden></div><div id="overlay" class="overlay" hidden></div></div>
<div id="party" class="party" aria-label="Party status"></div>
<div class="actions"><div class="action-main"><button id="strike" class="action primary"><span>⚔</span> Strike <kbd>SPACE</kbd></button><button id="magic" class="action"><span>✦</span> Magic <kbd>F</kbd></button><button id="interact" class="action"><span>◇</span> Interact <kbd>E</kbd></button><button id="commands" class="action"><span>☷</span> Commands <kbd>ESC</kbd></button></div><div class="touch-move" aria-label="Movement"><button data-move="0,-1" aria-label="Move north">↑</button><button data-move="-1,0" aria-label="Move west">←</button><button data-move="0,1" aria-label="Move south">↓</button><button data-move="1,0" aria-label="Move east">→</button></div></div>
<p id="narration" class="narration" aria-live="polite"></p></section>
<aside><div class="quest-card"><p class="eyebrow">YOUR JOURNEY</p><h2>A forest, <br>waiting to bloom.</h2><p id="objective"></p><div class="embers" id="embers"></div><div id="route" class="route"></div><div class="quest-note"><span>✧</span><p>Waystones restore health, mana and flasks. Return whenever the road grows heavy.</p></div></div><div class="field-notes"><p class="eyebrow">FIELD NOTES</p><div><b>01</b><p><strong>A rhythm, not a race.</strong>Face your foe. Recover to 100%, or hold and release a charged strike.</p></div><div><b>02</b><p><strong>Watch the ground.</strong>Step out of amber warning circles before they burst.</p></div><div><b>03</b><p><strong>Three lights together.</strong>Switch with Q. Your companions follow and fight beside you.</p></div><button id="help" class="text-button">Read the traveler's guide ↗</button></div></aside></div>
<footer><span>HANDCRAFTED WORLDS · ORIGINAL CHARACTERS</span><span>Save locally. Adventure freely. <button id="motion" class="text-button">Reduced motion: off</button></span></footer></main>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>("world");
const ctx = canvas.getContext("2d")!;
let game = createGame(),
  paused = true,
  menu = "title",
  target: Point | undefined,
  keys = new Set<string>(),
  pointerMove = { dx: 0, dy: 0 },
  strikePointers = new Set<number>();
let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let audio: AudioContext | undefined,
  sound = false,
  nextNote = 0;
let lastSaveSignature = "",
  lastUi = 0;
const objective = () =>
  game.mode === "victory"
    ? "The forest sings again. Your light is part of its story."
    : game.area === 0
      ? "Seek the eastern arch. Three lantern embers will open the Heartroot."
      : game.cleared.includes(game.area)
        ? "A guardian is free. Follow the eastern arch to the next region."
        : `Calm ${AREAS[game.area].boss} and reclaim the forest’s light.`;
function clearInput() {
  keys.clear();
  pointerMove = { dx: 0, dy: 0 };
  strikePointers.clear();
  cancelAttack(game);
  setAttackHeld(game, false);
  target = undefined;
}
function save() {
  try {
    localStorage.setItem(SAVE, serialize(game));
    say(game, "Journey saved on this device.");
    return true;
  } catch {
    say(
      game,
      "This browser cannot store the journey. Keep this tab open to continue.",
    );
    return false;
  }
}
function saved(): Game | undefined {
  try {
    const raw = localStorage.getItem(SAVE);
    return raw ? restore(raw) : undefined;
  } catch {
    return;
  }
}
let resetOrigin = "commands",
  guideOrigin = "commands";
function open(kind: string) {
  if (kind === "reset") resetOrigin = menu;
  if (kind === "guide") guideOrigin = menu;
  clearInput();
  paused = true;
  menu = kind;
  const o = $("overlay");
  o.hidden = false;
  let title = "",
    body = "",
    buttons = "";
  if (kind === "title") {
    title = "The forest is calling.";
    body =
      "Three travelers. Three lantern embers. A heart that has forgotten how to grow.";
    buttons = `<button data-do="begin" class="gold">Begin the journey <span>→</span></button>${saved() ? '<button data-do="continue">Continue saved journey</button>' : ""}<button data-do="guide">How to play</button>`;
  }
  if (kind === "guide") {
    title = "A traveler’s guide";
    body = `<div class="guide-grid"><p><b>Move</b>WASD / arrows, click the field, or tap / hold direction buttons.</p><p><b>Strike · Space / Z</b>Tap and release to swing in your facing direction. Early swings are weak; power returns to 100% in 0.65 seconds. Hold after recovery to build charge up to the weapon tier; release once to strike. Be within 66 steps.</p><p><b>Magic · F / X</b>Targets the nearest foe within 250 steps. Ember burns; Tide slows; Gale interrupts. Costs 8 mana, recharges in 1.8 seconds.</p><p><b>Party · Q / 1–3</b>Switch your leader. Companions follow and fight. Fallen travelers are skipped.</p><p><b>Interact · E / Enter</b>Use the waystone or an arch when nearby. Heal and revive with H or a sunflask.</p><p><b>Rest & save</b>Waystones replenish everything. Mana also regenerates. Defeat returns you to your checkpoint.</p></div><p class="guide-tip">Calm each guardian to unlock the eastern arch. Amber circles warn before a strike. Keep moving!</p>`;
    buttons = '<button data-do="close" class="gold">Ready to travel →</button>';
  }
  if (kind === "commands") {
    title = "A moment by the lantern";
    body = `<p>WEAPON TIER ${game.weapon} · ${game.flasks} SUNFLASKS · ${game.cleared.filter((n) => n < 4).length}/3 EMBERS</p><div class="command-grid"><button data-do="heal">☀ Sunflask<br><small>Heal & revive everyone · H</small></button><button data-do="cast">✦ ${game.party[game.leader].element.toUpperCase()}<br><small>Nearest foe · 8 mana</small></button><button data-do="switch">⇄ Switch leader<br><small>Next living traveler · Q</small></button><button data-do="tactic">⇄ Companions: ${game.tactic === "fight" ? "Engage" : "Follow"}<br><small>Toggle fighting / close formation</small></button><button data-do="save">◇ Save journey<br><small>This browser, this device</small></button></div>`;
    buttons =
      '<button data-do="close" class="gold">Return to the forest →</button><button data-do="guide">Traveler’s guide</button><button data-do="reset" class="danger">New journey…</button>';
  }
  if (kind === "reset") {
    title = "Start a new journey?";
    body =
      "Your saved journey will be replaced only when you choose “Start anew”. You can keep your current adventure.";
    buttons =
      '<button data-do="close" class="gold">Keep my journey</button><button data-do="new" class="danger">Start anew</button>';
  }
  if (kind === "defeat") {
    title = "Even lanterns need a dawn.";
    body = `The hush has overcome your party. The waystone in ${AREAS[game.checkpoint].name} remembers you. Your lanterns and weapon progress remain.`;
    buttons =
      '<button data-do="retry" class="gold">Rise at the waystone →</button><button data-do="guide">Read the guide</button>';
  }
  if (kind === "victory") {
    title = "And the forest sang.";
    body = `<p>Rowan set a lantern among the roots. Neri taught the river its oldest song. Luma let the wind carry it beyond the hills.</p><p>The Warden opened its hands. There was room for sorrow, and still more room for spring.</p><p>In Hearthwell, one small window glowed all night. The travelers were coming home.</p><div class="ending-seal">✧ ${game.cleared.length} GUARDIANS FREED · THREE LIGHTS, ONE HEART ✧</div>`;
    buttons =
      '<button data-do="reset" class="gold">Walk the road again →</button>';
  }
  o.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><p class="eyebrow">LANTERNS OF THE WILDHEART</p><h2 id="dialog-title">${title}</h2><div class="modal-body">${body}</div><div class="modal-actions">${buttons}</div></div>`;
  o.querySelectorAll<HTMLButtonElement>("[data-do]").forEach((b) =>
    b.addEventListener("click", () => action(b.dataset.do!)),
  );
  o.querySelector<HTMLButtonElement>("button")?.focus();
  update();
}
function close(authorizedStart = false) {
  if (!authorizedStart && menu === "title") return;
  if (
    !authorizedStart &&
    ((menu === "reset" && resetOrigin === "title") ||
      (menu === "guide" && guideOrigin === "title"))
  ) {
    open("title");
    return;
  }
  if (game.mode !== "play") {
    open(game.mode);
    return;
  }
  paused = false;
  menu = "";
  $("overlay").hidden = true;
  clearInput();
  canvas.focus();
}
function action(kind: string) {
  if (kind === "begin" && saved()) {
    open("reset");
    return;
  }
  if (kind === "begin" || kind === "new") {
    game = createGame();
    lastSaveSignature = "";
    save();
    close(true);
  } else if (kind === "continue") {
    const g = saved();
    if (g) {
      game = g;
      close(true);
    }
  } else if (kind === "close") {
    if (
      (menu === "reset" && resetOrigin === "title") ||
      (menu === "guide" && guideOrigin === "title")
    )
      open("title");
    else close();
  } else if (kind === "guide") open("guide");
  else if (kind === "reset") open("reset");
  else if (kind === "retry") {
    retry(game);
    save();
    close();
  } else if (kind === "tactic") {
    game.tactic = game.tactic === "fight" ? "follow" : "fight";
    say(
      game,
      game.tactic === "fight"
        ? "Companions will engage nearby enemies."
        : "Companions will follow without attacking.",
    );
    open("commands");
  } else if (kind === "save") {
    save();
    open("commands");
  } else if (kind === "heal") {
    heal(game);
    close();
  } else if (kind === "cast") {
    cast(game);
    close();
  } else if (kind === "switch") {
    switchParty(game);
    close();
  }
  update();
}
function interactNow() {
  if (paused) return;
  const result = interact(game);
  target = undefined;
  if (result === "checkpoint") save();
  update();
}
function update() {
  const p = game.party[game.leader],
    a = AREAS[game.area];
  $("area-name").textContent = a.name;
  $("area-subtitle").textContent = a.subtitle;
  $("world-status").textContent =
    game.area === 0
      ? "SAFE HAVEN"
      : game.cleared.includes(game.area)
        ? "LIGHT RESTORED"
        : "THE HUSH LINGERS";
  $("objective").textContent = objective();
  $("embers").innerHTML =
    [1, 2, 3]
      .map(
        (n) =>
          `<span class="ember ${game.cleared.includes(n) ? "lit" : ""}" title="${AREAS[n].name}">✦</span>`,
      )
      .join("") +
    `<small>${game.cleared.filter((n) => n < 4).length} / 3 LANTERN EMBERS</small>`;
  $("route").innerHTML = AREAS.map(
    (r, i) =>
      `<div class="route-item ${i === game.area ? "current" : ""} ${game.cleared.includes(i) ? "complete" : ""}"><span>${i === 0 ? "⌂" : game.cleared.includes(i) ? "✓" : `0${i}`}</span><div>${r.name}<small>${i === game.area ? "YOU ARE HERE" : game.cleared.includes(i) ? "LIGHT RESTORED" : i > 1 && !game.cleared.includes(i - 1) ? "AWAITING YOUR LIGHT" : "THE ROAD AHEAD"}</small></div>${i === game.area ? "<b>←</b>" : ""}</div>`,
  ).join("");
  const cards = $("party");
  if (!cards.children.length) {
    cards.innerHTML = game.party
      .map(
        (q, i) =>
          `<button class="traveler" data-party="${i}" aria-label="Lead as ${q.name}"><span class="portrait" style="--hero:${q.color}"><span>✦</span></span><span class="traveler-info"><span class="traveler-heading"><strong>${q.name}</strong><small class="role"></small></span><span class="bar health"><i></i></span><span class="stats"></span><span class="bar mana"><i></i></span><span class="bar power"><i></i></span><span class="recovery"></span></span></button>`,
      )
      .join("");
    cards.querySelectorAll<HTMLButtonElement>("button").forEach(
      (b) =>
        (b.onclick = () => {
          if (!paused) {
            switchParty(game, Number(b.dataset.party));
            target = undefined;
            update();
          }
        }),
    );
  }
  game.party.forEach((q, i) => {
    const card = cards.children[i] as HTMLElement;
    card.classList.toggle("selected", i === game.leader);
    card.classList.toggle("fallen", q.hp <= 0);
    card.querySelector(".role")!.textContent =
      q.hp <= 0
        ? "FALLEN"
        : i === game.leader
          ? "LEADER"
          : q.element.toUpperCase();
    (card.querySelector(".health i") as HTMLElement).style.width =
      `${(q.hp / q.maxHp) * 100}%`;
    (card.querySelector(".mana i") as HTMLElement).style.width =
      `${(q.mp / 36) * 100}%`;
    card.querySelector(".stats")!.textContent =
      `${Math.ceil(q.hp)} HP · ${Math.floor(q.mp)} MP`;
    const charging =
      i === game.leader && game.melee.held && !game.melee.canceled;
    (card.querySelector(".power i") as HTMLElement).style.width =
      `${charging && q.recovery <= 0 ? (game.melee.charge / game.weapon) * 100 : attackPower(q)}%`;
    card
      .querySelector(".power")!
      .classList.toggle("charging", charging && q.recovery <= 0);
    card.querySelector(".recovery")!.textContent =
      charging && q.recovery <= 0
        ? `CHARGE ${Math.floor(game.melee.charge + 1e-8)} / ${game.weapon} · RELEASE TO STRIKE`
        : `POWER ${attackPower(q)}% · ${q.recovery > 0 ? "RECOVERING" : "READY"}`;
  });
  $("magic").setAttribute("aria-label", `Cast ${p.element} magic`);
  $("narration").textContent =
    game.messageTime > 0
      ? game.message
      : game.area === 0
        ? "Walk east to the arch, then press E to begin. The waystone is always a safe place to return."
        : "Face your foe and release Space to strike. Wait for 100% power; hold longer to charge. Step away from amber circles.";
  const boss = game.enemies.find((e) => e.boss && e.hp > 0);
  $("bossbar").hidden = !boss;
  if (boss)
    $("bossbar").innerHTML =
      `<span>${boss.name} <small>PHASE ${boss.phase}</small></span><div><i style="width:${(boss.hp / boss.maxHp) * 100}%"></i></div>`;
  $("motion").textContent = `Reduced motion: ${reduced ? "on" : "off"}`;
}
function syncStrike() {
  if (!paused)
    setAttackHeld(
      game,
      keys.has(" ") || keys.has("z") || strikePointers.size > 0,
    );
}
$("strike").onclick = (event) => {
  // Keyboard Enter and assistive clicks still offer a single tap attack.
  if (!paused && event.detail === 0) {
    attack(game);
    update();
  }
};
$("magic").onclick = () => {
  if (!paused) {
    cast(game);
    update();
  }
};
$("interact").onclick = interactNow;
$("commands").onclick = () => (paused ? close() : open("commands"));
$("help").onclick = () => open("guide");
$("motion").onclick = () => {
  reduced = !reduced;
  update();
};
canvas.addEventListener("pointerdown", (e) => {
  if (paused) return;
  const r = canvas.getBoundingClientRect();
  const p = {
    x: ((e.clientX - r.left) * WIDTH) / r.width,
    y: ((e.clientY - r.top) * HEIGHT) / r.height,
  };
  target = {
    x: Math.min(914, Math.max(46, p.x)),
    y: Math.min(530, Math.max(66, p.y)),
  };
  canvas.focus();
});
$("strike").addEventListener("pointerdown", (event) => {
  if (paused) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  strikePointers.add(event.pointerId);
  syncStrike();
});
$("strike").addEventListener("lostpointercapture", (event) => {
  if (!strikePointers.delete(event.pointerId)) return;
  cancelAttack(game);
  syncStrike();
});
let moveStartedAt = 0;
document
  .querySelectorAll<HTMLButtonElement>("[data-move]")
  .forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      if (paused) return;
      button.setPointerCapture(event.pointerId);
      const [dx, dy] = button.dataset.move!.split(",").map(Number);
      pointerMove = { dx, dy };
      target = undefined;
      moveStartedAt = game.time;
    });
    button.addEventListener("click", () => {
      if (paused || game.time - moveStartedAt >= 0.12) return;
      const [dx, dy] = button.dataset.move!.split(",").map(Number),
        leader = game.party[game.leader];
      target = {
        x: Math.max(46, Math.min(914, leader.x + dx * 48)),
        y: Math.max(66, Math.min(530, leader.y + dy * 48)),
      };
    });
  });
window.addEventListener("pointerup", (event) => {
  pointerMove = { dx: 0, dy: 0 };
  strikePointers.delete(event.pointerId);
  syncStrike();
});
window.addEventListener("pointercancel", clearInput);
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "tab" && paused) {
    const focusable = Array.from(
      $("overlay").querySelectorAll<HTMLButtonElement>("button"),
    );
    const i = focusable.indexOf(document.activeElement as HTMLButtonElement);
    e.preventDefault();
    focusable[
      (i + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length
    ]?.focus();
    return;
  }
  if (key === "escape") {
    e.preventDefault();
    if (menu === "title") return;
    if (menu === "reset")
      open(
        resetOrigin === "title"
          ? "title"
          : game.mode === "victory"
            ? "victory"
            : "commands",
      );
    else paused ? close() : open("commands");
    return;
  }
  if (paused) return;
  if ((e.target as HTMLElement).tagName === "BUTTON" && key === "enter") return;
  if (
    [" ", "arrowup", "arrowdown", "arrowleft", "arrowright", "tab"].includes(
      key,
    )
  )
    e.preventDefault();
  keys.add(key);
  if (
    [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "q",
      "1",
      "2",
      "3",
    ].includes(key)
  )
    target = undefined;
  if (e.repeat) return;
  if (key === " " || key === "z") syncStrike();
  if (key === "f" || key === "x") cast(game);
  if (key === "q") switchParty(game);
  if (["1", "2", "3"].includes(key)) switchParty(game, Number(key) - 1);
  if (key === "h") heal(game);
  if (key === "e" || key === "enter") interactNow();
  update();
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
  if (e.key === " " || e.key.toLowerCase() === "z") syncStrike();
});
window.addEventListener("blur", () => {
  clearInput();
  if (!paused && game.mode === "play") open("commands");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    if (!paused && game.mode === "play") open("commands");
  }
});
$("sound").onclick = () => {
  sound = !sound;
  if (sound) {
    audio ??= new AudioContext();
    void audio.resume();
  } else if (audio) void audio.suspend();
  $("sound").textContent = sound ? "♫ Sound on" : "♫ Sound off";
  $("sound").setAttribute("aria-pressed", String(sound));
};
function music() {
  if (!sound || !audio || audio.currentTime < nextNote) return;
  nextNote = audio.currentTime + 0.65;
  const melody = [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 329.63];
  const n = Math.floor(game.time / 0.65) % melody.length;
  const o = audio.createOscillator(),
    gain = audio.createGain();
  o.type = "sine";
  o.frequency.value = melody[n] / (game.area === 4 ? 2 : 1);
  gain.gain.setValueAtTime(0, audio.currentTime);
  gain.gain.linearRampToValueAtTime(0.035, audio.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1);
  o.connect(gain);
  gain.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + 1.1);
}
let previous = performance.now(),
  accumulator = 0;
function frame(now: number) {
  const elapsed = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  if (!paused) {
    accumulator += elapsed;
    while (accumulator >= DT) {
      const dx =
          (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
          (keys.has("a") || keys.has("arrowleft") ? 1 : 0) +
          pointerMove.dx,
        dy =
          (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
          (keys.has("w") || keys.has("arrowup") ? 1 : 0) +
          pointerMove.dy;
      step(game, {
        dx,
        dy,
        target,
        attack: keys.has(" ") || keys.has("z") || strikePointers.size > 0,
      });
      accumulator -= DT;
      const signature = game.cleared.join(",");
      if (signature !== lastSaveSignature) {
        lastSaveSignature = signature;
        if (signature) save();
      }
      if (game.mode !== "play") {
        save();
        open(game.mode);
        break;
      }
    }
    music();
  } else accumulator = 0;
  draw(ctx, game, reduced, target);
  if (now - lastUi > 100) {
    update();
    lastUi = now;
  }
  requestAnimationFrame(frame);
}
open("title");
requestAnimationFrame(frame);
