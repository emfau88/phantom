# EMFAU Spatial Portfolio — Production Refactor

Repository: <https://github.com/emfau88/phantom.git>

## 1. Mission and outcome

Take over the existing working prototype and turn it into a professional,
maintainable production website.

This is a migration and production refactor, not a greenfield redesign.

The current `index.html`, titled **EMFAU — Spatial Portfolio V16**, is the
authoritative source for the current visual language, content and interaction
behavior. Preserve what makes V16 distinctive while replacing its prototype
rendering architecture with a real Three.js/WebGL scene.

The production application must use:

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- GSAP where timeline coordination is useful
- custom GLSL where it materially improves the experience

The task is complete only when the migrated site builds, runs, passes the
required checks, works at the required desktop and mobile sizes, and retains
the important V16 behavior. Do not stop after proposing an architecture or
creating a partial scaffold.

## 2. Requirement language and decision order

- **MUST** means a non-negotiable product, safety or acceptance requirement.
- **SHOULD** means the expected implementation unless repository evidence or
  measurement supports a better choice.
- **MAY** means optional and must not delay or weaken required work.

When requirements compete, use this order:

1. Preserve the distinctive V16 experience and real project content.
2. Preserve functionality, accessibility and input reliability.
3. Meet production correctness and performance requirements.
4. Prefer maintainable architecture and the simplest sufficient system.
5. Add polish only after parity is established.

Do not use “technical difficulty” as a reason to silently remove a feature. If
a non-negotiable cannot be reproduced exactly, implement the closest robust
alternative, document the difference and explain the evidence behind the
decision.

## 3. Scope, repository safety and authority

Work only inside `emfau88/phantom`.

Before editing:

1. Inspect the repository status, current branch, tracked files and any
   uncommitted changes.
2. Read any repository-local instructions such as `AGENTS.md`.
3. Preserve unrelated user changes and work around them.

Do not:

- modify any source game/app repository
- overwrite unrelated user work
- rewrite Git history
- force-push
- push, publish or deploy unless explicitly requested
- copy Phantom production bundles, code, proprietary assets, imagery, fonts or
  branding
- fabricate project facts, links, contact details or case-study content

Copying portfolio preview assets into this repository is allowed only when the
source and rights are clear. Record localized assets in an asset manifest with
their source URL, source repository and relevant license/ownership note. Leave
uncertain assets remote and document them instead of guessing.

## 4. Verified starting point and sources of truth

The current repository contains `index.html` and `index2.html`.

Known V16 facts that must be verified during the audit:

- `index.html` is the current V16 baseline.
- It contains exactly 21 project definitions: 13 `GAME`, 6 `APP`, 2 `WEB`.
- The current grid is painted to Canvas2D, uploaded as a fullscreen WebGL
  texture with `gl.texImage2D(...)` and distorted afterward.
- The fullscreen Canvas2D texture is uploaded repeatedly in the render loop.
- The German clock currently appends a literal `CET` suffix.
- HEXFRONT has a tile-to-case-study transition and a complete DOM case study.
- Projects without a full case study have a lightweight detail fallback.

Source priority:

1. Current V16 `index.html` for project data, content, layout, behavior and
   visual calibration.
2. Rendered V16 at the required viewport sizes.
3. `index2.html` only as secondary context.
4. This brief for the production target and constraints.
5. Phantom references for interaction philosophy, not source code.

Primary experiential reference: <https://www.phantom.land/>

Published technical reference:
<https://tympanus.net/codrops/2025/06/30/invisible-forces-the-making-of-phantom-lands-interactive-grid-and-3d-face-particle-system/>

This is a clean-room implementation. Study the public behavior and concepts,
then implement them independently for EMFAU.

## 5. Required audit artifacts

Before replacing the entry point, read the complete V16 source and create:

### `docs/v16-audit.md`

Document:

- all project entries and current category counts
- project media and external dependencies
- global UI and application states
- pointer, touch, keyboard and scroll interactions
- grid layout, repetition and editorial placement
- distortion and vignette behavior
- hover, drag, inertia and camera behavior
- filtering and counters
- About and Contact states
- HEXFRONT opening, closing and case-study content
- generic project-detail behavior
- mobile/responsive behavior
- reduced-motion behavior
- current accessibility behavior
- current rendering architecture and its technical debt
- known defects and ambiguities

