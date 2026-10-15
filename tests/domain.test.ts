import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, step } from "../src/domain.ts";
test("one second of fixed-step movement travels 180 units and diagonal movement is normalized", () => {
  const g = createGame();
  const start = g.party[0].x;
  for (let i = 0; i < 60; i++) step(g, { dx: 1, dy: 0 });
  assert.ok(Math.abs(g.party[0].x - start - 180) < 0.01);
  const d = createGame();
  const p = { ...d.party[0] };
  for (let i = 0; i < 60; i++) step(d, { dx: -1, dy: 1 });
  assert.ok(
    Math.abs(Math.hypot(d.party[0].x - p.x, d.party[0].y - p.y) - 180) < 0.01,
  );
});
import {
  attack,
  enterArea,
  cast,
  switchParty,
  heal,
  retry,
  interact,
  serialize,
  restore,
  damageTraveler,
  passable,
  distance,
} from "../src/domain.ts";
test("a melee strike damages once, cannot reach distant enemies, and requires recovery", () => {
  const g = createGame();
  enterArea(g, 1);
  const foe = g.enemies[0];
  foe.x = g.party[0].x + 35;
  foe.y = g.party[0].y;
  const hp = foe.hp;
  assert.equal(attack(g), true);
  assert.equal(foe.hp, hp - 22);
  assert.equal(attack(g), false);
  assert.equal(foe.hp, hp - 22);
});
function ticks(
  g: ReturnType<typeof createGame>,
  n: number,
  input: Parameters<typeof step>[1] = {},
) {
  for (let i = 0; i < n; i++) step(g, input);
}
test("solid terrain and boundaries stop fixed movement without tunnelling", () => {
  const g = createGame();
  g.party[0].x = 280;
  g.party[0].y = 130;
  ticks(g, 200, { dx: 1 });
  assert.ok(g.party[0].x <= 297);
  g.party[0].x = 50;
  g.party[0].y = 288;
  ticks(g, 300, { dx: -1 });
  assert.ok(g.party[0].x >= 43);
});
test("melee range excludes distant targets and never damages a dead foe twice", () => {
  const g = createGame();
  enterArea(g, 1);
  const e = g.enemies[0];
  e.x = g.party[0].x + 67;
  e.y = g.party[0].y;
  const hp = e.hp;
  attack(g);
  assert.equal(e.hp, hp);
  e.x = g.party[0].x + 40;
  g.party[0].recovery = 0;
  g.party[0].strike = 0;
  e.hp = 1;
  attack(g);
  assert.equal(e.hp, 0);
  const count = g.rewarded.length;
  g.party[0].recovery = 0;
  g.party[0].strike = 0;
  attack(g);
  assert.equal(g.rewarded.length, count);
});
test("invulnerability prevents repeat hits, then expires, and telegraphs deal damage only after warning", () => {
  const g = createGame();
  enterArea(g, 1);
  const p = g.party[0];
  p.invulnerable = 0;
  damageTraveler(g, 0, 10);
  damageTraveler(g, 0, 10);
  assert.equal(p.hp, 110);
  ticks(g, 52);
  damageTraveler(g, 0, 10);
  assert.equal(p.hp, 100);
  const e = g.enemies[0];
  e.x = p.x + 20;
  e.y = p.y;
  e.timer = 0;
  g.enemies = [e];
  g.party[1].hp = 0;
  g.party[2].hp = 0;
  p.invulnerable = 0;
  step(g);
  assert.ok(e.windup > 0);
  const hp = p.hp;
  ticks(g, 30);
  assert.equal(p.hp, hp);
  ticks(g, 12);
  assert.equal(p.hp, hp - 10);
});
test("every element respects range, mana and cooldown and applies its complementary effect", () => {
  for (let i = 0; i < 3; i++) {
    const g = createGame();
    enterArea(g, 1);
    switchParty(g, i);
    const p = g.party[i],
      e = g.enemies[0];
    e.x = p.x + 100;
    e.y = p.y;
    assert.equal(cast(g), true);
    assert.equal(p.mp, 28);
    assert.equal(cast(g), false);
    assert.equal(p.mp, 28);
    assert.ok(i === 0 ? e.burn > 0 : i === 1 ? e.slow > 0 : e.timer === 1.3);
    p.spellCooldown = 0;
    p.mp = 7;
    assert.equal(cast(g), false);
  }
  const g = createGame();
  enterArea(g, 1);
  assert.equal(cast(g), false);
  assert.equal(g.party[0].mp, 36);
});
test("falling switches to a living member; healing revives; total defeat freezes until retry", () => {
  const g = createGame();
  g.party.forEach((p) => (p.invulnerable = 0));
  damageTraveler(g, 0, 120);
  assert.equal(g.leader, 1);
  assert.equal(switchParty(g, 0), false);
  heal(g);
  assert.equal(g.party[0].hp, 65);
  g.party.forEach((p, i) => {
    p.invulnerable = 0;
    damageTraveler(g, i, 120);
  });
  assert.equal(g.mode, "defeat");
  const time = g.time;
  ticks(g, 60, { dx: 1, attack: true });
  assert.equal(g.time, time);
  assert.equal(cast(g), false);
  assert.equal(heal(g), false);
  assert.equal(retry(g), true);
  assert.ok(g.party.every((p) => p.hp === 120 && p.mp === 36));
});
test("waystones replenish resources without flasks and persist checkpoints", () => {
  const g = createGame();
  enterArea(g, 1);
  g.party[0].x = 180;
  g.party[0].y = 410;
  g.flasks = 0;
  g.party[1].hp = 0;
  g.party[2].mp = 0;
  assert.equal(interact(g), "checkpoint");
  assert.equal(g.checkpoint, 1);
  assert.equal(g.flasks, 3);
  assert.ok(g.party.every((p) => p.hp === 120 && p.mp === 36));
});
test("gates enforce prerequisite victories and backtracking remains open", () => {
  const g = createGame();
  assert.equal(enterArea(g, 2), false);
  enterArea(g, 1);
  g.party[0].x = 880;
  g.party[0].y = 288;
  assert.equal(interact(g), "none");
  assert.equal(g.area, 1);
  g.party[0].x = 70;
  assert.equal(interact(g), "area");
  assert.equal(g.area, 0);
});
test("companions navigate around terrain and recover from separated paths", () => {
  const g = createGame();
  enterArea(g, 1);
  g.enemies = [];
  g.party[0].x = 470;
  g.party[0].y = 130;
  g.party[1].x = 260;
  g.party[1].y = 140;
  g.party[2].x = 110;
  g.party[2].y = 440;
  ticks(g, 400);
  assert.ok(distance(g.party[0], g.party[1]) < 60);
  assert.ok(distance(g.party[0], g.party[2]) < 60);
  assert.ok(g.party.every((p) => passable(g.area, p)));
});
test("save roundtrips observable progression and rejects malformed state", () => {
  const g = createGame();
  enterArea(g, 1);
  g.party[0].x = 180;
  g.party[0].y = 410;
  interact(g);
  const copy = restore(serialize(g));
  assert.ok(copy);
  assert.equal(copy.area, 1);
  assert.equal(copy.checkpoint, 1);
  assert.equal(copy.party[0].x, 180);
  assert.equal(restore("{bad"), undefined);
  assert.equal(restore(JSON.stringify({ ...g, leader: 99 })), undefined);
  assert.equal(restore(JSON.stringify({ ...g, party: [] })), undefined);
  assert.equal(restore(JSON.stringify({ ...g, flasks: -2 })), undefined);
});
test("all routes and bosses are completable with legitimate melee equipment; rewards never duplicate", () => {
  const g = createGame();
  for (let area = 1; area <= 4; area++) {
    assert.equal(enterArea(g, area), true);
    g.party[0].x = 180;
    g.party[0].y = 410;
    interact(g);
    let steps = 0;
    while (!g.cleared.includes(area) && g.mode === "play" && steps++ < 3000) {
      const enemy = g.enemies.find((e) => e.hp > 0);
      if (!enemy) break;
      step(g, { target: enemy, attack: steps % 48 < 2 });
      if (g.party.some((p) => p.hp < 35) && g.flasks > 0) heal(g);
    }
    assert.equal(g.mode === "defeat", false, `area ${area}`);
    assert.ok(g.cleared.includes(area), `cleared ${area} in ${steps} steps`);
    assert.ok(g.enemies.filter((e) => e.boss).every((e) => e.phase === 2));
    const rewards = g.rewarded.length,
      weapon = g.weapon;
    attack(g);
    ticks(g, 5, { attack: true });
    assert.equal(g.rewarded.length, rewards);
    assert.equal(g.weapon, weapon);
  }
  assert.equal(g.mode, "victory");
  assert.equal(g.weapon, 4);
  const time = g.time;
  ticks(g, 100);
  assert.equal(g.time, time);
  assert.ok(restore(serialize(g)));
});
test("contradictory saves cannot remove mandatory enemies, bypass gates or suppress boss rewards", () => {
  const g = createGame();
  enterArea(g, 1);
  assert.equal(restore(JSON.stringify({ ...g, enemies: [] })), undefined);
  assert.equal(restore(JSON.stringify({ ...g, rewarded: ["1-3"] })), undefined);
  assert.equal(
    restore(JSON.stringify({ ...createGame(), checkpoint: 4 })),
    undefined,
  );
  assert.equal(
    restore(
      JSON.stringify({
        ...g,
        enemies: [g.enemies[0], g.enemies[0], g.enemies[2], g.enemies[3]],
      }),
    ),
    undefined,
  );
});
test("backtracking and saves retain defeated enemies and wounds in visited areas", () => {
  const g = createGame();
  enterArea(g, 1);
  const e = g.enemies[0];
  e.x = g.party[0].x + 35;
  e.y = g.party[0].y;
  attack(g);
  const wounded = e.hp;
  enterArea(g, 0, true);
  enterArea(g, 1);
  assert.equal(g.enemies[0].hp, wounded);
  g.party[0].recovery = 0;
  g.party[0].strike = 0;
  attack(g);
  g.party[0].recovery = 0;
  g.party[0].strike = 0;
  attack(g);
  assert.equal(g.enemies[0].hp, 0);
  enterArea(g, 0, true);
  const loaded = restore(serialize(g));
  assert.ok(loaded);
  enterArea(loaded, 1);
  assert.equal(loaded.enemies[0].hp, 0);
});
test("Follow orders keep companions close without attacking; Engage resumes their combat", () => {
  const g = createGame();
  enterArea(g, 1);
  g.tactic = "follow";
  const e = g.enemies[0];
  e.x = g.party[0].x + 45;
  e.y = g.party[0].y;
  g.party[1].x = e.x - 20;
  g.party[1].y = e.y;
  ticks(g, 40);
  assert.equal(e.hp, e.maxHp);
  g.tactic = "fight";
  ticks(g, 40);
  assert.ok(e.hp < e.maxHp);
});
test("malformed nonnumeric coordinates are rejected instead of breaking movement", () => {
  const g = createGame();
  const v = JSON.parse(serialize(g));
  v.party[0].x = "180";
  assert.equal(restore(JSON.stringify(v)), undefined);
  const c = createGame();
  enterArea(c, 1);
  const bad = JSON.parse(serialize(c));
  bad.enemies[0].y = "288";
  assert.equal(restore(JSON.stringify(bad)), undefined);
});

