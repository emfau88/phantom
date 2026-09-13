# EMFAU Spatial Portfolio

Production refactor of the EMFAU V16 spatial portfolio. The site keeps the black,
concave project wall and tactile navigation while replacing the prototype's
per-frame fullscreen Canvas2D upload with a maintainable React/Three.js system.

## Stack and prerequisites

- Node.js 22.12 or newer
- npm
- Vite, React 19 and TypeScript
- Three.js with React Three Fiber
- GSAP for the authored tile-to-case-study bridge transition
- Vitest and Playwright

Install and run:

```bash
npm ci
npm run dev
```

Vite prints the local URL. The application uses `/phantom/` as its base only in
GitHub Actions; local development and previews use `/`.

## Architecture

- `src/App.tsx` owns sections, filters, selected projects, history and overlay
  lifecycle.
- `src/data/projects.ts` is the typed source of truth for all 20 projects. Adding
  a project does not require renderer changes.
- `src/data/caseStudies.ts` contains the individual editorial narrative, facts,
  design pillars and media treatment for every premium detail page.
- `src/scene/grid/GridController.ts` owns the 99-mesh recyclable tile pool,
  deterministic layout, drag, inertia, hover and selection.
- `src/scene/grid/distortion.ts` provides the shared visible/source coordinate
  transforms used by picking and transition geometry.
- `src/scene/postprocessing/PortfolioPostProcessing.tsx` is the single
  `RenderPass -> DistortionPass -> OutputPass` path.
- `src/components/CaseMorph.tsx` bridges distorted WebGL tile bounds into the
  semantic premium case-study system.
- `src/components/ProjectBrowser.tsx` and `FallbackGrid.tsx` provide semantic and
  non-WebGL access to the complete project set.

Each project has one 768 x 900 static `CanvasTexture`, shared by recycled mesh
instances. Initial artwork is available immediately; project covers are requested
only when a project first enters the visible neighborhood, with four concurrent
requests at most. A successful image request repaints that project's texture once.
No fullscreen Canvas2D texture is generated or uploaded each animation frame.

## Interaction and picking

The postprocess bends the rendered scene, so ordinary mesh raycasting would not
match the visible wall near its edges. Pointer coordinates are inverse-warped by
`screenToSource` before deterministic cell lookup. `warpedRect` uses the matching
forward transform to capture the visible tile origin for every project transition.
Selection uses accumulated CSS-pixel movement thresholds (mouse 6 px, touch 9 px),
so a drag never becomes a click based on elapsed time.

Project routes use hashes such as `#project/hexfront`; direct links therefore work
on static GitHub Pages. Escape and browser Back/Forward synchronize with the same
state.

## Accessibility and fallback

Chrome, filters, sections and project actions are semantic DOM controls with
visible focus styles. A keyboard-accessible project browser exposes the complete
archive without duplicating the visual wall. Focus is restored after overlays.
`prefers-reduced-motion` reduces inertia, ambient movement and long transitions.

WebGL capability is checked before mounting. `?fallback=1` forces the functional
DOM fallback for QA. A `webglcontextlost` event also moves the application to that
fallback instead of leaving a black canvas.

## Commands

```bash
npm run dev             # development server
npm run typecheck       # TypeScript validation
npm run lint            # ESLint
npm run test            # unit tests
npm run test:e2e        # desktop/mobile Playwright suite
npm run qa:performance  # local headless frame-interval diagnostic
npm run build           # typecheck + production build
npm run preview         # serve dist locally
```

## Deployment

`.github/workflows/deploy-pages.yml` validates the application, builds once and
uploads `dist/` to GitHub Pages. Repository Pages settings must use **GitHub
Actions** as the source. Pushing this workflow to `main` or `master`, or manually
dispatching it, performs the deployment; creating the workflow locally does not.

## Evidence and legacy

- V16 is preserved at `legacy/v16-single-file.html` and excluded from the bundle.
- Audit and implementation status: `docs/v16-audit.md` and
  `docs/parity-checklist.md`.
- Visual comparison: `docs/qa/visual-parity.md`.
- Performance notes: `docs/qa/performance.md`.
- Media provenance decision: `docs/asset-manifest.md`.
- Baseline and production captures: `docs/qa/v16-baseline/` and
  `docs/qa/production/`.