### `docs/parity-checklist.md`

Create a traceable V16-to-production checklist. Every non-negotiable behavior
must have one of these final states:

- matched
- deliberately improved
- known difference with explanation
- blocked with evidence

### Baseline screenshots

Capture V16 before migration at:

- 1440 × 900
- 1920 × 1080
- 390 × 844
- 844 × 390

Store them under `docs/qa/v16-baseline/` with descriptive filenames. Capture
the initial grid plus representative hover/filter/case-study states where the
environment permits reliable capture.

### Legacy preservation

Before replacing the application entry point, preserve the complete original
V16 as:

`legacy/v16-single-file.html`

It must remain runnable for side-by-side comparison and must not be included in
the production JavaScript bundle.

After completing the audit artifacts, continue directly into implementation.

## 6. Product and visual contract

EMFAU is an independent creative developer building distinctive websites,
interactive experiences and playable worlds.

The portfolio should feel:

- premium and restrained
- dark, spatial and tactile
- calm rather than flashy
- editorial rather than like a gaming website
- technically sophisticated without showing off the technology itself
- experimental without becoming confusing

The homepage should read as a large black spatial exhibition surface with real
EMFAU work embedded into it. The visitor should notice, in order:

1. project imagery
2. spatial movement
3. EMFAU identity
4. unusually polished interaction

Avoid:

- neon cyberpunk styling or gratuitous glow
- generic SaaS cards or template aesthetics
- huge rounded dashboard panels
- staggered masonry
- individual card rotations, tilting or exaggerated perspective
- aggressive fisheye or convex globe distortion
- effects with no interaction purpose

Black remains dominant. Project imagery carries most of the color.

## 7. Homepage grid visual behavior

The grid MUST remain a WebGL-rendered spatial wall, not a flat HTML grid.

Required character:

- strict orthogonal rows and columns
- nearly gapless cells with thin grid lines
- dark negative space
- a relatively flat center with progressively curved edges
- a gently recessed, concave-wall impression
- approximately 5–6 visible columns and around 3 rows on a normal desktop
- media occupying roughly 92–95% of tile width and 74–78% of tile height
- minimal metadata with sufficient top/bottom breathing room

Do not reintroduce earlier prototype traits such as tiny images inside oversized
cells, outward fisheye distortion, floating 3D cards or neon-heavy lighting.

### Distortion baseline

Start from V16's visually calibrated values:

- base sample scale: approximately `0.885`
- horizontal radial metric: approximately `0.78`
- radial distortion: approximately `-0.145`
- vertical multiplier: approximately `0.86`
- vignette intensity: approximately `0.34`

Conceptually:

```glsl
vec2 p = centeredUv;
vec2 metric = p * vec2(0.78, 1.0);
float r2 = dot(metric, metric);

float xScale = 0.885 + distortion * r2;
float yScale = 0.885 + distortion * 0.86 * r2;
```

The negative radial direction is intentional. Preserve the recessed/concave
appearance. Make the implementation aspect-aware and tune it against the V16
screenshots instead of treating these numbers as universal constants.

Use one explicit postprocessing render path, for example:

`RenderPass → custom DistortionPass → OutputPass`

Do not accidentally render both the default R3F scene and the composer scene in
the same frame. Bloom, chromatic aberration and film grain are not required.
Add an optional effect only when visual comparison and performance measurements
justify it.

## 8. Production architecture

Use React/R3F for application composition and scene lifecycle, with a focused
imperative Three.js controller for high-frequency grid behavior.

A suitable responsibility split is:

```text
React application
├─ semantic DOM chrome and accessibility layer
├─ section/filter/project state
├─ About and Contact
├─ project details and case studies
└─ R3F Canvas
   ├─ ProjectsGrid primitive/controller
   └─ Postprocessing
```

The grid controller should own:

- grid position and velocity
- drag lifecycle and pointer samples
- ambient pointer offset
- tile layout, recycling and spatial identity
- visible tile pool
- hover interpolation and illumination
- texture/UV assignment
- per-frame mutable values

React should own:

- active section
- active filter
- selected project/view state
- filter-menu state
- browser-history synchronization
- semantic accessibility state
- case-study DOM

