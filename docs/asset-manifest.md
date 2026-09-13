# Media asset manifest

No remote image was copied into this repository during the refactor. The V16
URLs remain the source of truth because ownership is suggested by the `emfau88`
namespace, but explicit per-repository license terms were not verified. This
avoids silently relicensing or redistributing uncertain assets.

| Runtime origin | Projects | Treatment |
| --- | --- | --- |
| `raw.githubusercontent.com/emfau88/*` | HEXFRONT, Pocket Pier, Galalaxy, Rooster Rage, Strategy Galalaxy, Kessel-Krawall, Starlattice, Core Arena, More Than Wombat, Cozy Bunker, Merge Market, Voidline: Farhaven, Portfolio3 | Kept remote; staged, maximum four concurrent requests |
| `emfau88.github.io/portfolio2/assets/*` | Mirror, ZeroHero, between, MewTrack, ChargeGeist, MarschLegenden, Terra Divina | Kept remote; staged, maximum four concurrent requests |
| `play-lh.googleusercontent.com/*` | Mirror, ZeroHero, between, MewTrack, ChargeGeist, MarschLegenden | Current store screenshots; kept remote |

The exact URL list lives beside the project facts in `src/data/projects.ts`;
editorial media labels and case-study treatment live in
`src/data/caseStudies.ts`. A future localization pass should first
record the license/ownership basis, then generate 1200–1600 px WebP/AVIF
derivatives under `public/media/projects/` and update this manifest.
