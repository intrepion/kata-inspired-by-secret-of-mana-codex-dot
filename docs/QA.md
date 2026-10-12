# Verification record

## Actual supported local Chrome gameplay
Completed the entire adventure through normal visible input at http://127.0.0.1:5213/. No console state mutation, storage edits, injected action handlers, cheat hooks or hidden progression assistance were used. Native timed keyboard holds and visible buttons were used; these are automation of normal controls. The app itself supplies click-to-walk path navigation and companion fighting, and both were exercised.

- Read the traveler's guide; walked Hearthwell and entered Mossreach through its visible arch.
- Kindled Mossreach's waystone, reloaded and continued that saved checkpoint.
- Cast Ember (visible burn / mana use), switched to Neri and cast Tide (slow), then to Luma and cast Gale (interrupt). All three successful cast captions and mana expenditure appeared in the accessibility tree.
- Observed companions follow, navigate terrain, attack nearby enemies and contribute to boss victories. Used the normal Commands order to switch Engage → Follow and back.
- Defeated Briarback (phase 2 observed), entered Glasswater, and saved its checkpoint.
- Deliberately stood amid Glasswater enemies under Follow orders without attacking. All three travelers fell; the selected element had automatically switched to Gale before total defeat. The actual defeat dialog named Glasswater, and retry restored all three to 120 HP / 36 MP with the first ember retained. See `qa/chrome-defeat.jpg`.
- With Engage restored, cleared Glasswater and Mirrorfin; used H to heal and advanced through Cinder Vault. Freed Kilnkeeper and earned the third ember. See `qa/chrome-cinder-combat.jpg`.
- Kindled Heartroot's waystone. Command menu visibly reported weapon tier 4, five sunflasks and 3/3 embers. Reloaded that checkpoint on the final implementation build.
- Defeated the Hollow Warden using movement, repeated melee and Gale. Actual ending displayed “And the forest sang” and “4 GUARDIANS FREED · THREE LIGHTS, ONE HEART.” Reloaded and continued the persisted victory, then cancelled replay confirmation with Escape and retained the ending. See `qa/chrome-ending.jpg`.
- Tested reset from a saved-game title; Keep my journey returned to the title with Continue still present. Tested command-menu cancellation and pausing during the campaign.
- At a 390 × 844 viewport, inspected readable party status, quest route, commands and direction controls; tapped Move east and saw the leader move. Reduced motion toggled on. Viewport override was reset. See `qa/chrome-narrow.jpg`.
- Responsive QA found that keyboard movement resumed a stale click destination on release. Fixed by cancelling destination on movement and leader-switch keys; verified tap movement followed by keyboard travel remained at the combat position.
- Browser console observations contained extension-origin warnings only; no app-origin runtime errors were observed.

The final tab remains open on the saved ending. The visible “Walk the road again” button offers confirmed replay. Hearing/audio quality was not independently captured; soundtrack synthesis and opt-in control are implemented. Touch hardware, gamepad, other browsers and every possible combat sequence were not exercised. Narrow menus use an internal scroll region; the full Canvas world is visual rather than a screen-reader equivalent of combat.

## Automated evidence (separate from browser achievements)

16 passing behavior tests cover normalized fixed-step movement, solid collision/boundaries, range, strike recovery and exactly-once hits, invulnerability and delayed telegraphs, mana/cooldown and three effects, fallen switching/revival/total defeat, checkpoint replenishment, gate prerequisites/backtracking, companion route recovery, versioned save roundtrips, semantic corruption/identity validation, wounded and defeated encounter persistence, Follow/Engage orders, and numeric coordinate validation.

The melee-only campaign test uses legitimate progression and input-driven movement, normal companions and legitimately replenished flasks; fixture positioning reaches each waystone. It proves all four bosses can be beaten without required magic or unavailable equipment. It is an automated simulation, not browser completion. Targeted red/green records are in `qa/tdd-*.txt`; the first movement run was initially blocked by tsx's sandbox IPC, then re-run using `node --import tsx` and failed for the missing implementation before green. Combat, corrupted-save and Follow-order seams also have red/green records. Later regression tests were added during review.

Production build and strict typecheck passed. Dependency audit passed with no vulnerabilities. Final check outputs are in `qa/final-checks.txt` and `qa/audit.json`. Exact final-commit CI and remote SHA are reported in the final handoff to avoid a self-referential documentation commit.