Do not store pointer coordinates, velocity, tile transforms, camera offsets or
other per-frame values in React/global application state. Avoid redundant state:
derive `caseStudyOpen` from a single selected-project/view state rather than
maintaining flags that can diverge.

Suggested structure, adaptable when repository evidence supports a better
layout:

```text
src/
├─ main.tsx
├─ App.tsx
├─ data/
│  ├─ projects.ts
│  └─ caseStudies.ts
├─ components/
├─ features/
│  ├─ case-study/
│  └─ project-transition/
├─ scene/
│  ├─ GridScene.tsx
│  ├─ ProjectsGrid.tsx
│  ├─ grid/
│  │  ├─ GridController.ts
│  │  ├─ GridNavigation.ts
│  │  ├─ TilePool.ts
│  │  ├─ gridConfig.ts
│  │  └─ types.ts
│  ├─ postprocessing/
│  └─ shaders/
├─ styles/
├─ hooks/
└─ utils/
```

## 9. GPU tile rendering and picking

The project wall MUST be real GPU scene content.

Acceptable approaches include:

- a reusable pool of individual Three.js meshes with cached textures
- an `InstancedMesh` solution where selection and variable metadata remain
  maintainable
- one or more texture atlases with correctly assigned UV rectangles

Start with the simplest cached GPU-texture solution that meets measured
performance targets. Introduce a texture atlas only if measurement shows a
material benefit. If using atlases, account for mobile maximum texture size,
padding/bleeding, mipmaps, texture color space and resource disposal.

Not acceptable:

- repainting the portfolio into Canvas2D every frame
- uploading a fullscreen Canvas2D texture every frame
- positioning one DOM `<img>` overlay per WebGL tile
- rerendering a React project component every animation frame
- creating thousands of offscreen tiles instead of recycling a visible pool

### Distortion-aware picking — non-negotiable

Postprocessing changes where tiles appear on screen. Normal R3F raycasting
against undistorted normalized device coordinates is not sufficient by itself.

Hover, click and touch selection MUST align with the visibly distorted tiles
throughout the viewport, including the curved outer regions. Use a verified
inverse-distortion mapping, GPU/ID picking, equivalent math or another robust
solution.

Add automated or deterministic test coverage for center and edge picking. A
tile must not visually illuminate while another tile receives the click.

## 10. Project data and editorial layout

Extract the exact 21 projects from V16. Do not reconstruct them from a manually
written list.

Use one canonical category vocabulary:

```ts
type ProjectCategory = 'GAME' | 'APP' | 'WEB';

interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  year: number;
  kicker?: string;
  description: string;
  tags: string[];
  cover: ProjectCover;
  media?: ProjectMedia[];
  liveUrl?: string;
  repositoryUrl?: string;
  caseStudyId?: string;
}
```

Normalize and validate source strings such as `year`, but do not change their
meaning. Adding a project later must require editing data, not renderer logic.

Retain continuous spatial exploration and deterministic project repetition,
while improving editorial placement:

- do not place the same project directly beside itself
- place strong work in the initial viewport
- balance bright/dark artwork, portrait app work, game imagery and web work
- keep layout deterministic across reloads at the same viewport
- preserve enough spatial identity to return to an originating tile

## 11. Motion and interaction contract

Motion must be delta-time-aware and stable across common 60 Hz and high-refresh
displays.

### Ambient pointer movement

When idle, pointer movement should shift the grid very slightly in the opposite
direction. It should be felt more than noticed.

### Drag and touch

- Mouse: press and drag.
- Touch: direct one-finger drag.
- Use pointer capture where appropriate.
- Prevent browser scrolling only when the gesture belongs to the grid.
- Preserve natural case-study scrolling.

### Inertia

Estimate release velocity from recent pointer samples, continue movement on
release and decay it smoothly. Reuse mutable vectors and avoid per-frame
allocations. Phantom's public interpolation constants may inform tuning, but
match V16/desired feel rather than copying constants mechanically.

### Drag camera response

On press/drag, subtly pull the camera back; on release, return smoothly. A
relative camera-Z change around `+0.5`, roughly one-second duration and an ease
similar to `.23, 1, .32, 1` are starting references, not fixed values.

