# Lanterns of the Wildheart
An original single-player browser action RPG inspired by the feel of a switchable party, recovery-based melee and elemental commands. All visual art, writing, characters, map layouts and synthesized audio are original.

## Autonomous design tree
The user explicitly authorized recommended defaults without design questions; this supersedes interview pauses in Grill with Docs and seam confirmation in TDD. Settled frontier: (1) Canvas 2D + semantic HTML controls, (2) deterministic 60 Hz simulation separated from drawing, (3) single-player three-character party, (4) compact five-area campaign, (5) checkpoint-based retry and versioned local save, (6) keyboard plus pointer movement/commands, (7) private GitHub repository and session-only localhost preview. No unsettled design branches remain.

## Campaign and acceptance
- Begin at Hearthwell with Rowan (ember blade), Neri (tide staff), and Luma (gale spear). The Heartroot has sealed itself against a consuming hush. Bring three lantern embers back to awaken it.
- Connected areas: Hearthwell → Mossreach → Glasswater → Cinder Vault → Heartroot. Each cleared region opens the next; backtracking remains available.
- Each wilderness has ordinary foes, a healing waystone, readable terrain, and a distinct boss. The final Warden has two phases and an ending that returns the travelers' light to the forest.
- Melee has a single-hit strike and explicit recovery meter. Fire burns, water slows, wind interrupts. Spells cost mana, have cooldowns, and mana regenerates. Melee alone must always be sufficient. Living companions follow, recover from obstructed routes, and attack nearby enemies. They never autonomously spend mana.
- Switching selects a living member; fallen members are skipped. Healing revives, defeat halts simulation, retry restores the last visited waystone and all resources. Waystones replenish unlimited resources so consumables cannot softlock progression.
- Boss victories grant one lantern, improved weapons and a flask once, persist cleared areas and enemy states, and open gates. Final defeat triggers a terminal victory state.
- Pause, commands, tutorial, ending and defeat freeze simulation. Blur clears inputs and pauses. Escape cancels commands and reset confirmation. New journey requires an in-app confirmation; cancellation retains save.
- Automatic saves at checkpoints and victories; manual save and continue; invalid saves are rejected safely. No hidden state controls in the production page.
- Clear readable party status, boss health, objective, route markers, telegraph circles, movement instructions, captions, reduced motion, narrow layout and on-screen controls.

## Agreed test seams
The delegated task explicitly authorizes tests of the following public boundaries: `createGame`, `step`, `attack`, `cast`, `switchParty`, `interact`, `heal`, `retry`, `serialize`, `restore`. These cover domain state, combat, movement, routes and saving; browser input/rendering remains browser QA.

## QA requirements
Domain tests and legitimate equipment campaign simulation; typecheck; build; dependency audit; independent standards and spec reviews. Actual supported local Chrome play should complete campaign using visible controls, switch all heroes, cast all elements, observe companions, die/retry, save/reload and cancel menus. Record actual achievements separately from simulated results, and report any browser restrictions without bypassing them.
