# V16 production parity checklist

Status values: `pending`, `matched`, `improved`, `known difference`, `blocked`.

| Requirement | Status | Evidence / notes |
| --- | --- | --- |
| V16 preserved and runnable | matched | `legacy/v16-single-file.html` |
| Verified production dataset | improved | Tests assert 20/13/6/1 and unique IDs; nonexistent Vogt Precision removed |
| Orthogonal infinite spatial grid | matched | Deterministic recycled 11 x 9 pool |
| Real GPU tile meshes | improved | 99 Three.js meshes share 20 static textures |
| Concave distortion direction | matched | V16 parameters retained; four-viewport screenshots |
| Distortion-aware hover/click | matched | Inverse mapping unit tests plus curved-edge E2E |
| Grid density and media proportions | matched | Four target viewport captures |
| Pointer ambience | matched | Controller-level damped pointer offset |
| Mouse/touch drag and inertia | matched | Mouse and real CDP touch E2E |
| Reliable click-versus-drag | improved | Accumulated 6 px mouse / 9 px touch thresholds |
| Hover illumination | matched | Shader brightness, saturation and soft local light |
| All/Games/Apps/Web filters | matched | Counts 20/13/6/1; E2E and unit coverage |
| Counter synchronization | matched | Active counter updates from filtered center identity |
| EMFAU chrome and brand | matched | Responsive screenshot comparison |
| Europe/Berlin clock | improved | `Intl` zone, no hardcoded abbreviation |
| About and Contact | matched | Semantic DOM; keyboard E2E |
| Premium project case studies | improved | All 20 projects have individual facts, narrative, design pillars, media and actions |
| Tile-to-case-study morph | matched | Distorted `warpedRect` origin; reversible shared GSAP bridge |
| Escape and browser history | improved | Escape, hash direct links, Back/Forward state |
| Safe areas and mobile layouts | matched | Portrait/landscape captures and E2E |
| Reduced-motion behavior | improved | Reduced inertia/ambience and short transitions |
| Semantic project browser | improved | Keyboard-accessible 20-project index |
| Functional WebGL fallback | improved | Feature detection, forced-fallback E2E, context-loss handoff |
| GitHub Pages base path | matched | `/phantom/` in Actions; hash routes; Pages workflow |
| Loading and resource lifecycle | improved | Four-load scheduler, shared textures, explicit disposal |
| Localized optimized media | known difference | Kept remote because explicit per-repository license was not verified |
| Per-tile filter choreography | known difference | Short global settle retained; no theatrical GSAP tile cascade |
