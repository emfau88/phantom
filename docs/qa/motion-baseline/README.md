# Motion upgrade baseline

## Purpose

This is the frozen pre-upgrade reference for the staged motion and interaction
work. It records the current appearance and behavior without changing production
motion. Later bulks should compare against it rather than relying on memory.

Captured and measured on 2026-09-14 with Microsoft Edge 153 headless. The
performance sample used a 1440 x 900 viewport at device scale factor 1 after
network idle and 1.8 seconds of settling.

## Performance reference

| State | Average interval | p95 interval | Samples |
| --- | ---: | ---: | ---: |
| Idle | 2.99 ms | 5.50 ms | 180 |
| Drag and release inertia | 3.00 ms | 5.50 ms | 180 |

Headless frame intervals are regression signals, not a physical-display FPS
claim. Compare future runs in the same environment and investigate a sustained
increase of more than 20 percent before accepting a shader or grid-motion bulk.

## Interaction reference

| Sample | Drag zoom | Velocity X | Velocity Y |
| --- | ---: | ---: | ---: |
| Before input | 0.000 | 0.000 | 0.000 |
| Pointer held after drag | 0.958 | -20.625 | -5.729 |
| Immediately released | 0.909 | -19.402 | -5.389 |
| 350 ms after release | 0.158 | -2.683 | -0.745 |
| Settled after the sample | 0.001 | -0.009 | 0.000 |

Invariant runtime values:

- 99 recycled tile meshes
- 20 active project identities under the `ALL` filter
- drawing-buffer ratio 1 in this run
- drag above the threshold must never open a project
- sub-threshold movement must still select
- reduced motion must complete the project handoff without a long morph

Reproduce the measurement with `npm run qa:performance` while the development
server is available at `http://127.0.0.1:4173/`.

## Visual reference set

- `grid-idle-desktop.png` — 1440 x 900 settled grid
- `grid-hover-desktop.png` — current center-tile hover
- `grid-drag-desktop.png` — current held-drag depth treatment
- `grid-idle-mobile.png` — 390 x 844 settled grid
- `case-hero-desktop.png` — Pocket Pier hero at 1440 x 900
- `case-scroll-desktop.png` — first editorial section before scroll motion
- `case-hero-mobile.png` — Pocket Pier hero at 390 x 844

Regenerate this set with `npm run qa:motion-baseline`. Do not overwrite it after
motion work begins; create a separate comparison directory for later bulks.

## Automated guardrails added with this baseline

- distortion round trips at center and curved edges, with drag zoom 0–1
- finite transition bounds for idle and active-drag states
- observable held, dragging, velocity and drag-zoom debug state in development
- full-cell click/drag threshold behavior
- finite morph-origin geometry that contains the sub-threshold click
- complete reduced-motion project handoff
- all 20 direct project routes, history, touch drag and fallback behavior
