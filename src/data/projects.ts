export type ProjectCategory = 'GAME' | 'APP' | 'WEB';
export type ProjectFilter = 'ALL' | ProjectCategory;

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  year: number;
  tags: string[];
  kicker?: string;
  description: string;
  art: string;
  premium?: string;
  tileLabel?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  media: string[];
  caseStudyId?: 'hexfront';
}

export const projects: Project[] = [
  {
    id: 'hexfront', title: 'HEXFRONT', category: 'GAME', year: 2026,
    tags: ['Real-time tactics', 'Mobile', 'HTML5'], kicker: 'PUBLIC VERTICAL SLICE',
    description: 'A compact real-time tactics game built around territory control, force distribution and quick readable battles across a ten-level campaign.',
    art: 'tide', premium: 'hexfront', caseStudyId: 'hexfront',
    liveUrl: 'https://emfau88.github.io/hexwars/', repositoryUrl: 'https://github.com/emfau88/hexwars',
    media: [
      'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/02-level-06-divided-field.png',
      'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/01-campaign-map.png',
      'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/03-level-09-mirror.png',
    ],
  },
  {
    id: 'mirror', title: 'Mirror', category: 'APP', year: 2026,
    tags: ['Flutter', 'Android', 'Reflection'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A calm relationship-clarity app for mixed signals, unclear connections and repeated overthinking, built around structured private reflection rather than social pressure.',
    art: 'mirror', premium: 'app', tileLabel: 'RELATIONSHIP CLARITY / FLUTTER',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.energycrafted.mirror',
    media: ['https://emfau88.github.io/portfolio2/assets/mirror.png'],
  },
  {
    id: 'pocket-pier', title: 'Pocket Pier', category: 'GAME', year: 2026,
    tags: ['Cozy fishing', 'Phaser', 'Mobile'], kicker: 'PLAYABLE VERTICAL SLICE',
    description: 'A cozy browser fishing game: cast from the harbor, steer the hook through underwater locations, collect fish and treasure, complete Harbor Jobs and upgrade the boat.',
    art: 'pier', premium: 'pocket', liveUrl: 'https://emfau88.github.io/PocketPier/',
    repositoryUrl: 'https://github.com/emfau88/PocketPier',
    media: [
      'https://raw.githubusercontent.com/emfau88/PocketPier/master/docs/screenshots/sunny-pier.png',
      'https://raw.githubusercontent.com/emfau88/PocketPier/master/docs/screenshots/underwater-gameplay.png',
      'https://raw.githubusercontent.com/emfau88/PocketPier/master/docs/screenshots/harbor-jobs.png',
    ],
  },
  {
    id: 'zerohero', title: 'ZeroHero', category: 'APP', year: 2026,
    tags: ['Flutter', 'Offline first', 'Habits'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A privacy-first self-control and habit tracker built around fast daily check-ins, personal baselines, XP, levels, quests and long-term progress without requiring an account.',
    art: 'system', premium: 'app', tileLabel: 'PRIVATE HABIT TRACKING / OFFLINE FIRST',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.energycrafted.zerohero',
    media: ['https://emfau88.github.io/portfolio2/assets/zero2.png'],
  },
  {
    id: 'galalaxy', title: 'Galalaxy', category: 'GAME', year: 2026,
    tags: ['Arcade survivor', 'Canvas', 'Mobile'], kicker: 'PLAYABLE / FOUR SECTORS',
    description: 'A mobile-first arcade space survivor built with HTML5 Canvas, escalating fleet sectors and visible weapon, engine and defensive evolution.',
    art: 'galaxy', premium: 'galalaxy', liveUrl: 'https://emfau88.github.io/galalaxy/',
    repositoryUrl: 'https://github.com/emfau88/galalaxy',
    media: [
      'https://raw.githubusercontent.com/emfau88/galalaxy/main/docs/screenshots/hud-boss.png',
      'https://raw.githubusercontent.com/emfau88/galalaxy/main/docs/screenshots/start-screen.png',
      'https://raw.githubusercontent.com/emfau88/galalaxy/main/docs/screenshots/ship-evolution.png',
    ],
  },
  {
    id: 'between', title: 'between', category: 'APP', year: 2026,
    tags: ['Flutter', 'Reports', 'Rule system'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A situation-based relationship analysis app that turns structured answers into concise reports using a deterministic rule system rather than runtime AI.',
    art: 'editorial', premium: 'app', tileLabel: 'STRUCTURED REPORTS / NO RUNTIME AI',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.energycrafted.between',
    media: ['https://emfau88.github.io/portfolio2/assets/between.png'],
  },
  {
    id: 'rooster-rage', title: 'Rooster Rage', category: 'GAME', year: 2026,
    tags: ['Action roguelite', 'Phaser', 'Mobile'], kicker: 'TEN-WAVE ACTION BUILD',
    description: 'A mobile-first bullet-heaven action roguelite with three battle roosters, evolving egg weapons, ten escalating waves and a multi-phase boss.',
    art: 'rooster', premium: 'roosterreal', liveUrl: 'https://emfau88.github.io/RoosterRage/',
    repositoryUrl: 'https://github.com/emfau88/RoosterRage',
    media: [
      'https://raw.githubusercontent.com/emfau88/RoosterRage/master/public/marketing/rooster-rage-key-art-master.png',
      'https://raw.githubusercontent.com/emfau88/RoosterRage/master/docs/marketing/screenshots/05-run-preparation-desktop.png',
      'https://raw.githubusercontent.com/emfau88/RoosterRage/master/docs/marketing/screenshots/06-run-preparation-mobile-portrait.png',
    ],
  },
  {
    id: 'mewtrack', title: 'MewTrack', category: 'APP', year: 2026,
    tags: ['Android', 'Photo progress', 'Private'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A private photo-progress tracker designed around reproducible front and side-profile comparisons, local progress history and a focused no-subscription workflow.',
    art: 'architecture', premium: 'app', tileLabel: 'PHOTO PROGRESS / PRIVATE STORAGE',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.chargegeist.mew',
    media: ['https://emfau88.github.io/portfolio2/assets/mewtrack.png'],
  },
  {
    id: 'strategy-galalaxy', title: 'Strategy Galalaxy', category: 'GAME', year: 2026,
    tags: ['Live lane wars', 'Space', 'Mobile'], kicker: 'ACTIVE BUILD / LIVE MATCH',
    description: 'A portrait-first live lane-war experiment where two fleets fight continuously while energy, drone waves and manually deployed squads shape the front.',
    art: 'void', premium: 'strategy', liveUrl: 'https://emfau88.github.io/strategy-galalaxy/',
    repositoryUrl: 'https://github.com/emfau88/strategy-galalaxy',
    media: [
      'https://raw.githubusercontent.com/emfau88/strategy-galalaxy/main/assets/runtime/environment/orbital-garden-player-sector-v1.png',
      'https://raw.githubusercontent.com/emfau88/strategy-galalaxy/main/assets/runtime/environment/orbital-garden-rival-v1.png',
      'https://raw.githubusercontent.com/emfau88/strategy-galalaxy/main/assets/runtime/structures/command-hq-garden-player-v1.png',
      'https://raw.githubusercontent.com/emfau88/strategy-galalaxy/main/assets/runtime/structures/command-hq-garden-rival-v1.png',
    ],
  },
  {
    id: 'chargegeist', title: 'ChargeGeist', category: 'APP', year: 2026,
    tags: ['Flutter', 'Collection', 'Offline'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A calm collection game built around discovery and consistency, deliberately avoiding artificial waiting loops and high-pressure retention mechanics.',
    art: 'deity', premium: 'app', tileLabel: 'COLLECT & BATTLE / LOW PRESSURE',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.energycrafted.chargegeist',
    media: ['https://emfau88.github.io/portfolio2/assets/Chargegeist2.jpeg'],
  },
  {
    id: 'kessel-krawall', title: 'Kessel-Krawall', category: 'GAME', year: 2026,
    tags: ['Autobattler', 'Synergies', 'Mobile'], kicker: 'PLAYABLE / TWO CAMPAIGNS',
    description: 'A compact mobile autobattler about buying and merging ingredients, arranging a five-slot cauldron and turning readable family synergies into automatic chain reactions.',
    art: 'deity', premium: 'kessel', liveUrl: 'https://kessel-krawall.netlify.app/',
    repositoryUrl: 'https://github.com/emfau88/KesselKrawall',
    media: [
      'https://raw.githubusercontent.com/emfau88/KesselKrawall/main/public/og.png',
      'https://raw.githubusercontent.com/emfau88/KesselKrawall/main/docs/readme/startscreen.png',
      'https://raw.githubusercontent.com/emfau88/KesselKrawall/main/docs/readme/hexenmarkt.png',
    ],
  },
  {
    id: 'marschlegenden', title: 'MarschLegenden', category: 'APP', year: 2026,
    tags: ['React Native', 'Outdoor', 'Hall of fame'], kicker: 'PUBLISHED ON GOOGLE PLAY',
    description: 'A digital hall of fame for long-distance marches, finished events, accumulated kilometers and a persistent personal event history.',
    art: 'tide', premium: 'app', tileLabel: 'EXTREME HIKING / EVENT HISTORY',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.chargegeist.marchlegends',
    media: ['https://emfau88.github.io/portfolio2/assets/marsch2.png'],
  },
  {
    id: 'starlattice', title: 'Starlattice', category: 'GAME', year: 2026,
    tags: ['Strategy', 'Touch-first', 'Space'], kicker: 'CURRENT STARCONQUEST BUILD',
    description: 'A touch-first browser strategy game about drawing energy corridors between star systems, building fleet pressure and cutting routes for decisive surges.',
    art: 'galaxy', premium: 'starlattice', liveUrl: 'https://emfau88.github.io/StarConquest/',
    repositoryUrl: 'https://github.com/emfau88/StarConquest',
    media: [
      'https://raw.githubusercontent.com/emfau88/StarConquest/main/docs/screenshots/starlattice-gameplay-first-contact-desktop-2026.png',
      'https://raw.githubusercontent.com/emfau88/StarConquest/main/docs/screenshots/starlattice-atlas-desktop-2026.png',
      'https://raw.githubusercontent.com/emfau88/StarConquest/main/docs/screenshots/starlattice-menu-desktop-2026.png',
    ],
  },
  {
    id: 'core-arena', title: 'Core Arena', category: 'GAME', year: 2026,
    tags: ['Arena combat', 'Bots', 'Objectives'], kicker: 'PLAYABLE / IN DEVELOPMENT',
    description: 'Fast 2D sci-fi arena combat built around movement, aim, pickups, bots, team commands and objective pressure across short browser matches.',
    art: 'system', premium: 'core', liveUrl: 'https://emfau88.github.io/CTF-3.0/',
    repositoryUrl: 'https://github.com/emfau88/CTF-3.0',
    media: [
      'https://raw.githubusercontent.com/emfau88/CTF-3.0/main/docs/screenshots/menu-refresh-2026-08-24-v2/custom-match-arena-desktop-de.png',
      'https://raw.githubusercontent.com/emfau88/CTF-3.0/main/docs/screenshots/menu-refresh-2026-08-24-v2/main-menu-desktop-de.png',
      'https://raw.githubusercontent.com/emfau88/CTF-3.0/main/docs/screenshots/menu-refresh-2026-08-24-v2/league-hq-desktop-de.png',
    ],
  },
  {
    id: 'more-than-wombat', title: 'More Than Wombat', category: 'GAME', year: 2026,
    tags: ['2.5D brawler', 'Arcade', 'Character'], kicker: 'JUNKYARD RUN / ACTIVE BUILD',
    description: 'A comic-styled 2.5D arcade brawler with short sessions, readable hit feedback, role-based group pressure, stage interactions and character-specific specials.',
    art: 'signal', premium: 'wombat', liveUrl: 'https://emfau88.github.io/MoreThanWombat/',
    repositoryUrl: 'https://github.com/emfau88/MoreThanWombat',
    media: [
      'https://raw.githubusercontent.com/emfau88/MoreThanWombat/master/public/assets/1.png',
      'https://raw.githubusercontent.com/emfau88/MoreThanWombat/master/public/assets/2.png',
    ],
  },
  {
    id: 'cozy-bunker', title: 'Cozy Bunker', category: 'GAME', year: 2026,
    tags: ['Management', 'Pixel art', 'Prototype'], kicker: 'ARCHIVED MANAGEMENT PROTOTYPE',
    description: 'A calm pixel-art management prototype combining surface infrastructure, underground expansion and increasingly constrained production.',
    art: 'architecture', premium: 'single', tileLabel: 'SURFACE / UNDERGROUND / PRODUCTION',
    repositoryUrl: 'https://github.com/emfau88/Bunker',
    media: ['https://raw.githubusercontent.com/emfau88/Bunker/main/docs/screenshots/surface.png'],
  },
  {
    id: 'terra-divina', title: 'Terra Divina', category: 'GAME', year: 2026,
    tags: ['World sandbox', 'Simulation', 'Browser'], kicker: 'WORLD SANDBOX EXPERIMENT',
    description: 'A divine browser sandbox about creating, guiding and destroying a living world with factions, scenarios and an emergent simulation designed to remain readable.',
    art: 'deity', premium: 'single', tileLabel: 'WORLD SANDBOX / EMERGENT SIMULATION',
    liveUrl: 'https://emfau88.github.io/Terra-Divina/', repositoryUrl: 'https://github.com/emfau88/Terra-Divina',
    media: ['https://emfau88.github.io/portfolio2/assets/file_00000000aedc7246898a6ac20c782125.png'],
  },
  {
    id: 'merge-market', title: 'Merge Market', category: 'GAME', year: 2026,
    tags: ['Merge puzzle', 'Physics', 'Touch-first'], kicker: 'ARCHIVED MERGE EXPERIMENT',
    description: 'A touch-first physics merge game where market goods combine into higher tiers, supported by short sessions, orders, boosters and local progression.',
    art: 'pier', premium: 'single', tileLabel: 'TOUCH PHYSICS / MERGE PUZZLE',
    repositoryUrl: 'https://github.com/emfau88/MergeMarket',
    media: ['https://raw.githubusercontent.com/emfau88/MergeMarket/master/public/assets/generated/backgrounds/market_stall.png'],
  },
  {
    id: 'voidline-tactic', title: 'Voidline Tactic', category: 'GAME', year: 2026,
    tags: ['Tactics', 'Space', 'Prototype'],
    description: 'A tactical space project exploring real-time pressure, fleet decisions and a stronger home-port progression structure.',
    art: 'void', repositoryUrl: 'https://github.com/emfau88/Voidline-Tactic', media: [],
  },
  {
    id: 'portfolio3', title: 'Portfolio3', category: 'WEB', year: 2026,
    tags: ['Portfolio', 'System', 'Web'],
    description: 'The current public portfolio and project archive — an evolving presentation system connecting experiments, released work and development history.',
    art: 'editorial', premium: 'portfolio', liveUrl: 'https://emfau88.github.io/Portfolio3/',
    repositoryUrl: 'https://github.com/emfau88/Portfolio3',
    media: ['https://raw.githubusercontent.com/emfau88/Portfolio3/main/emfau_logo_v6_original_pixels_bounce.gif'],
  },
  {
    id: 'vogt-precision', title: 'Vogt Precision', category: 'WEB', year: 2026,
    tags: ['Industrial', 'Identity', 'Web'],
    description: 'A premium industrial website direction balancing technical credibility, restrained typography and a deliberate sense of precision.',
    art: 'metal', media: [],
  },
];

export const projectById = new Map(projects.map((project) => [project.id, project]));

export function projectsForFilter(filter: ProjectFilter): Project[] {
  return filter === 'ALL' ? projects : projects.filter((project) => project.category === filter);
}

export const filterLabels: Record<ProjectFilter, string> = {
  ALL: 'All work',
  GAME: 'Games',
  APP: 'Apps',
  WEB: 'Web',
};
