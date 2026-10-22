# Integer cubies with an independent presentation

Status: Accepted

The puzzle must remain correct while the player queues inputs, rotates the camera or interrupts animations. Floating-point scene transforms are convenient for drawing but would accumulate drift and couple visual cancellation to game state.

Store the 26 pieces and their sticker normals in integer coordinates. Apply signed quarter rotations only at animation completion. Keep camera and interpolated rotation entirely in the renderer. A session owns the pending queue and replaces its entire active action on reset, restart or scramble. Render on a local canvas instead of adding a WebGL framework or remote runtime.

This adds a small 3D projection renderer, but keeps the puzzle auditable, offline and directly launchable through index.html. Independent cubie coordinates verify corner/edge orientation and permutation parity; published Kociemba F/R tables anchor the convention.
