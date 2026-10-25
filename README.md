# Chromatic

## Play online

[Play Chromatic](https://intrepion.github.io/kata-inspired-by-rubiks-cube-codex-dot/) — free, playable in your browser.

A quiet little room for a very twisty puzzle. An original, playable 3×3 cube game inspired by the classic six-color puzzle, with an animated 3D cube, an unfolded live map, and a warm editorial presentation.

## Play locally

Open `index.html` directly in a modern browser — no build, downloads or runtime dependencies needed. Or run:

```sh
python3 server.py
# http://127.0.0.1:55605
```

Override the port with `PORT=55606 python3 server.py`. The server binds only to loopback. Nothing is deployed to a hosted website.

## Controls

| Action | Control |
| --- | --- |
| Inspect every side | Drag the cube with mouse or finger; arrow keys also orbit |
| Reset camera | Home or Reset view |
| Turn a face | Tap a visible face, use a face button, or press U R F D L B |
| Inverse turn | Hold Shift with a face key, or select Inverse |
| Double turn | Hold Alt with a face key, or select Double |
| Undo | Z or Undo |
| Learn the controls | How to play; Escape closes the dialog |

U is up, R right, F front, D down, L left and B back. Center letters identify these **fixed** faces. Rotating the view does not rename them. Clockwise means clockwise when looking directly at the outside of the named face. A prime (`R'`) reverses it; `R2` turns 180°. The direction selector also applies to plain letter keys and face taps. Alt takes precedence over Shift.

New scramble starts from solved and applies 25 legal random moves, avoiding successive moves on the same axis. Inspect for as long as you like: the timer begins on your first turn and stops when the cube is solved. Restart scramble restores the exact same puzzle. Reset solved cancels the current turn and queued inputs, clears the scramble and returns a clean cube.

Fast deliberate taps queue in order, including undo. Held-key autorepeat is ignored. At most 128 actions can be pending. Turns count all committed actions, including undo; the move trail contains the remaining player moves. Undo labels the session Assisted. Continuing after a solve resumes the accumulated session time, excluding idle time spent solved. Reloading starts a fresh session.

## Scope

This is a practice game, not a competition timer or official random-state scrambler. It includes no automatic solving algorithm, accounts, tracking, persistence, external art or remote fonts. Colors are supplemented by sticker letters, and reduced-motion preferences shorten turn animations. Mobile-size behavior is tested in browser emulation; physical-device testing is not claimed.

## Implementation and verification

- `model.js`: exact integer positions and sticker normals for 26 cubies. Quarter-turn permutations are independent of rendering.
- `session.js`: turn queue, animation commit lifecycle, undo, timer and atomic restart/reset/scramble.
- `game.js`: software 3D canvas projection, face hit testing, orbit and DOM controls. Read-only `window.chromatic.snapshot()` supports browser acceptance.
- `tests/`: Node mathematical/lifecycle tests and a Playwright interaction suite. See [the verification record](docs/verification.md).
- [Specification](docs/spec.md), [glossary](CONTEXT.md), and [architecture decision](docs/adr/0001-integer-cubies.md).

```sh
npm ci
npm run check
npm test
npx playwright install chromium
# Start python3 server.py in another terminal
npm run test:browser
# Or use isolated installed Chrome: CHROME_CHANNEL=chrome npm run test:browser
```

GitHub Actions runs syntax checks, Node tests, and the same Chromium browser tests. No deployment workflow is configured.

The mathematical tests check four-turn identity, inverse cancellation, double-turn equivalence, known published move tables, 100 reproducible scrambles (2,500 intermediate legal states), exact reversal, piece preservation, solved recognition, and impossible edge flips/corner twists/reflections/permutation parity. Session and browser tests exercise rapid input, animation interruption, undo and timing.

## References and license

Move notation follows [WCA Regulations, Article 12](https://www.worldcubeassociation.org/regulations/#article-12-notation). Independent corner/edge orientation conventions and basic move tables are cross-checked against Herbert Kociemba’s [Cubie Level](https://kociemba.org/math/cubielevel.htm) and [CubeDefs](https://kociemba.org/math/CubeDefs.htm). No solver code is used.

MIT © 2026 intrepion. Original game presentation and source. Unaffiliated with Rubik’s or the World Cube Association.

The complete official [GitHub global ignore templates](https://github.com/github/gitignore/tree/main/Global) are preserved verbatim in `gitignore-templates/Linux.gitignore`, `Windows.gitignore`, and `macOS.gitignore`, and combined with project-specific entries in `.gitignore`.
