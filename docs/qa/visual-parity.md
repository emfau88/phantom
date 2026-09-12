# Visual parity report

## Compared evidence

V16 and production captures were reviewed side by side at 1440 x 900,
1920 x 1080, 390 x 844 and 844 x 390. The production HEXFRONT route was also
captured at 1440 x 900. Files are stored in `v16-baseline/` and `production/`.

## Matched

- Dominant black exhibition surface, compact EMFAU badge and restrained chrome.
- Strict orthogonal wall with about 5–6 desktop columns and roughly three rows.
- Large imagery inside nearly gapless cells and thin low-contrast grid lines.
- Recessed/concave edge direction using V16's calibrated distortion values.
- Desktop, portrait-phone and landscape-phone compositions remain usable without
  horizontal document overflow.
- HEXFRONT opens into a full, scrollable editorial case study with its real media.

## Deliberately improved

- The project wall is made of real GPU meshes; V16's fullscreen canvas upload is
  gone.
- Labels are more consistently legible, hover illumination is calmer and the
  responsive chrome has clearer safe-area spacing.
- The Berlin clock no longer hardcodes `CET`.
- Direct-link/history behavior, semantic browsing, focus visibility and a real
  non-WebGL fallback were added without placing HTML cards over the wall.

## Known differences

- Filter reassignment uses a short opacity settle rather than a fully authored
  per-tile GSAP choreography. It is intentionally restrained and deterministic.
- V16's hand-drawn procedural cover treatments are replaced by consistent static
  project textures until each remote image arrives.
- Remote media remains remote because explicit asset licenses were not verified;
  this can make first appearance depend on GitHub/network latency.
- Headless captures cannot judge tactile feel, monitor color or mobile thermal
  behavior. Interaction correctness is covered by automated pointer/touch tests,
  but final real-device taste testing remains advisable before public launch.
