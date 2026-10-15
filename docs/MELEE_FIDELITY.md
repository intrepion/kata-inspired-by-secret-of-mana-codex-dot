# Directional power and held-charge melee — 2026-10-15

Baseline `5d172182d90d46d7b9f7370f8558f161266de60b` was clean; existing preview port 5213/PID38274 was inspected and left running. This focused correction retains the party, areas, bosses, spells and save key `wildheart-journey-v1`.

## Source and delegated defaults

Read Square's original SNES *Secret of Mana* manual, [scan](https://www.retrogames.cz/manualy/SNES/Secret_of_Mana_-_SNES_-_Manual.pdf), before planning. Printed pp8–9 describe directional movement, B weapon action and switching party control; p24 describes a power meter recovering to 100% after a strike and continued holding building a weapon-level power bar; pp17 and26 describe weapon levels. The scan was downloaded and its pages visually read, since it contains no text layer.

Grill with Docs/Implement defaults follow the user's focused plan: replace leader hold-autoattack and nearest-enemy auto-turn with manual directional swings, weak early attacks, visible percentage recovery, bounded held charge and a single release strike. Release timing is the requested local interaction; the manual describes automatic execution when maximum charged power is reached. Exact numeric damage/timing and the 120-degree forward arc are authored approximations. No full combat/weapon mastery recreation is claimed.

## Behavior and seams

- Tap and release Space/Z or the Strike button for one swing. Movement sets facing; a visible ground marker and slash arc show it. A foe behind you is not selected, and a hit requires range and clear terrain.
- Power recovers from 0–100% in the existing 0.65 seconds. A strike after its brief animation but before full recovery is permitted at reduced strength. Holding never repeats normal swings.
- Once recovered, holding builds charge at one level per 0.65 seconds up to the existing weapon tier (1–4). Release spends it on one stronger directional swing. The party card displays recovery and charge.
- Pause, blur, capture cancellation, area transitions, leader switch and defeat cancel charge. A held input carried across a leader switch must be released before a fresh charge can begin. Keyboard and Strike pointer sources combine without releasing one source canceling another.
- Companion AI still chooses and faces a nearby foe, waits for full recovery and calls the same strike/damage seam. It cannot turn the controlled leader or change the leader's input latch.
- Live held/charge state is always canceled in serialization/restoration. Old v1 recovery/party/encounter/progression remains readable; no save key or campaign migration is required.

Public check seams: `step`, `attack`, `setAttackHeld`, `cancelAttack`, `switchParty`, `serialize` and `restore`. The existing melee campaign solver now uses repeated legitimate press/release cycles while walking, rather than an always-held attack. Domain simulation does not substitute for browser acceptance.

## Planned normal-input acceptance route

1. Enter Mossreach through the east arch. Open Commands and select Follow to make leader damage easy to inspect.
2. Approach a Hushling, move briefly away to face away, release Space: the forward slash must miss it. Turn toward it, tap/release and observe one hit and a reset power percentage.
3. Tap again once the short slash animation ends but before 100%; observe lower damage. Wait until 100%, hold Space beyond recovery and one charge level, release: observe a single stronger hit. Holding at maximum must not generate repeated swings.
4. Start another charge, Q switch, then release: the new leader must not inherit or release the previous charge. Charge again and open Commands; resume with no stored strike. Repeat a blur/pause interruption.
5. Cast F once, restore Engage, finish the field encounter and continue to the gate/waystone. Reload the existing save and confirm party, visited encounters and progress remain intact with charge canceled.

## Checks and limitations

Focused domain tests include direction, early/full damage, cap/release-once, rapid taps, cancellation/switch, old save compatibility, and the unchanged spell/party/defeat/visited-area contracts. Full campaign reachability still uses the public control seam. `npm test` passed 22/22 tests, strict `npm run typecheck` and `npm run build` passed, and `git diff --check` is clean. The production output is index-CH5wZjfX.js. Existing preview 5213 was left running. Independent Standards and Specification reviews passed. The completed normal-input first-guardian/gate/reload route and its exact native limits are recorded in [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md).

This does not add ring targeting, weapon/mastery XP, scrolling areas, exact original formulas or cooperative play.


Native acceptance attempt 2026-10-15T11:24:27.423261+00:00: after exclusive access was granted, the initial computer-use inventory reported that the Mac is locked and could not be unlocked automatically. No tab or game interaction occurred. At that historical attempt this project’s normal-input acceptance was unverified; the worker stopped input and released access to the parent. After manual unlock and explicit exclusive-access regrant, the completed native route superseded that pending status. Existing source/tests/build results remain valid. No security changes or keep-awake workaround was attempted.


## Observed native acceptance — completed 2026-10-15

Fixed overhead camera; normal movement/facing, tap and held-release melee, magic and party commands completed the first guardian, opened Glasswater and survived save/reload. Native away-facing miss and cancellation edges are not claimed. Full observed sequence, reload results, screenshots and limits: [local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md). No source changes or rebuild were needed during native QA. Dedicated QA tab closed and exclusive access released; preview left available.
