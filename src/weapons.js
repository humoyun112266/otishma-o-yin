// Weapons database containing 50 weapons and items.
// Each weapon has standard CS2-like statistics and a detailed SVG representation.

export const WEAPON_CATEGORIES = {
  PISTOLS: 'Pistols',
  RIFLES: 'Rifles',
  SMGS: 'SMGs',
  HEAVY: 'Heavy & Shotguns',
  MELEE: 'Melee / Knives',
  GEAR: 'Gear & Grenades'
};

// SVG silhouettes for each type of weapon
const SVG_PISTOL = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M25 15 h40 v8 h-10 v22 h-8 v-22 h-22 z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="35" cy="20" r="1.5" fill="currentColor"/><path d="M55 23 l5 5 h5 v-5 z" fill="currentColor"/></svg>`;

const SVG_RIFLE = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M10 20 h10 v5 h5 v-5 h35 v3 h30 v3 h-30 v10 h-10 v-10 h-25 l-8 12 h-7 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M45 28 l-2 6 h4 l-2-6" fill="currentColor"/><circle cx="25" cy="22" r="1" fill="currentColor"/></svg>`;

const SVG_SMG = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M15 15 h45 v6 h-5 v20 h-7 v-20 h-23 l-5 10 h-5 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M35 25 l-2 8 h4 l-2-8" fill="currentColor"/></svg>`;

const SVG_HEAVY = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M10 18 h75 v7 h-15 v15 h-8 v-15 h-32 v10 h-6 v-10 h-14 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="22" cy="21" r="1.5" fill="currentColor"/></svg>`;

const SVG_KNIFE = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M20 23 h15 l5-5 h35 l-10 7 l10 3 h-40 l-5-5 h-10 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

const SVG_GRENADE = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M45 15 h10 v4 h-10 z M42 19 h16 v18 c0 5-3 8-8 8 s-8-3-8-8 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="11" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

const SVG_KEVLAR = `<svg viewBox="0 0 100 50" class="weapon-svg"><path d="M35 10 h30 l8 12 v18 l-23 6 l-23-6 v-18 z M38 20 h24 v4 h-24 z M38 28 h24 v4 h-24 z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