import { setAttackHeld, cancelAttack, attackPower } from "../src/domain.ts";
function meleeScenario() {
  const g = createGame();
  enterArea(g, 1);
  g.tactic = "follow";
  const p = g.party[0],
    e = g.enemies[0];
  e.x = p.x + 42;
  e.y = p.y;
  e.timer = 5;
  g.enemies = [e];
  return { g, p, e };
}
test("manual melee uses facing rather than turning to the nearest enemy", () => {
  const { g, p, e } = meleeScenario();
  p.facing = { x: -1, y: 0 };
  const hp = e.hp;
  attack(g);
  assert.equal(e.hp, hp);
  assert.deepEqual(p.facing, { x: -1, y: 0 });
  ticks(g, 40);
  p.facing = { x: 1, y: 0 };
  attack(g);
  assert.equal(e.hp, hp - 22);
});
test("early swings are weak and power recovers to a full directional strike", () => {
  const { g, p, e } = meleeScenario();
  e.hp = e.maxHp = 200;
  attack(g);
  assert.equal(e.hp, 178);
  assert.equal(attackPower(p), 0);
  ticks(g, 13);
  const before = e.hp;
  attack(g);
  const weak = before - e.hp;
  assert.ok(weak > 0 && weak < 22);
  ticks(g, 40);
  assert.equal(attackPower(p), 100);
  const ready = e.hp;
  attack(g);
  assert.equal(ready - e.hp, 22);
});
test("holding does not repeat swings; releasing a full charge strikes once at its weapon cap", () => {
  const { g, e } = meleeScenario();
  e.hp = e.maxHp = 400;
  const hp = e.hp;
  ticks(g, 130, { attack: true });
  assert.equal(e.hp, hp);
  assert.equal(g.melee.charge, 1);
  step(g, { attack: false });
  const charged = hp - e.hp;
  assert.ok(charged > 22);
  ticks(g, 50, { attack: false });
  assert.equal(hp - e.hp, charged);
});
test("pause cancellation and leader switch cancel held power until a fresh press", () => {
  const { g, e } = meleeScenario();
  const hp = e.hp;
  ticks(g, 60, { attack: true });
  cancelAttack(g);
  step(g, { attack: false });
  assert.equal(e.hp, hp);
  ticks(g, 60, { attack: true });
  switchParty(g, 1);
  assert.equal(g.melee.charge, 0);
  ticks(g, 30, { attack: true });
  assert.equal(g.melee.charge, 0);
  step(g, { attack: false });
  assert.equal(e.hp, hp);
  setAttackHeld(g, true);
  assert.equal(g.melee.held, true);
});
test("old recovery saves restore unchanged progression with live held charge canceled", () => {
  const g = createGame();
  g.party[0].recovery = 0.4;
  ticks(g, 60, { attack: true });
  const copy = restore(serialize(g));
  assert.ok(copy);
  assert.equal(copy.melee.held, false);
  assert.equal(copy.melee.charge, 0);
  const old = JSON.parse(serialize(g));
  delete old.melee;
  old.party[0].recovery = 0.4;
  const legacy = restore(JSON.stringify(old));
  assert.ok(legacy);
  assert.equal(legacy.party[0].recovery, 0.4);
  assert.equal(legacy.melee.charge, 0);
});
test("charge stays bounded by weapon tier and a rapid press/release is one normal swing", () => {
  const quick = meleeScenario();
  const hp = quick.e.hp;
  setAttackHeld(quick.g, true);
  setAttackHeld(quick.g, false);
  assert.equal(hp - quick.e.hp, 22);
  setAttackHeld(quick.g, false);
  assert.equal(hp - quick.e.hp, 22);
  const charged = meleeScenario();
  charged.g.weapon = 3;
  charged.e.hp = charged.e.maxHp = 400;
  ticks(charged.g, 300, { attack: true });
  assert.equal(charged.g.melee.charge, 3);
  step(charged.g, { attack: false });
  assert.equal(charged.e.hp, 294);
});
