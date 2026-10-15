# Secret of Mana manual-melee native acceptance

22 tests, strict typecheck, production build and independent reviews passed before native QA. This record is the observed normal-input first-field loop, with exact limitations below. No source changes or rebuild during QA.


Origin: http://fidelity-oblivion-20261015.localhost:5213/. Dedicated Chrome tab 222225555. The user manually unlocked the Mac; parent explicitly regranted exclusive input. Fixed overhead field camera. Used WASD movement/facing, Z tap and 1.2–1.4 second hold/release, F magic, Escape Commands, visible Follow/Engage toggle and Save/Continue buttons. A tap produced visible 22 damage; charged release produced visible 36 and power recovery. With Engage restored, defeated the two Hushlings and Briarback, observed phase 2 warning rings then LIGHT RESTORED, weapon tier 2, four sunflasks and 1/3 embers. Saved, reloaded, clicked Continue saved journey: Mossreach cleared/tier 2/1 ember retained. Walked through the eastern arch with E into Glasswater, paused safely. No hidden-state injection or game source changes.

Evidence: evidence/mana/approach.jpg (unobscured field), charge-release.jpg (36 hit and recovering power), guardian-fight.jpg (phase 2), guardian-cleared.jpg (restored field/1 ember), reload.jpg (persisted tier 2/1 ember), glasswater-unlocked.jpg (next region). facing-away.jpg is an interim menu capture and directional-attempt.jpg showed a hit after an enemy crossed into the arc; neither proves an away-facing miss. No claim of a full campaign, native exact damage curve, or native cancellation-edge coverage. These edge cases remain supported by the passing domain tests. One idle-inspection defeat recovered normally at the waystone before the completed route; subsequent inspections were paused. Internal tool telemetry 403s did not prevent local gameplay.


## Local evidence locations

Evidence directory: `qa/fidelity-2026-10-15/`. The record above is copied from the central project acceptance file.

- [charge-release.jpg](qa/fidelity-2026-10-15/charge-release.jpg)
- [guardian-cleared.jpg](qa/fidelity-2026-10-15/guardian-cleared.jpg)
- [reload.jpg](qa/fidelity-2026-10-15/reload.jpg)

## Included native captures

- [charge-release.jpg](qa/fidelity-2026-10-15/charge-release.jpg)
- [guardian-cleared.jpg](qa/fidelity-2026-10-15/guardian-cleared.jpg)
- [reload.jpg](qa/fidelity-2026-10-15/reload.jpg)