### Click versus drag

Selection reliability is mandatory:

- use accumulated pointer distance in CSS pixels
- allow pointer-type-specific thresholds where needed
- do not classify a long press as a drag based on time alone
- cancel selection when the movement threshold is crossed
- a drag must never accidentally open a project
- test mouse, touch and edge tiles

### Hover

The metaphor is a work in a dark gallery being illuminated.

Idle tiles are slightly darker and less saturated. On hover, the image
approaches full brightness, metadata brightens and the cell receives extremely
soft illumination. Avoid lifting, tilting, large scaling, giant borders or neon
glow. Neighbor dimming may be used subtly.

## 12. Filtering

Filters are:

- All work
- Web
- Games
- Apps

Required behavior:

- filtered content, active control and counter remain synchronized
- hover/selection state resets safely when its tile disappears
- semantic/ARIA state updates immediately
- mobile controls remain reachable
- project assignment remains deterministic

Preferred visual sequence:

1. irrelevant tiles fade or dim
2. retained/reassigned tiles settle into their positions
3. the grid stabilizes
4. the visible counter completes its update

Use GSAP for the authored transition timeline and the grid update loop for
continuous movement. Keep the transition refined and short, not theatrical.

## 13. Brand and DOM chrome

Preserve the V16 hierarchy:

- top left: compact, readable EMFAU word badge
- top center: positioning statement
- top right: Germany, local time, availability, Let's Talk
- bottom center: Work, About, Contact
- bottom right: Filter
- bottom left: project counter

The EMFAU word badge remains the basis. Do not replace it with a generic icon or
revive the earlier Rockstar-like symbol. The subtle `//` motif MAY be used for a
loading/filter/opening transition only when it improves the result.

Use safe-area insets. Keep About and Contact DOM-based and preserve their V16
content. Do not invent email or social links.

### Berlin time

Use `Intl.DateTimeFormat` with `timeZone: 'Europe/Berlin'`. Do not hardcode `CET`.
The preferred robust presentation is time without an abbreviation. If a time
zone name is shown, accept locale-correct output such as CET/CEST, MEZ/MESZ or a
GMT offset instead of assuming every runtime returns the same abbreviation.

## 14. Project opening and case studies

### HEXFRONT — non-negotiable

Preserve the premium sequence:

1. activate the clicked HEXFRONT tile
2. fade the grid/chrome
3. visually detach the artwork
4. expand it toward a full-page hero
5. reveal the scrollable DOM case study
6. reverse toward the originating tile on close when that tile remains valid

Do not replace it with an instant modal or generic page fade.

Use a WebGL-to-DOM bridge or equivalent technique. The captured source geometry
MUST reflect the postprocessed visible tile bounds, not merely the undistorted
mesh projection. Freeze or snapshot the relevant grid/origin state during the
transition so inertia, filtering or recycling cannot change the source identity
mid-animation.

The HEXFRONT case study must retain the factual substance in V16:

- large gameplay hero
- title and concise statement
- role, format, campaign, input, languages and status
- campaign atlas and gameplay screenshots
- interaction/design explanation
- Live Project and GitHub links
- Back to Grid

Long-form case-study content remains semantic, scrollable DOM/HTML.

### Generic architecture

Create reusable project opening/closing and case-study infrastructure. HEXFRONT
is the first full case study; other projects may retain the existing lightweight
detail view until factual case-study content exists. Do not fabricate missing
content.

### History and direct links

- Opening a detail/case study must create a reversible browser-history state.
- Browser Back and `Escape` must close it and return to a valid grid state.
- Forward navigation must restore a valid detail state where practical.
- Use a GitHub-Pages-compatible URL strategy, such as query/hash state or a
  documented static fallback.
- A directly loaded project URL must not produce a GitHub Pages 404.
- External links opened in a new tab must use safe `rel` attributes.

## 15. Responsive behavior, accessibility and fallback

Required viewports:

- desktop and laptop
- portrait phone
- landscape phone

Requirements:

- touch drag and reliable click-versus-drag
- no horizontal browser overflow
- usable simplified header/navigation
- reachable filter and bottom navigation
- safe-area support
- naturally scrollable case studies
- sensible resize/orientation handling
- capped DPR, with `1–1.75` as a starting range

