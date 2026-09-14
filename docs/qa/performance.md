# Performance evidence

## Environment and method

- Measured 2026-09-12 on Windows 10/11 host reporting Win64.
- Microsoft Edge 153 headless, viewport 1440 x 900, device scale factor 1.
- 180 `requestAnimationFrame` intervals after network idle and 1.8 seconds of
  settling, once idle and once during drag/release inertia.
- Reproduce with `npm run dev` and then `npm run qa:performance`.

The headless browser is not synchronized to a physical display, so its frame
intervals are a regression diagnostic, not a claim of 60 Hz device performance.
Real desktop and phone testing is still required before launch-quality performance
can be certified.

## Result

| State | Average interval | p95 interval | Samples |
| --- | ---: | ---: | ---: |
| Idle | 2.78 ms | 2.90 ms | 180 |
| Drag and inertia | 3.31 ms | 5.60 ms | 180 |

Runtime debug state reported a fixed 99-tile mesh pool and 20 active project
identities. Device DPR and measured drawing-buffer ratio were both 1 in this run;
the R3F canvas caps DPR to the range 1–1.55.

## Resource model

- 20 shared project textures at 768 x 900 RGBA, approximately 52.7 MiB base level
  or about 70.3 MiB including a full mip chain.
- One shared plane geometry and 99 small shader materials; tiles recycle rather
  than accumulating during movement.
- Four remote images load concurrently at most. The shell and procedural covers
  do not wait for the archive. Each real cover causes one texture repaint/upload.
- The scene renders once through `RenderPass -> ShaderPass -> OutputPass`.
- No repeated fullscreen Canvas2D `texImage2D` upload exists.
- Per-frame state remains in the imperative controller; React is updated only
  when hover identity, active index or application state changes.
- Geometry, materials, textures and composer targets are disposed during teardown.

## Remaining optimization opportunities

The production JavaScript is 1,293.50 kB raw / 371.83 kB gzip after the case-study
ScrollTrigger choreography. A later pass can
lazy-load the case-study/GSAP branch and investigate Three.js chunking. Localizing
licensed, optimized media would also reduce origin latency and make dimensions
predictable. Neither issue prevented the current validation suite from passing.

The pre-motion-upgrade measurement from 2026-09-14, including held-drag and
release-state values, is recorded in `motion-baseline/README.md`. Future motion
bulks should compare against that run using the same environment and method.

## Bulk 1 comparison

The 2026-09-14 post-Bulk-1 run measured 3.21 ms average / 5.30 ms p95 while
idle and 2.98 ms average / 3.10 ms p95 during the drag/release sample. The idle
average is about 7 percent above the frozen 2.99 ms baseline and remains below
the 20 percent investigation threshold. Grid behavior and the fixed 99-tile pool
are unchanged; case-study motion is mounted only while a project page is open.
