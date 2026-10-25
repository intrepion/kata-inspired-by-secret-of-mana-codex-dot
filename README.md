# Lanterns of the Wildheart

Three travelers carry the last village's lantern into a forest that has forgotten its song. An original, complete single-player browser action RPG inspired by recovery-based melee, elemental commands and a switchable party.

## Play

```sh
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:5213/**. The preview binds only to localhost and refuses to use a different port. Saves stay in this browser's local storage. Start a new journey through the confirmation dialog to replay.

For a session-only detached production server:

```sh
python3 scripts/serve.py
```

This logs to `/tmp/wildheart-preview.log`, records its PID in `.preview.pid`, and has no boot or login autostart. Stop only the recorded game PID when restarting; do not stop other local game servers.

## Controls

| Action | Keyboard | On screen |
| --- | --- | --- |
| Move | WASD / arrows | Click field; tap or hold direction buttons |
| Strike | Tap/release Space / Z; hold/release for charge | Strike button with the same tap/hold/release behavior |
| Magic | F / X | Magic button or command menu |
| Leader | Q / 1–3 | Traveler status cards or command menu |
| Interact | E / Enter | Interact near waystones and arches |
| Heal / revive | H | Sunflask in command menu |
| Pause / cancel | Escape | Commands / Return |

Ember burns, Tide slows, Gale interrupts. Each spell costs 8 mana with a 1.8-second cooldown. Mana regenerates; melee never costs resources. Attacks recover to 100% power in 0.65 seconds. Early swings are weak; hold after recovery to charge up to the weapon tier, then release one stronger directional strike. See [mechanics evidence and acceptance route](docs/MELEE_FIDELITY.md). Amber rings show enemy attack locations before damage. Companions engage nearby foes by default; Follow orders keep them in formation without attacking. Waystones restore all health and mana and replenish flasks, save a checkpoint, and remain usable without finite resources.

## Adventure

Hearthwell village → Mossreach / Briarback → Glasswater / Mirrorfin → Cinder Vault / Kilnkeeper → Heartroot / the Hollow Warden. Each regional victory restores one lantern ember, strengthens weapons once and opens the next route. Guardians grow more dangerous at half health. The final victory has a persistent story ending. Fallen travelers are skipped when switching; flasks revive them; defeat returns everyone to the last waystone with progress retained.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

Strict TypeScript, 22 domain behavior tests, legitimate melee-only campaign simulation, private-repository GitHub Actions, and independent specification and standards reviews. See [QA evidence](docs/QA.md), [specification](docs/SPEC.md), [glossary](GLOSSARY.md) and [decisions](docs/adr/).

All character art, environmental art, names, dialogue, area layouts and synthesized melody are original. Fonts are DM Sans and Fraunces from Google Fonts with local system fallbacks. No commercial game assets, network gameplay, purchases, accounts or public deployment. The game is deliberately a compact adventure rather than a large RPG; companions are simple followers with automatic recovery around terrain. Historical baseline browser QA used supported local Chrome, not hidden game-state mutation. Native acceptance of the new manual-charge correction remains unverified; see [current status](docs/MELEE_FIDELITY.md).

## Play online

[Play the hosted game](https://intrepion.github.io/kata-inspired-by-secret-of-mana-codex-dot/)
