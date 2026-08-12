# About Layer-turn Collision Choreography — Design

**Status:** Approved direction 01 on 2026-08-11; ready for implementation planning after this document is reviewed.

## Goal

Replace the current partial About permutation with a physically legible, collision-safe Layer-turn choreography. All five content blocks, including Passions, move on every exchange while preserving their physical tile footprint and readable idle state.

## Constraints

- Preserve the existing 2D safe surface / 3D live scene gate. The safe surface must cover the scene throughout every face flip.
- The board keeps its source geometry until all animated blocks have landed. React commits the destination geometry only after the exchange completes.
- Do not animate `left`, `top`, `width`, or `height` during travel. Motion is transform and opacity only.
- The choreography starts only while About is active, live, and motion is not reduced. Leaving the face or beginning a flip kills every delayed call, tween, and timeline immediately.
- Reduced motion shows a stable board without autonomous permutation.
- No content block may be permanently static. Do not resize, merge, or split a block during the exchange.

## Board system

The choreography alternates between two complete 3×3 boards. Both boards use the same five physical pieces:

| Block | Footprint | Board A | Board B |
| --- | --- | --- | --- |
| About | 2×1 | top-left horizontal | middle-right horizontal |
| Story | 1×2 | top-right vertical | lower-left vertical |
| Mission | 1×1 | middle-left | lower-middle |
| Mindset | 1×1 | middle-middle | lower-right |
| Passions | 3×1 | full bottom row | full top row |

The two-board cadence is deliberate: it reads like a repeatable Rubik layer turn rather than an arbitrary dashboard shuffle. Every transition moves every block, and Passions alternates between the board’s bottom and top layer.

## Collision model

`aboutSceneModel.ts` becomes the deterministic source of choreography data and pure geometry functions.

1. Convert percentage layouts to board-relative rectangles.
2. Build a conservative swept rectangle for every block from the union of its source and target bounds.
3. Find projected conflicts whenever two swept rectangles overlap. A conflict graph and target-occupancy graph describe which pieces must leave before another can land.
4. Rank motion deterministically by footprint area, blocked target area, and travel length. The 3×1 Passions rail is always the lead object; ties use block index.
5. Assign each ranked object a lane, paint order, signed rotation, and stagger from its computed route. The first three ranks travel above the board; the remaining ranks use the lower deck. Lane centers are separated by at least `BLOCK_DEPTH_PX + LANE_CLEARANCE_PX`.
6. Lift all pieces in a readable, staggered release sequence; hold after the final release; travel projected conflicts serially; land only after all source occupants of the target cells have cleared.

The first implementation uses these physical constants, shared conceptually between the model and the CSS box construction:

| Lane | Block | Center Z | Visual role |
| --- | --- | ---: | --- |
| High 1 | Passions | +176px | Lead rail / top layer |
| High 2 | Story | +128px | Long-route upper rail |
| High 3 | About | +80px | Editorial companion rail |
| Under 1 | Mission | −64px | Lower-deck counterweight |
| Under 2 | Mindset | −112px | Deepest counterweight |

The block depth is 32px and required adjacent-lane clearance is 16px. The backplane moves to at least −180px so the deep route stays in front of it. Lane centers are therefore 48px apart and never overlap in depth. `z-index` follows front-to-back lane order as a stable paint fallback; it is not used as a substitute for depth clearance.

For each block, rotation comes from travel direction: horizontal and vertical displacement choose opposite `rotationY` / `rotationX` signs; a small signed `rotationZ` adds a physical steering cue. The route planner returns these values rather than the animation hook owning per-block magic numbers.

## Timeline

One exchange lasts roughly 3.2 seconds, followed by a seven-second readable idle period.

1. **Release / lift (0.00–0.75s):** all five blocks leave their source cells in priority order, staggered by 110ms. Above-board routes lift; lower-deck routes recess. The final release guarantees every source cell is clear.
2. **Hold (0.75–0.93s):** the empty board reads briefly and establishes all five depth lanes.
3. **Transfer (0.93–2.73s):** conflict-pair transfers are serial. Each block moves along a transform-only route to the target footprint at its assigned depth. The Passions bar travels first and is visibly the lead object; lower-deck routes provide a counterpoint rather than clipping through a foreground block.
4. **Landing (during and after transfer):** each block settles with a small, non-bouncy contact ease once its target is clear. Passions has its own short final hold before the top-row landing, so the large crossbar never reads as a teleport.
5. **Commit (after final landing):** update the outer layout elements to Board B (or Board A in reverse), clear temporary transform/z-index props, then schedule the next idle period.

Target occupancy is cleared before transfer because every source block completed its lift during release. The timeline still carries `targetClearAt` per step and tests it; this keeps the guarantee valid if future boards permit overlapping release and transfer phases.

## Components and data flow

### `aboutSceneModel.ts`

- Defines the two board layouts, physical constants, lane semantics, route step type, and timing constants.
- Exposes pure helpers for bounds, swept-conflict detection, lane assignment, and plan construction.
- Produces a deterministic exchange plan for the current board; it returns all five route steps and immutable metadata needed by GSAP.

### `useAboutChoreography.ts`

- Measures the live board once at exchange start to convert model-relative travel vectors to pixels.
- Uses one GSAP context, one delayed call, and one timeline reference.
- Applies the model’s release, hold, travel, and landing positions to the existing motion wrappers only.
- On `isLive` false or reduced motion, kills the delayed call, timeline, and all element tweens; clears temporary transform, z-index, and elevation properties.
- Commits target outer geometry only from the successful timeline completion callback.

### `AboutFace.tsx` and `AboutFace.module.css`

- Retain the scene gate, safe surface, layout wrapper, and motion wrapper separation.
- Render the two-board model for both the safe tiles and the live board.
- Give each tile a premium Rubik construction: a 32px plastic depth, brighter top bevel, darker side faces, subtle inset sticker grain, contact shadow, and a deep burgundy frame.
- Replace inline button styling with component classes. Use compact mono utility labels, display headings, and short body copy with responsive spacing.
- The idle board is the reading state; no decorative autonomous text animation is added.

## Testing and verification

### TDD model coverage

Add failing tests before changing the model. The completed suite must prove:

- both boards fill the 3×3 grid without overlap or gaps;
- each exchange contains all five blocks and every block changes position;
- Passions moves between the top and bottom rows in both directions;
- collision pairs are derived from source/target bounds;
- adjacent depth lanes meet the block-depth-plus-clearance rule;
- any conflicting travel windows do not overlap;
- every landing begins no earlier than its target’s source occupants have cleared;
- unknown board identifiers remain rejected deterministically.

### Runtime and integration coverage

- Extend the existing About face tests for safe-surface sealing during a flip, inactive state, and outer-layout / inner-motion separation.
- Add a focused hook or face-level test that confirms inactive or reduced-motion state creates no next exchange and that cleanup cancels outstanding motion.
- Run `npm test`, `npm run build`, and `npm run lint` after the implementation tasks.
- Inspect the already-running application at `http://localhost:5173/`: idle readability; the release/hold; every transfer and landing; reduced-motion behavior; and immediately leaving About mid-sequence. Confirm the safe surface remains the only visible layer during each flip.

## Non-goals

- No random layout selection.
- No layout-size morph, merge/split effect, or direct `left`/`top` tween.
- No changes to the global face-flip choreography beyond maintaining the existing scene gate contract.
- No new artwork or a generic portfolio-card visual treatment.
