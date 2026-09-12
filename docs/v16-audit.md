# V16 audit

## Baseline

- Authoritative file: `index.html`, title `EMFAU — Spatial Portfolio V16`.
- Secondary context: `index2.html`.
- Preserved source: `legacy/v16-single-file.html`.
- Dataset: 21 projects — 13 GAME, 6 APP, 2 WEB.
- Viewport calibration: about 5–6 columns and 3 rows; cell width is clamped
  around 192–272 CSS pixels and cell height around 220–292 CSS pixels.

## Project inventory

The complete V16 dataset was transferred to `src/data/projects.ts` without
inventing missing links or content.

| # | Project | Category | Media source |
| ---: | --- | --- | --- |
| 01 | HEXFRONT | GAME | `emfau88/hexwars` (3 images) |
| 02 | Mirror | APP | `portfolio2/assets` |
| 03 | Pocket Pier | GAME | `emfau88/PocketPier` (3 images) |
| 04 | ZeroHero | APP | `portfolio2/assets` |
| 05 | Galalaxy | GAME | `emfau88/galalaxy` (3 images) |
| 06 | between | APP | `portfolio2/assets` |
| 07 | Rooster Rage | GAME | `emfau88/RoosterRage` (3 images) |
| 08 | MewTrack | APP | `portfolio2/assets` |
| 09 | Strategy Galalaxy | GAME | `emfau88/strategy-galalaxy` (4 images) |
| 10 | ChargeGeist | APP | `portfolio2/assets` |
| 11 | Kessel-Krawall | GAME | `emfau88/KesselKrawall` (3 images) |
| 12 | MarschLegenden | APP | `portfolio2/assets` |
| 13 | Starlattice | GAME | `emfau88/StarConquest` (3 images) |
| 14 | Core Arena | GAME | `emfau88/CTF-3.0` (3 images) |
| 15 | More Than Wombat | GAME | `emfau88/MoreThanWombat` (2 images) |
| 16 | Cozy Bunker | GAME | `emfau88/Bunker` |
| 17 | Terra Divina | GAME | `portfolio2/assets` |
| 18 | Merge Market | GAME | `emfau88/MergeMarket` |
| 19 | Voidline Tactic | GAME | none; procedural cover |
| 20 | Portfolio3 | WEB | `emfau88/Portfolio3` |
| 21 | Vogt Precision | WEB | none; procedural cover |

Counts are 13 GAME, 6 APP and 2 WEB. External runtime dependencies are public
GitHub raw files, EMFAU GitHub Pages media, project/live links and Google Play
links. Exact URLs and provenance treatment are recorded in the typed data and
`docs/asset-manifest.md`.

## Rendering architecture

V16 paints the complete virtual grid into a hidden Canvas2D. Every animation
frame uploads the full canvas through `gl.texImage2D`, then a fullscreen WebGL
fragment shader applies radial distortion and vignette. This is the central
production debt. It also creates procedural placeholder art in Canvas2D and
recomposes remote project media into per-project canvases after load.

V16 already contains two important calibrated coordinate transforms:

- `screenToSource` maps distorted pointer positions back into the flat grid.
- `sourceToScreen` iteratively maps source-space points to displayed positions
  and is used by `warpedRect` for the HEXFRONT transition.

These concepts must survive the migration because ordinary R3F raycasting does
not account for a fullscreen postprocess distortion.

## Grid and interaction

- One strict orthogonal infinite grid with deterministic project assignment.
- Full-cell click target; image inset occupies roughly 92–95% of width and
  74–78% of height.
- Mouse/touch drag, release inertia, wheel movement and subtle pointer ambience.
- Five-pixel click-versus-drag threshold in V16.
- Drag zoom is implemented as a very subtle postprocess scale.
- Hover increases brightness, contrast, saturation, border intensity and local
  illumination.
- Distortion baseline: scale 0.885, radial -0.145, X metric 0.78, Y multiplier
  0.86, vignette 0.34.

## Application states

- Work, About and Contact navigation.
- Filter menu: All work, Games, Apps, Web.
- Generic project-detail panel.
- Dedicated full-page HEXFRONT case study.
- HEXFRONT WebGL-tile-to-DOM-image morph with a reverse close transition.
- Escape closes a case study or generic project panel.
- Reduced motion disables major CSS transitions but does not yet reduce all
  continuous grid motion.

## Content and media

The project array contains the authoritative titles, descriptions, tags, URLs
and media. Most cover images point to public EMFAU GitHub repositories or the
existing EMFAU portfolio host. Voidline Tactic and Vogt Precision currently use
procedural fallback art because no media URL is defined.

HEXFRONT contains factual case-study copy, facts, campaign atlas, two gameplay
images, a design statement and live/repository links. Other projects use the
generic detail presentation.

## Responsive behavior

- Safe-area-aware chrome.
- Mobile-specific header, dock, filter and case-study rules.
- Touch events use direct dragging.
- The case-study container restores normal touch scrolling.
- DPR is capped at 1.55 for the grid and 1.7 for detail art.

## Accessibility and known gaps

Existing filters expose `aria-pressed`, and overlays toggle `aria-hidden`.
Buttons are native controls. However, project tiles are canvas-only, there is no
semantic project index, focus is not trapped/restored, browser history is not
synchronized and visible focus treatment is incomplete. The migration adds a
semantic project browser, focus management, history state and a functional DOM
fallback.

## Known defects and ambiguities

- `CET` is hardcoded even during daylight-saving time.
- The fallback when WebGL setup fails is not a functional project browser.
- Project media is externally hosted and loaded concurrently.
- The project year values are strings.
- Current filter changes hard-cut project assignment behind a single global
  fade instead of spatially settling tiles.
- V16 has no direct-link project state or Back/Forward integration.
- Contact copy intentionally says final contact details are still pending; no
  contact details may be invented.
