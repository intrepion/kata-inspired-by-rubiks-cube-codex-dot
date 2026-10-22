# Verification record

Verified locally on the attached Mac, 2026-10-22.

## Automated checks

- `npm run check`: JavaScript syntax checks passed.
- `npm test`: **12 tests passed**. All six face identities, inverse/half-turn equivalence, all six published clockwise corner permutations/orientations, malformed input rejection, solved recognition, preserved cubie inventory, and 100 seeded 25-turn scrambles with all **2,500 intermediate states legal**. Every scramble reversed exactly. Impossible single edge flip, corner twist, corner reflection and odd permutation rejected.
- `CHROME_CHANNEL=chrome npm run test:browser`: **20 scenarios passed** in isolated headless installed Chrome; no application console errors. Browser tests use actual controls and read-only diagnostic snapshots, not a state mutation fixture.
- Browser coverage: all six buttons and inverse selection, rapid keyboard input, held repeat, Shift/Alt modifiers, macOS Option character events, queued undo, reset/scramble/restart interruption, pixel-exact canvas restoration after cancelling the first turn, scramble reversal with stopped timer, undo after completion, drag/orbit versus tap, rapid face taps, rendered bounds across 40 inspection samples, help modal, sticker-label toggle, 390px and 320px layouts without horizontal overflow, touch gesture emulation, reduced motion, and direct `file://` launch with a real turn.
- `git diff --check`: passed.

## Native acceptance

In the user's existing Chrome profile, opened a separate Chromatic tab and preserved the other project tabs. Native keyboard R then Shift-R restored the cube and showed the solved message. Actual macOS Option-R recorded R2; a second half turn restored the cube. New scramble displayed a mixed cube with time and turns both zero. Visually inspected the native rendering and browser chrome; no debugging banner was visible after the extension's session ended. No persistent remote debugging port was opened.

The Chrome extension initially timed out after creating the preview tab. Acceptance continued through native Chrome app controls. Automated regression tests ran in a separate isolated Chrome process and closed it afterwards.

## Independent review

Separate standards and specification reviewers inspected baseline f17d191 through implementation db8d68d, then reviewed fixes. Standards found no hard architecture violations and one duplicated modifier expression, now shared. Specification review found clipped camera framing, dropped rapid face taps and native Mac Option shortcuts, all fixed with regressions. A follow-up found a stale canvas after cancellation caused by a drawing cache; fixed by caching only idle frames and covered with a pixel-exact restart test. Final focused independent recheck found no remaining material issue and independently reran all five session tests successfully.

A screenshot review also led to making the canvas absolutely positioned inside its stage, isolating bitmap size from flex layout. The final 20-scenario suite passed after that change. Desktop and mobile captures are in `docs/screenshots/`.

## Delivery and limits

The detached loopback preview is http://127.0.0.1:55605, served by `server.py` from the durable project directory. PID recorded in `/tmp/chromatic-preview.pid`; log in `/tmp/chromatic-preview.log`. Other game listeners on 55602, 55603 and 55604 were verified preserved.

GitHub Actions runs the same checks using Playwright Chromium on Ubuntu. Consult the repository Actions tab for the current exact-commit result. No hosted deployment is configured.

This is randomized legal-move practice, not a competition random-state scrambler. No automatic solver is implemented. Physical phones, Safari, Firefox and long-duration human solving sessions were not tested. Reload intentionally starts fresh.
