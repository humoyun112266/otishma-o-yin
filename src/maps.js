// Procedural Map Configuration for 10 CS2-Inspired Bases
// Ground size is 100x100. Spawn points and walls are placed relative to this.

export const MAPS = [
  {
    name: 'Dust II',
    description: 'An iconic desert arena featuring sandy corridors, double doors, and box stacks.',
    theme: {
      ground: '#d4b373', // sand
      walls: '#c69d56',  // light sandstone
      sky: '#e4d2b2',
      fog: '#d4b373',
      light: '#fff2db',
      ambient: '#80725a'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -40, z: -35, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 35, z: 35 },
      { x: 0, z: 42 },
      { x: 42, z: -40 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      // Outer boundaries
      { x: 0, z: -50, w: 100, h: 12, d: 2, color: '#bca065' },
      { x: 0, z: 50, w: 100, h: 12, d: 2, color: '#bca065' },
      { x: -50, z: 0, w: 2, h: 12, d: 100, color: '#bca065' },
      { x: 50, z: 0, w: 2, h: 12, d: 100, color: '#bca065' },
      // Mid Double Doors / Long corridor walls
      { x: 0, z: 0, w: 40, h: 12, d: 4, color: '#b5975c' },
      { x: -25, z: 15, w: 4, h: 12, d: 30, color: '#b5975c' },
      { x: 25, z: -15, w: 4, h: 12, d: 30, color: '#b5975c' },
      { x: 15, z: 25, w: 30, h: 12, d: 4, color: '#b5975c' }
    ],
    covers: [
      // Crates & Barrels
      { x: -10, z: -20, w: 4, h: 4, d: 4, type: 'crate' },
      { x: -10, z: -16, w: 4, h: 4, d: 4, type: 'crate' },
      { x: -6, z: -20, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 20, z: 20, w: 5, h: 5, d: 5, type: 'crate' },
      { x: 38, z: 38, w: 4, h: 8, d: 4, type: 'pillar' },
      { x: -30, z: 30, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: -32, z: 28, w: 3, h: 3, d: 3, type: 'barrel' }
    ]
  },
  {
    name: 'Mirage',
    description: 'Middle eastern plaza layout with a massive center courtyard and market pillars.',
    theme: {
      ground: '#e2ccad', // cream sand
      walls: '#cca985',  // yellowish plaster
      sky: '#dbeaff',
      fog: '#cca985',
      light: '#ffffff',
      ambient: '#786e63'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -35, z: -40, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 38, z: 38 },
      { x: -10, z: 25 },
      { x: 45, z: -35 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      // Outer boundaries
      { x: 0, z: -50, w: 100, h: 15, d: 2, color: '#bc9c78' },
      { x: 0, z: 50, w: 100, h: 15, d: 2, color: '#bc9c78' },
      { x: -50, z: 0, w: 2, h: 15, d: 100, color: '#bc9c78' },
      { x: 50, z: 0, w: 2, h: 15, d: 100, color: '#bc9c78' },
      // Palace and Middle Courtyard Blocks
      { x: 0, z: 0, w: 30, h: 15, d: 30, color: '#b89470' }, // Palace block
      { x: -30, z: 10, w: 10, h: 15, d: 20, color: '#b89470' },
      { x: 30, z: -10, w: 15, h: 15, d: 20, color: '#b89470' }
    ],
    covers: [
      { x: -15, z: -25, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 20, z: 15, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 20, z: -20, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 35, z: 35, w: 3, h: 12, d: 3, type: 'pillar' },
      { x: 35, z: 25, w: 3, h: 12, d: 3, type: 'pillar' }
    ]
  },
  {
    name: 'Inferno',
    description: 'Italian town with tight, winding stone alleys, tall bell tower elements, and brick walls.',
    theme: {
      ground: '#a29587', // cobblestone grey-brown
      walls: '#b5856b',  // red brick clay
      sky: '#eef2f7',
      fog: '#b5856b',
      light: '#fff8ee',
      ambient: '#6e5d53'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -40, z: -30, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 30, z: 40 },
      { x: -5, z: 15 },
      { x: 40, z: -15 }
    ],
    bombsites: { A: { x: 30, z: 30 }, B: { x: -30, z: 30 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 14, d: 2, color: '#a07158' },
      { x: 0, z: 50, w: 100, h: 14, d: 2, color: '#a07158' },
      { x: -50, z: 0, w: 2, h: 14, d: 100, color: '#a07158' },
      { x: 50, z: 0, w: 2, h: 14, d: 100, color: '#a07158' },
      // Apartments & Banana corridors
      { x: -10, z: -20, w: 20, h: 14, d: 15, color: '#a07158' },
      { x: -35, z: 5, w: 12, h: 14, d: 30, color: '#a07158' },
      { x: 25, z: 15, w: 20, h: 14, d: 20, color: '#a07158' }
    ],
    covers: [
      { x: -20, z: -35, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 5, z: 5, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: 5, z: 8, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: -30, z: 35, w: 4, h: 4, d: 4, type: 'crate' },
      { x: -26, z: 35, w: 4, h: 4, d: 4, type: 'crate' }
    ]
  },
  {
    name: 'Nuke',
    description: 'Industrial nuclear plant. Features steel silos, concrete walkways, and hazard warning aesthetics.',
    theme: {
      ground: '#8b939c', // concrete grey
      walls: '#b5bdc6',  // light metal siding
      sky: '#c6d6e6',
      fog: '#b5bdc6',
      light: '#ffffff',
      ambient: '#5a626a'
    },
    spawn1: { x: -45, z: -45, rotation: 0 },
    spawn2: { x: -45, z: -38, rotation: 0 },
    bots: [
      { x: 45, z: 45 },
      { x: 40, z: 40 },
      { x: 0, z: 35 },
      { x: 42, z: -38 }
    ],
    bombsites: { A: { x: 30, z: 30 }, B: { x: 0, z: 0 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 16, d: 2, color: '#9faab5' },
      { x: 0, z: 50, w: 100, h: 16, d: 2, color: '#9faab5' },
      { x: -50, z: 0, w: 2, h: 16, d: 100, color: '#9faab5' },
      { x: 50, z: 0, w: 2, h: 16, d: 100, color: '#9faab5' },
      // Large Silo block and reactor walls
      { x: 0, z: 15, w: 25, h: 16, d: 25, color: '#909ba8' },
      { x: -25, z: -15, w: 15, h: 16, d: 25, color: '#909ba8' },
      { x: 25, z: -15, w: 15, h: 16, d: 25, color: '#909ba8' }
    ],
    covers: [
      { x: 0, z: -25, w: 8, h: 14, d: 8, type: 'pillar' }, // Nuclear Silo
      { x: -35, z: 25, w: 4, h: 4, d: 4, type: 'crate' },
      { x: -35, z: 29, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 35, z: 15, w: 3, h: 3, d: 3, type: 'barrel' }
    ]
  },
  {
    name: 'Vertigo',
    description: 'High-rise skyscraper construction site. Open edges, steel pillars, and yellow support beams.',
    theme: {
      ground: '#676e77', // dark cement
      walls: '#f5c842',  // construction yellow
      sky: '#d7e2e8',
      fog: '#676e77',
      light: '#ffffff',
      ambient: '#434a51'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -35, z: -35, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 38, z: 35 },
      { x: 5, z: 25 },
      { x: 30, z: -35 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 14, d: 2, color: '#deb22a' },
      { x: 0, z: 50, w: 100, h: 14, d: 2, color: '#deb22a' },
      { x: -50, z: 0, w: 2, h: 14, d: 100, color: '#deb22a' },
      { x: 50, z: 0, w: 2, h: 14, d: 100, color: '#deb22a' },
      // Elevators and scaffold blocks
      { x: -15, z: 0, w: 12, h: 14, d: 40, color: '#c79d1a' },
      { x: 20, z: 5, w: 20, h: 14, d: 25, color: '#c79d1a' }
    ],
    covers: [
      { x: 0, z: -20, w: 3, h: 12, d: 3, type: 'pillar' }, // Steel column
      { x: 0, z: 20, w: 3, h: 12, d: 3, type: 'pillar' },
      { x: -30, z: 15, w: 5, h: 5, d: 5, type: 'crate' },
      { x: 25, z: -25, w: 4, h: 4, d: 4, type: 'crate' }
    ]
  },
  {
    name: 'Ancient',
    description: 'An ancient jungle ruin dominated by moss-covered stone pillars, deep green colors, and ruins.',
    theme: {
      ground: '#3f5643', // moss green
      walls: '#5c6e58',  // ancient green stone
      sky: '#9cbca3',
      fog: '#3f5643',
      light: '#d2ffd7',
      ambient: '#324235'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -40, z: -33, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 33, z: 40 },
      { x: 10, z: 15 },
      { x: 38, z: -38 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 12, d: 2, color: '#4f5d4b' },
      { x: 0, z: 50, w: 100, h: 12, d: 2, color: '#4f5d4b' },
      { x: -50, z: 0, w: 2, h: 12, d: 100, color: '#4f5d4b' },
      { x: 50, z: 0, w: 2, h: 12, d: 100, color: '#4f5d4b' },
      // Stone Temple ruins
      { x: -20, z: -10, w: 15, h: 12, d: 30, color: '#445241' },
      { x: 20, z: 10, w: 15, h: 12, d: 30, color: '#445241' },
      { x: 0, z: 30, w: 25, h: 12, d: 10, color: '#445241' }
    ],
    covers: [
      { x: -35, z: 10, w: 4, h: 10, d: 4, type: 'pillar' },
      { x: 35, z: -10, w: 4, h: 10, d: 4, type: 'pillar' },
      { x: -5, z: -25, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 5, z: -25, w: 4, h: 4, d: 4, type: 'crate' }
    ]
  },
  {
    name: 'Anubis',
    description: 'Egyptian archaeological site featuring water-filled canals, sandstone chambers, and tombs.',
    theme: {
      ground: '#dcc69e', // egyptian sand
      walls: '#c6ad7f',  // rich sandstone
      sky: '#e3f3ff',
      fog: '#dcc69e',
      light: '#fff6e2',
      ambient: '#7d6e55'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -32, z: -40, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 35, z: 35 },
      { x: 0, z: 30 },
      { x: 40, z: -35 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 13, d: 2, color: '#bda475' },
      { x: 0, z: 50, w: 100, h: 13, d: 2, color: '#bda475' },
      { x: -50, z: 0, w: 2, h: 13, d: 100, color: '#bda475' },
      { x: 50, z: 0, w: 2, h: 13, d: 100, color: '#bda475' },
      // Sandstone arches and canal divider walls
      { x: 0, z: -15, w: 40, h: 13, d: 4, color: '#b29a6b' },
      { x: -20, z: 15, w: 4, h: 13, d: 30, color: '#b29a6b' },
      { x: 20, z: 15, w: 4, h: 13, d: 30, color: '#b29a6b' }
    ],
    covers: [
      { x: -10, z: 5, w: 5, h: 5, d: 5, type: 'crate' },
      { x: 10, z: 5, w: 5, h: 5, d: 5, type: 'crate' },
      { x: -30, z: 30, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: 30, z: -30, w: 4, h: 8, d: 4, type: 'pillar' }
    ]
  },
  {
    name: 'Cache',
    description: 'Abandoned Chernobyl warehouse. Rusting containers, concrete slabs, and green vegetation.',
    theme: {
      ground: '#737b75', // mossy concrete
      walls: '#878c89',  // weathered concrete blocks
      sky: '#d7dcd8',
      fog: '#737b75',
      light: '#ffffff',
      ambient: '#4e5450'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -35, z: -40, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 38, z: 38 },
      { x: 0, z: 20 },
      { x: 42, z: -35 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 14, d: 2, color: '#7a7f7c' },
      { x: 0, z: 50, w: 100, h: 14, d: 2, color: '#7a7f7c' },
      { x: -50, z: 0, w: 2, h: 14, d: 100, color: '#7a7f7c' },
      { x: 50, z: 0, w: 2, h: 14, d: 100, color: '#7a7f7c' },
      // Checkers and middle warehouse partitions
      { x: -20, z: -5, w: 10, h: 14, d: 35, color: '#707572' },
      { x: 20, z: 15, w: 10, h: 14, d: 35, color: '#707572' }
    ],
    covers: [
      { x: 0, z: -20, w: 6, h: 6, d: 6, type: 'crate' }, // Main white box
      { x: -32, z: 25, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: -32, z: 28, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: 32, z: -15, w: 4, h: 4, d: 4, type: 'crate' }
    ]
  },
  {
    name: 'Train',
    description: 'Industrial rail yard with long train tracks, train carriages, and metal walkways.',
    theme: {
      ground: '#5c6168', // gravel tracks
      walls: '#70757c',  // metal sheet siding
      sky: '#bec6d0',
      fog: '#5c6168',
      light: '#f0f5ff',
      ambient: '#3a3f45'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -40, z: -35, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 35, z: 35 },
      { x: 0, z: 38 },
      { x: 42, z: -40 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 15, d: 2, color: '#62676e' },
      { x: 0, z: 50, w: 100, h: 15, d: 2, color: '#62676e' },
      { x: -50, z: 0, w: 2, h: 15, d: 100, color: '#62676e' },
      { x: 50, z: 0, w: 2, h: 15, d: 100, color: '#62676e' },
      // Train container rows (these form corridors like real CS Train)
      { x: -20, z: 0, w: 6, h: 8, d: 45, color: '#4a5b6c' }, // Blue train
      { x: 0, z: -10, w: 6, h: 8, d: 45, color: '#6a3b3b' }, // Red train
      { x: 20, z: 10, w: 6, h: 8, d: 45, color: '#3b6a48' }  // Green train
    ],
    covers: [
      { x: -35, z: -25, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 35, z: 25, w: 3, h: 3, d: 3, type: 'barrel' },
      { x: -10, z: 30, w: 4, h: 4, d: 4, type: 'crate' }
    ]
  },
  {
    name: 'Overpass',
    description: 'Underpass of a massive highway bridge. Concrete pillars, graffiti, and park layout.',
    theme: {
      ground: '#7b877a', // grassy park dirt
      walls: '#919692',  // graffiti concrete
      sky: '#d7e8ff',
      fog: '#7b877a',
      light: '#ffffff',
      ambient: '#545c53'
    },
    spawn1: { x: -40, z: -40, rotation: 0 },
    spawn2: { x: -35, z: -40, rotation: 0 },
    bots: [
      { x: 40, z: 40 },
      { x: 38, z: 38 },
      { x: -10, z: 15 },
      { x: 42, z: -35 }
    ],
    bombsites: { A: { x: 35, z: 35 }, B: { x: -35, z: 35 } },
    walls: [
      { x: 0, z: -50, w: 100, h: 15, d: 2, color: '#828783' },
      { x: 0, z: 50, w: 100, h: 15, d: 2, color: '#828783' },
      { x: -50, z: 0, w: 2, h: 15, d: 100, color: '#828783' },
      { x: 50, z: 0, w: 2, h: 15, d: 100, color: '#828783' },
      // Highway pillars and underpass banks
      { x: 0, z: -10, w: 60, h: 15, d: 8, color: '#757a76' }, // Highway bridge deck
      { x: -20, z: 20, w: 8, h: 15, d: 20, color: '#757a76' },
      { x: 25, z: 25, w: 8, h: 15, d: 20, color: '#757a76' }
    ],
    covers: [
      { x: -10, z: -25, w: 4, h: 12, d: 4, type: 'pillar' }, // Big bridge column
      { x: 10, z: -25, w: 4, h: 12, d: 4, type: 'pillar' },
      { x: -35, z: 5, w: 4, h: 4, d: 4, type: 'crate' },
      { x: 0, z: 25, w: 3, h: 3, d: 3, type: 'barrel' }
    ]
  }
];