### Accessibility

The experimental presentation must not make the portfolio inaccessible.

Required:

- semantic buttons and links with accessible names
- visible keyboard focus
- keyboard-operable sections, filters, project selection and closing
- `Escape` closes menus/details/case studies in the correct order
- filter state represented with appropriate ARIA state
- meaningful alt text for case-study media
- About and Contact usable without precision pointing
- a semantic DOM accessibility layer containing the available projects, their
  titles/categories and usable project actions
- logical focus placement when opening and closing a project
- restored focus to the originating control or an equivalent valid control

The DOM accessibility layer must not create a duplicate visual card wall over
the WebGL wall.

### Reduced motion

Respect `prefers-reduced-motion`:

- replace long spatial morphs with short fades or near-instant transitions
- reduce inertia, ambient movement and camera travel
- preserve every action and state change

### WebGL fallback and context loss

Feature-detect required capabilities. If WebGL initialization fails, or a lost
context cannot be restored, show a functional DOM project index with filters,
details and links. A black canvas or error-only screen is not acceptable.

Handle `webglcontextlost`/`webglcontextrestored` where practical and avoid
leaking duplicate resources after restoration.

## 16. Media, loading and resource lifecycle

Reduce runtime dependency on raw GitHub and external portfolio URLs where
rights are clear. Store optimized copies under `public/media/projects/` and
retain sufficient resolution for large tiles/heroes.

Use WebP and/or AVIF where supported, with a reliable fallback when needed.
Avoid loading multi-megabyte originals when a 1200–1600 px derivative is
visually equivalent in context. Create a repeatable asset-processing script and
document its inputs/outputs when practical.

Loading stages:

1. shell, chrome, initial visible covers and WebGL essentials
2. neighboring grid covers
3. case-study and remaining archive media

The first usable frame must not wait for every project asset. Provide restrained
brand-consistent loading feedback, not a generic giant spinner.

Cache and dispose geometries, materials, render targets and textures correctly.
Do not allocate new vectors or arrays in hot per-frame paths. Resize composer
targets when viewport or DPR changes, and avoid repeatedly oscillating dynamic
quality settings.

## 17. Toolchain and reproducibility

Use npm consistently unless the repository already establishes another package
manager. Commit the matching lockfile. Use a supported Node LTS version and
record it in `package.json` engines and/or a version file.

Required scripts:

```text
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Use a small state solution such as React Context or Zustand only if it reduces
complexity. Do not add a large dependency without a concrete need. Use GSAP for
coordinated authored transitions, not routine per-frame physics.

## 18. Deployment

Produce a static Vite build suitable for GitHub Pages from
`emfau88/phantom`.

During the audit, check whether a custom domain or `CNAME` exists. Configure
Vite's base path accordingly; do not assume domain-root hosting. Verify asset,
font, shader, worker and direct-link paths under the actual Pages base.

Add or update a GitHub Actions Pages workflow when none exists. The workflow
should install from the lockfile, run required validation, build once and upload
the static artifact. Creating the workflow does not authorize deploying or
pushing it.

## 19. Testing and evidence

Playwright E2E coverage is required unless an existing equivalent framework is
already present. Add stable semantic selectors or `data-testid` attributes where
needed; do not expose production debug APIs unless they are explicitly guarded.

### Desktop smoke coverage

- application loads without uncaught errors
- WebGL renderer initializes, or the deliberate fallback activates
- grid content is visibly rendered
- drag moves the grid
- drag does not open a project
- center and curved-edge tile clicks select the visually corresponding tile
- hover corresponds to the visible tile
- All/Games/Apps/Web filters work and counts match source data
- About and Contact open/close
- HEXFRONT opens and closes
- `Escape`, Back and Forward behave correctly
- direct-link state loads without a 404

### Mobile coverage

- portrait and landscape app load
- touch drag works
- touch drag does not open a project
- navigation and filters remain reachable
- safe areas are not clipped
- orientation/resize does not break the render targets
- case study opens, scrolls and closes

### Accessibility coverage

- automated accessibility smoke checks for the DOM UI
- complete keyboard path through sections, filters and project opening
- focus enters a detail/case study and returns correctly on close
- reduced-motion mode remains fully functional
- WebGL fallback exposes projects and actions

### Visual QA

Capture final screenshots at the four baseline sizes under
`docs/qa/production/`. Compare them side by side with V16. Record the comparison
in `docs/qa/visual-parity.md`, including deliberate improvements and remaining
differences.

### Performance evidence

Measure after initial loading has stabilized. Record:

- test hardware, OS, browser and viewport
- average and p95 frame time during idle and drag
- active DPR and visible tile-pool size
- initial and deferred media loading behavior
- major texture dimensions and total approximate GPU texture footprint
- absence of repeated fullscreen Canvas2D texture uploads
- absence of React application renders at animation-frame frequency

Desktop target: a smooth experience around 60 fps on normal modern hardware,
with p95 frame time close to the available frame budget. Mobile target: stable,
usable interaction without sustained jank or uncontrolled thermal/load behavior.
If the environment cannot provide representative hardware, report measured
results honestly and state the limitation instead of inventing numbers.

Required final checks:

```text
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

