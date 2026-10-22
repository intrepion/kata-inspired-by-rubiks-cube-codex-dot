# Chromatic

Build an original, polished 3×3 twisty cube practice game in the user's local game-kata series.

- Real outer-layer turns U R F D L B. Clockwise is viewed from outside the face; prime is inverse; 2 is a half turn. Fixed centers and face names survive camera orbit.
- Drag/finger orbit, arrow-key orbit, Home/reset-view, tap a face, explicit buttons, Shift inverse and Alt double. Direction selector applies to plain face keys too.
- Queue deliberate rapid inputs in FIFO order; ignore key autorepeat. Undo is queued and reverses the latest committed move when it runs. Bounded queue: 128 pending actions.
- New scramble atomically cancels animation and queued actions, then applies 25 legal random moves from solved. Avoid successive turns on the same axis. This is not a competition random-state generator.
- Restart restores the exact scramble baseline. Reset solved cancels everything and clears the scramble. Page reload starts clean; no persistence.
- Time starts when the first turn begins, stops when the exact solved state commits, and resumes if play continues, excluding idle time spent solved. Turns count committed actions, including undo; the trail holds the remaining user moves. Undo labels the session assisted.
- No automatic solver. No hosted deployment.
- Self-contained static files, responsive desktop and phone layout, instructions, MIT, complete official GitHub Linux/Windows/macOS global ignore templates.
- Test public model and session APIs plus real browser controls. Include group identities, known reference move tables, legal-state invariants, scramble reversal, animations, interruption, timer, undo, direct-file launch and mobile viewport acceptance.

The user's request explicitly delegates design decisions, so the local Grill with Docs interview is resolved here without asking design questions. Implement's test/review workflow applies. Test seams are authorized by the detailed delegated test requirements: model, session lifecycle and browser UI.