const SVG_KIT = `<svg viewBox="0 0 100 50" class="weapon-svg"><rect x="30" y="12" width="40" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M45 26 h10 M50 21 v10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;

export const WEAPONS = [
  // --- PISTOLS (10) ---
  { id: 'glock', name: 'Glock-18', category: WEAPON_CATEGORIES.PISTOLS, cost: 200, damage: 28, fireRate: 150, accuracy: 0.04, clipSize: 20, maxAmmo: 120, weight: 1.0, svg: SVG_PISTOL },
  { id: 'usp', name: 'USP-S', category: WEAPON_CATEGORIES.PISTOLS, cost: 200, damage: 35, fireRate: 170, accuracy: 0.02, clipSize: 12, maxAmmo: 24, weight: 1.0, svg: SVG_PISTOL },
  { id: 'p2000', name: 'P2000', category: WEAPON_CATEGORIES.PISTOLS, cost: 200, damage: 35, fireRate: 170, accuracy: 0.025, clipSize: 13, maxAmmo: 52, weight: 1.0, svg: SVG_PISTOL },
  { id: 'p250', name: 'P250', category: WEAPON_CATEGORIES.PISTOLS, cost: 300, damage: 38, fireRate: 150, accuracy: 0.035, clipSize: 13, maxAmmo: 26, weight: 1.0, svg: SVG_PISTOL },
  { id: 'fiveseven', name: 'Five-SeveN', category: WEAPON_CATEGORIES.PISTOLS, cost: 500, damage: 32, fireRate: 120, accuracy: 0.03, clipSize: 20, maxAmmo: 100, weight: 1.0, svg: SVG_PISTOL },
  { id: 'tec9', name: 'Tec-9', category: WEAPON_CATEGORIES.PISTOLS, cost: 500, damage: 33, fireRate: 100, accuracy: 0.04, clipSize: 18, maxAmmo: 90, weight: 1.0, svg: SVG_PISTOL },
  { id: 'cz75', name: 'CZ75-Auto', category: WEAPON_CATEGORIES.PISTOLS, cost: 500, damage: 35, fireRate: 100, accuracy: 0.05, clipSize: 12, maxAmmo: 24, weight: 1.0, svg: SVG_PISTOL },
  { id: 'dualies', name: 'Dual Berettas', category: WEAPON_CATEGORIES.PISTOLS, cost: 300, damage: 38, fireRate: 90, accuracy: 0.045, clipSize: 30, maxAmmo: 120, weight: 1.0, svg: SVG_PISTOL },
  { id: 'deagle', name: 'Desert Eagle', category: WEAPON_CATEGORIES.PISTOLS, cost: 700, damage: 53, fireRate: 270, accuracy: 0.015, clipSize: 7, maxAmmo: 35, weight: 0.95, svg: SVG_PISTOL },
  { id: 'r8', name: 'R8 Revolver', category: WEAPON_CATEGORIES.PISTOLS, cost: 600, damage: 86, fireRate: 400, accuracy: 0.01, clipSize: 8, maxAmmo: 8, weight: 0.95, svg: SVG_PISTOL },

  // --- RIFLES (10) ---
  { id: 'ak47', name: 'AK-47', category: WEAPON_CATEGORIES.RIFLES, cost: 2700, damage: 36, fireRate: 100, accuracy: 0.015, clipSize: 30, maxAmmo: 90, weight: 0.88, svg: SVG_RIFLE },
  { id: 'm4a4', name: 'M4A4', category: WEAPON_CATEGORIES.RIFLES, cost: 3100, damage: 33, fireRate: 90, accuracy: 0.012, clipSize: 30, maxAmmo: 90, weight: 0.88, svg: SVG_RIFLE },
  { id: 'm4a1s', name: 'M4A1-S', category: WEAPON_CATEGORIES.RIFLES, cost: 2900, damage: 38, fireRate: 100, accuracy: 0.01, clipSize: 20, maxAmmo: 80, weight: 0.88, svg: SVG_RIFLE },
  { id: 'galil', name: 'Galil AR', category: WEAPON_CATEGORIES.RIFLES, cost: 1800, damage: 30, fireRate: 90, accuracy: 0.02, clipSize: 35, maxAmmo: 90, weight: 0.88, svg: SVG_RIFLE },
  { id: 'famas', name: 'FAMAS', category: WEAPON_CATEGORIES.RIFLES, cost: 2050, damage: 30, fireRate: 90, accuracy: 0.018, clipSize: 25, maxAmmo: 90, weight: 0.88, svg: SVG_RIFLE },
  { id: 'sg553', name: 'SG 553', category: WEAPON_CATEGORIES.RIFLES, cost: 3000, damage: 30, fireRate: 110, accuracy: 0.012, clipSize: 30, maxAmmo: 90, weight: 0.85, svg: SVG_RIFLE },
  { id: 'aug', name: 'AUG', category: WEAPON_CATEGORIES.RIFLES, cost: 3300, damage: 28, fireRate: 100, accuracy: 0.01, clipSize: 30, maxAmmo: 90, weight: 0.85, svg: SVG_RIFLE },
  { id: 'ssg08', name: 'SSG 08 (Scout)', category: WEAPON_CATEGORIES.RIFLES, cost: 1700, damage: 88, fireRate: 1250, accuracy: 0.005, clipSize: 10, maxAmmo: 90, weight: 0.92, svg: SVG_RIFLE },
  { id: 'awp', name: 'AWP', category: WEAPON_CATEGORIES.RIFLES, cost: 4750, damage: 115, fireRate: 1500, accuracy: 0.001, clipSize: 10, maxAmmo: 30, weight: 0.8, svg: SVG_RIFLE },
  { id: 'awm', name: 'AWM', category: WEAPON_CATEGORIES.RIFLES, cost: 4750, damage: 120, fireRate: 1500, accuracy: 0.001, clipSize: 5, maxAmmo: 30, weight: 0.8, svg: SVG_RIFLE },
  { id: 'scar20', name: 'SCAR-20', category: WEAPON_CATEGORIES.RIFLES, cost: 5000, damage: 80, fireRate: 250, accuracy: 0.005, clipSize: 20, maxAmmo: 90, weight: 0.8, svg: SVG_RIFLE },

  // --- SMGs (10) ---
  { id: 'mac10', name: 'MAC-10', category: WEAPON_CATEGORIES.SMGS, cost: 1050, damage: 29, fireRate: 75, accuracy: 0.045, clipSize: 30, maxAmmo: 120, weight: 0.98, svg: SVG_SMG },
  { id: 'mp9', name: 'MP9', category: WEAPON_CATEGORIES.SMGS, cost: 1250, damage: 26, fireRate: 70, accuracy: 0.04, clipSize: 30, maxAmmo: 120, weight: 0.98, svg: SVG_SMG },
  { id: 'mp7', name: 'MP7', category: WEAPON_CATEGORIES.SMGS, cost: 1500, damage: 29, fireRate: 80, accuracy: 0.035, clipSize: 30, maxAmmo: 120, weight: 0.92, svg: SVG_SMG },
  { id: 'mp5', name: 'MP5-SD', category: WEAPON_CATEGORIES.SMGS, cost: 1500, damage: 27, fireRate: 80, accuracy: 0.03, clipSize: 30, maxAmmo: 120, weight: 0.92, svg: SVG_SMG },
  { id: 'ump45', name: 'UMP-45', category: WEAPON_CATEGORIES.SMGS, cost: 1200, damage: 35, fireRate: 105, accuracy: 0.035, clipSize: 25, maxAmmo: 100, weight: 0.92, svg: SVG_SMG },
  { id: 'p90', name: 'P90', category: WEAPON_CATEGORIES.SMGS, cost: 2350, damage: 26, fireRate: 70, accuracy: 0.04, clipSize: 50, maxAmmo: 100, weight: 0.92, svg: SVG_SMG },
  { id: 'bizon', name: 'PP-Bizon', category: WEAPON_CATEGORIES.SMGS, cost: 1400, damage: 27, fireRate: 80, accuracy: 0.045, clipSize: 64, maxAmmo: 120, weight: 0.95, svg: SVG_SMG },
  { id: 'vector', name: 'Vector', category: WEAPON_CATEGORIES.SMGS, cost: 1600, damage: 25, fireRate: 50, accuracy: 0.038, clipSize: 25, maxAmmo: 100, weight: 0.96, svg: SVG_SMG },
  { id: 'uzi', name: 'Uzi', category: WEAPON_CATEGORIES.SMGS, cost: 1100, damage: 24, fireRate: 65, accuracy: 0.05, clipSize: 32, maxAmmo: 128, weight: 0.96, svg: SVG_SMG },
  { id: 'tmp', name: 'TMP', category: WEAPON_CATEGORIES.SMGS, cost: 1150, damage: 23, fireRate: 60, accuracy: 0.04, clipSize: 30, maxAmmo: 120, weight: 0.98, svg: SVG_SMG },

  // --- HEAVY & SHOTGUNS (10) ---
  { id: 'nova', name: 'Nova', category: WEAPON_CATEGORIES.HEAVY, cost: 1050, damage: 80, fireRate: 900, accuracy: 0.08, clipSize: 8, maxAmmo: 32, weight: 0.88, svg: SVG_HEAVY },
  { id: 'xm1014', name: 'XM1014', category: WEAPON_CATEGORIES.HEAVY, cost: 2000, damage: 70, fireRate: 350, accuracy: 0.09, clipSize: 7, maxAmmo: 32, weight: 0.88, svg: SVG_HEAVY },
  { id: 'mag7', name: 'MAG-7', category: WEAPON_CATEGORIES.HEAVY, cost: 1300, damage: 90, fireRate: 850, accuracy: 0.075, clipSize: 5, maxAmmo: 32, weight: 0.88, svg: SVG_HEAVY },
  { id: 'sawedoff', name: 'Sawed-Off', category: WEAPON_CATEGORIES.HEAVY, cost: 1100, damage: 95, fireRate: 900, accuracy: 0.1, clipSize: 7, maxAmmo: 32, weight: 0.88, svg: SVG_HEAVY },
  { id: 'm870', name: 'Remington 870', category: WEAPON_CATEGORIES.HEAVY, cost: 1200, damage: 85, fireRate: 950, accuracy: 0.08, clipSize: 8, maxAmmo: 32, weight: 0.88, svg: SVG_HEAVY },
  { id: 'doublebarrel', name: 'Double Barrel', category: WEAPON_CATEGORIES.HEAVY, cost: 1000, damage: 100, fireRate: 200, accuracy: 0.12, clipSize: 2, maxAmmo: 20, weight: 0.9, svg: SVG_HEAVY },
  { id: 'striker', name: 'Striker-12', category: WEAPON_CATEGORIES.HEAVY, cost: 2200, damage: 65, fireRate: 250, accuracy: 0.095, clipSize: 12, maxAmmo: 36, weight: 0.85, svg: SVG_HEAVY },
  { id: 'negev', name: 'Negev', category: WEAPON_CATEGORIES.HEAVY, cost: 1700, damage: 35, fireRate: 60, accuracy: 0.015, clipSize: 150, maxAmmo: 300, weight: 0.75, svg: SVG_HEAVY },
  { id: 'm249', name: 'M249', category: WEAPON_CATEGORIES.HEAVY, cost: 5200, damage: 32, fireRate: 80, accuracy: 0.025, clipSize: 100, maxAmmo: 200, weight: 0.78, svg: SVG_HEAVY },
  { id: 'minigun', name: 'Minigun', category: WEAPON_CATEGORIES.HEAVY, cost: 8000, damage: 25, fireRate: 30, accuracy: 0.045, clipSize: 200, maxAmmo: 400, weight: 0.65, svg: SVG_HEAVY },

  // --- MELEE / KNIVES (5) ---
  { id: 'knife', name: 'Default Knife', category: WEAPON_CATEGORIES.MELEE, cost: 0, damage: 40, fireRate: 400, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_KNIFE },
  { id: 'karambit', name: 'Karambit', category: WEAPON_CATEGORIES.MELEE, cost: 500, damage: 45, fireRate: 350, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_KNIFE },
  { id: 'butterfly', name: 'Butterfly Knife', category: WEAPON_CATEGORIES.MELEE, cost: 600, damage: 45, fireRate: 350, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_KNIFE },
  { id: 'm9bayonet', name: 'M9 Bayonet', category: WEAPON_CATEGORIES.MELEE, cost: 700, damage: 50, fireRate: 400, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_KNIFE },
  { id: 'huntsman', name: 'Huntsman Knife', category: WEAPON_CATEGORIES.MELEE, cost: 800, damage: 52, fireRate: 450, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_KNIFE },

  // --- GEAR & GRENADES (5) ---
  { id: 'armor', name: 'Kevlar + Helmet', category: WEAPON_CATEGORIES.GEAR, cost: 1000, damage: 0, fireRate: 0, accuracy: 0.0, clipSize: 0, maxAmmo: 0, weight: 1.0, svg: SVG_KEVLAR },
  { id: 'hegrenade', name: 'HE Grenade', category: WEAPON_CATEGORIES.GEAR, cost: 300, damage: 98, fireRate: 1000, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_GRENADE },
  { id: 'flashbang', name: 'Flashbang', category: WEAPON_CATEGORIES.GEAR, cost: 200, damage: 0, fireRate: 1000, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_GRENADE },
  { id: 'smokegrenade', name: 'Smoke Grenade', category: WEAPON_CATEGORIES.GEAR, cost: 300, damage: 0, fireRate: 1000, accuracy: 0.0, clipSize: 1, maxAmmo: 0, weight: 1.0, svg: SVG_GRENADE },
  { id: 'defuse', name: 'Defuse Kit', category: WEAPON_CATEGORIES.GEAR, cost: 400, damage: 0, fireRate: 0, accuracy: 0.0, clipSize: 0, maxAmmo: 0, weight: 1.0, svg: SVG_KIT }
];

// Weapon image URLs (Wikimedia Commons & user-provided AK47 image)
const weaponImages = {
  glock: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Glock17_%281%29.png/320px-Glock17_%281%29.png',
  usp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/H%26K_USP.png/320px-H%26K_USP.png',
  p2000: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/H%26K_USP.png/320px-H%26K_USP.png',
  p250: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/H%26K_USP.png/320px-H%26K_USP.png',
  fiveseven: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Glock17_%281%29.png/320px-Glock17_%281%29.png',
  tec9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Glock17_%281%29.png/320px-Glock17_%281%29.png',
  cz75: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Glock17_%281%29.png/320px-Glock17_%281%29.png',
  dualies: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Glock17_%281%29.png/320px-Glock17_%281%29.png',
  deagle: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Desert_Eagle_in_Silver.png/320px-Desert_Eagle_in_Silver.png',
  r8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Desert_Eagle_in_Silver.png/320px-Desert_Eagle_in_Silver.png',

  ak47: 'https://m.media-amazon.com/images/I/51ChFPeuK4L.jpg',
  m4a4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  m4a1s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  galil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  famas: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  sg553: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  aug: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M4A1_SOPMOD_CQB_transparent.png/320px-M4A1_SOPMOD_CQB_transparent.png',
  ssg08: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Accuracy_International_AW.png/320px-Accuracy_International_AW.png',
  awp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Accuracy_International_AW.png/320px-Accuracy_International_AW.png',
  awm: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Accuracy_International_AW.png/320px-Accuracy_International_AW.png',
  scar20: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Accuracy_International_AW.png/320px-Accuracy_International_AW.png',

  mac10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  mp9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  mp7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  mp5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  ump45: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  p90: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  bizon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  vector: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  uzi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',
  tmp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Heckler_%26_Koch_MP5A3.png/320px-Heckler_%26_Koch_MP5A3.png',

  nova: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  xm1014: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  mag7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  sawedoff: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  m870: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  doublebarrel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  striker: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  negev: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  m249: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',
  minigun: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Remington_870_Tactical.png/320px-Remington_870_Tactical.png',

  knife: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ka-Bar_USMC_Utility_Knife.png/320px-Ka-Bar_USMC_Utility_Knife.png',
  karambit: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ka-Bar_USMC_Utility_Knife.png/320px-Ka-Bar_USMC_Utility_Knife.png',
  butterfly: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ka-Bar_USMC_Utility_Knife.png/320px-Ka-Bar_USMC_Utility_Knife.png',
  m9bayonet: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ka-Bar_USMC_Utility_Knife.png/320px-Ka-Bar_USMC_Utility_Knife.png',
  huntsman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ka-Bar_USMC_Utility_Knife.png/320px-Ka-Bar_USMC_Utility_Knife.png',

  armor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Body_Armor.png/320px-Body_Armor.png',
  hegrenade: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/F1_grenade_with_fuse.png/320px-F1_grenade_with_fuse.png',
  flashbang: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/F1_grenade_with_fuse.png/320px-F1_grenade_with_fuse.png',
  smokegrenade: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/F1_grenade_with_fuse.png/320px-F1_grenade_with_fuse.png',
  defuse: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Defibrillator_HeartSine_Samaritan_PAD_500P.png/320px-Defibrillator_HeartSine_Samaritan_PAD_500P.png'
};

WEAPONS.forEach(w => {
  if (weaponImages[w.id]) {
    w.img = weaponImages[w.id];
  }
});