If a check cannot run, explain the exact reason, run the strongest available
alternative and record the remaining verification gap.

## 20. Implementation plan and phase gates

Follow the gates in order. Work may overlap when safe, but do not declare a
phase complete until its exit criteria are met.

### Phase 0 — Safety and baseline

Work:

- inspect repository status and instructions
- inventory files and dependencies
- render V16 at required sizes
- capture baseline screenshots
- preserve `legacy/v16-single-file.html`
- create audit and parity documents

Exit gate:

- V16 is preserved and runnable
- all 21 projects and major behaviors are accounted for
- baseline evidence exists
- no unrelated files were changed

### Phase 1 — Foundation and build

Work:

- create Vite/React/TypeScript application
- establish Node/npm reproducibility and scripts
- extract typed project/case-study data
- extract DOM chrome, About and Contact
- establish styles, safe areas and base-path handling
- add the initial Pages workflow without deploying

Exit gate:

- development server and production build work
- all project data and links match V16
- DOM chrome works without the new grid
- legacy V16 remains available

### Phase 2 — Flat GPU grid

Work:

- implement R3F scene and imperative grid controller
- render real GPU project tiles without distortion first
- implement deterministic layout, grid lines and tile recycling
- load initial/neighbor textures in stages
- establish cleanup and resize behavior

Exit gate:

- the grid uses real Three.js content
- no fullscreen Canvas2D texture is uploaded per frame
- density, image scale and initial editorial composition match V16 closely
- project data is independent of renderer internals

### Phase 3 — Navigation, picking and hover

Work:

- implement ambient pointer response, drag, inertia and camera response
- implement click-versus-drag for mouse/touch
- implement hover illumination
- establish picking abstraction in preparation for distortion
- add targeted interaction tests

Exit gate:

- motion feels stable at different refresh rates
- drag never opens a tile in automated tests
- selected/hovered identity is correct before distortion
- no hot-loop React state or avoidable allocations are present

### Phase 4 — Postprocessing and distorted picking

Work:

- implement the aspect-aware concave distortion and vignette
- ensure one composer render per frame
- implement and verify distortion-aware hover/click mapping
- compare center, corners and edges against V16

Exit gate:

- distortion reads as recessed/concave, never outward/fisheye
- visible and interactive tile bounds agree across the viewport
- grid density and image proportions remain correct after distortion
- screenshots document parity

### Phase 5 — Filtering and spatial composition

Work:

- implement typed filters and correct counts
- add restrained spatial filter transition
- reset invalid hover/selection state
- preserve deterministic, art-directed placement
- synchronize visual and semantic filter state

Exit gate:

- all four filters pass desktop/mobile tests
- counts are correct for the extracted dataset
- no direct duplicate neighbors appear in tested layouts
- repeated filtering does not leak resources or corrupt the tile pool

### Phase 6 — Project details and HEXFRONT transition

Work:

- create generic detail/case-study architecture
- rebuild the postprocessing-aware tile-to-DOM transition
- preserve and structure the full HEXFRONT content
- lock/snapshot the origin during transitions
- implement closing, focus restoration, `Escape`, Back/Forward and direct links
- retain generic fallback details for other projects

Exit gate:

- HEXFRONT opens from center and edge tiles without a visible geometry jump
- reverse transition returns to the correct valid origin or uses a deliberate
  reduced fallback when the origin no longer exists
- browser history and keyboard behavior are correct
- all V16 case-study facts and links are preserved

### Phase 7 — Responsive, accessibility and fallback

Work:

- complete portrait/landscape responsive behavior
- add semantic project-navigation layer
- complete focus and ARIA behavior
- implement reduced-motion mode
- implement functional WebGL fallback and context-loss behavior

Exit gate:

- all core content/actions work with keyboard and without WebGL
- phone portrait/landscape layouts are usable and unclipped
- reduced-motion mode preserves functionality
- automated accessibility smoke checks pass or documented external limitations
  remain

### Phase 8 — Assets, performance and loading

Work:

- localize only verified portfolio assets
- generate optimized derivatives and asset manifest
- complete staged loading
- profile frame time, texture memory, CPU work and React renders
- tune DPR, pool size and shader cost using measurements

Exit gate:

- initial interaction does not wait for the full archive
- no repeated massive texture uploads or uncontrolled allocations exist
- desktop/mobile measurements and limitations are documented
- texture and render resources are disposed correctly

### Phase 9 — Final QA, documentation and cleanup

Work:

- run the complete automated suite
- perform screenshot comparison at all required sizes
- verify GitHub Pages build/base paths
- remove dead prototype code from the production bundle
- update README and QA documents
- complete the parity checklist and known-differences lists

Exit gate:

- all required commands pass, or exact evidence-backed gaps are documented
- production screenshots exist
- README and architecture notes are current
- the legacy prototype remains available but excluded from production code
- every Definition of Done item below has evidence

## 21. Definition of Done

The migration is complete when all of the following are true:

- V16 is preserved under `legacy/` and baseline screenshots exist.
- The production app is no longer a giant single-file implementation.
- The exact V16 project content is typed and data-driven.
- React DOM and WebGL responsibilities are clearly separated.
- The wall is rendered as actual Three.js GPU scene content.
- The old per-frame fullscreen Canvas2D upload architecture is gone.
- Distortion is an aspect-aware postprocess and retains the concave direction.
- Distorted visual positions and pointer/touch picking agree.
- Drag, inertia, ambient motion, hover and camera response retain the intended
  feel.
- Click-versus-drag is reliable on mouse and touch.
- All filters and counters are correct.
- The EMFAU brand/chrome and About/Contact states are preserved.
- HEXFRONT's tile-to-case-study transition and full case study survive.
- Other projects retain usable details without fabricated content.
- Browser history, direct links, `Escape` and focus restoration work.
- Mobile portrait/landscape, safe areas and reduced motion work.
- Keyboard and screen-reader users have a semantic way to browse projects.
- A functional non-WebGL fallback exists.
- Media loading is staged and resources are managed cleanly.
- GitHub Pages build and path handling are verified.
- Required automated checks pass or any remaining gap is precisely documented.
- README, audit, parity, performance and visual QA artifacts are complete.
- Adding a project does not require editing renderer internals.

## 22. Final deliverables and response

Update `README.md` with:

- stack and prerequisites
- architecture and responsibility boundaries
- project data model
- interaction and picking model
- asset-processing/loading strategy
- accessibility and fallback behavior
- development, testing and build commands
- GitHub Pages deployment configuration

At the end, provide a concise final report containing:

1. architecture summary
2. important directories/files
3. major implementation decisions and their evidence
4. what was preserved from V16
5. technical improvements
6. accessibility and fallback behavior
7. measured performance results and test environment
8. known remaining differences versus V16
9. known remaining differences versus the desired interaction quality
10. commands to run locally
11. deployment instructions without claiming an unperformed deployment
12. exact test/build results
13. paths to representative desktop/mobile screenshots

Do not claim success for checks you did not run. Do not hide known differences.

## 23. Start now

Begin with Phase 0: inspect the repository, read the complete V16 source,
preserve it, capture the baseline and write the audit/parity artifacts. Then
continue through the implementation phases until the Definition of Done is met.

Prefer progress over clarification when the repository provides enough evidence.
Ask only when missing information would materially alter the product, create a
rights issue or authorize an external side effect. If one task is blocked,
continue safe independent work and report the blocker with evidence.
