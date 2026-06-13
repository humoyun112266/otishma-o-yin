// Core 3D Game Loop and Engine using Three.js
// Handles split-screen viewports, player controllers, physics, weapon feedback, grenades, and Bot AI.

import * as THREE from 'three';
import { WEAPONS } from './weapons.js';
import { playShootSound, playExplosionSound, playFlashbangSound, playReloadSound, playHitmarkerSound } from './audio.js';

function isAutomaticWeapon(weapon) {
  if (!weapon) return false;
  const semiAutoIds = [
    'glock', 'usp', 'p2000', 'p250', 'fiveseven', 'tec9', 'dualies', 'deagle', 'r8',
    'ssg08', 'awp', 'awm',
    'nova', 'mag7', 'sawedoff', 'm870', 'doublebarrel',
    'knife', 'karambit', 'butterfly', 'm9bayonet', 'huntsman',
    'hegrenade', 'flashbang', 'smokegrenade', 'armor', 'defuse'
  ];
  return !semiAutoIds.includes(weapon.id);
}

// Game state variables
let scene, renderer;
let isMouseDown = false;
let colliders = []; // list of { mesh, box }
let colliderMeshes = []; // cached list of meshes for optimized raycasting
let activeMap = null;
let gameMode = 'solo'; // solo, 1v1, coop, online
let isGameRunning = false;

const MAP_SCALE = 1.8; // Map scaling factor to make bases larger

function updateBotBillboard(bot) {
  const canvas = bot.billboardCanvas || document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);

  // Draw Emoji in the center
  ctx.font = '36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(bot.emoji, 64, 34);

  // Draw Health Bar background
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(24, 44, 80, 8);

  // Draw Health Bar foreground
  const healthPct = Math.max(0, bot.health / 100);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(24, 44, 80 * healthPct, 8);

  // Draw border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 44, 80, 8);

  if (!bot.billboardCanvas) {
    bot.billboardCanvas = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    bot.billboardTexture = texture;
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 4.2;
    sprite.scale.set(2.0, 1.0, 1.0);
    sprite.raycast = () => {}; // exclude from raycasting
    bot.group.add(sprite);
    bot.billboardSprite = sprite;
  } else {
    bot.billboardTexture.needsUpdate = true;
  }
}

function updatePlayerBillboard(player) {
  if (!player.model) return;

  const canvas = player.billboardCanvas || document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);

  // Draw Emoji in the center
  ctx.font = '36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(player.emoji, 64, 34);

  // Draw Health Bar background
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(24, 44, 80, 8);

  // Draw Health Bar foreground
  const healthPct = Math.max(0, player.health / 100);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(24, 44, 80 * healthPct, 8);

  // Draw border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 44, 80, 8);

  if (!player.billboardCanvas) {
    player.billboardCanvas = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    player.billboardTexture = texture;
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 4.2;
    sprite.scale.set(2.0, 1.0, 1.0);
    sprite.raycast = () => {}; // exclude from raycasting
    player.model.add(sprite);
    player.billboardSprite = sprite;
  } else {
    player.billboardTexture.needsUpdate = true;
  }
}

function createPlayer3DModel(player, emoji) {
  if (player.model) {
    scene.remove(player.model);
  }

  const model = new THREE.Group();

  // Torso (body)
  const bodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12);
  const color = player.id === 'p1' ? 0x00ff00 : 0x00f0ff;
  const bodyMat = new THREE.MeshStandardMaterial({ color: color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 2.1;
  body.castShadow = true;
  model.add(body);
  model.userData.torso = body;

  // Head sphere representation
  const headGeo = new THREE.SphereGeometry(0.6, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdddd });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.5;
  body.add(head);

  // Gun placeholder box
  const gunGeo = new THREE.BoxGeometry(0.25, 0.25, 1.6);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const gun = new THREE.Mesh(gunGeo, gunMat);
  gun.position.set(0.5, 0.25, 0.8);
  body.add(gun);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.35, 0.5, 0);
  leftLeg.castShadow = true;
  model.add(leftLeg);
  model.userData.leftLeg = leftLeg;

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.35, 0.5, 0);
  rightLeg.castShadow = true;
  model.add(rightLeg);
  model.userData.rightLeg = rightLeg;

  scene.add(model);
  player.model = model;

  // Initialize billboard with health bar
  player.billboardCanvas = null;
  updatePlayerBillboard(player);
}

// WebRTC Net Players
export let isOnlineActive = false;
export let isHostPlayer = false;
let opponent3DModel = null;
let netUpdateTimer = 0;
const NET_UPDATE_INTERVAL = 0.033; // ~30hz updates
let sendNetDataCallback = null;

// Player states
export const players = {
  p1: {
    id: 'p1',
    name: 'Player 1',
    emoji: '🦁',
    health: 100,
    shield: 0,
    cash: 800,
    score: 0,
    kills: 0,
    deaths: 0,
    inventory: ['knife', 'glock'],
    activeWeaponIndex: 1,
    ammo: { glock: 20 },
    position: new THREE.Vector3(),
    rotation: { yaw: 0, pitch: 0 },
    velocity: new THREE.Vector3(),
    camera: null,
    gunMesh: null,
    isReloading: false,
    reloadTimer: 0,
    shootCooldown: 0,
    flashIntensity: 0,
    isDead: false,
    radius: 1.5,
    height: 3.5,
    isCrouching: false
  },
  p2: {
    id: 'p2',
    name: 'Player 2',
    emoji: '🐯',
    health: 100,
    shield: 0,
    cash: 800,
    score: 0,
    kills: 0,
    deaths: 0,
    inventory: ['knife', 'usp'],
    activeWeaponIndex: 1,
    ammo: { usp: 12 },
    position: new THREE.Vector3(),
    rotation: { yaw: 3.14, pitch: 0 },
    velocity: new THREE.Vector3(),
    camera: null,
    gunMesh: null,
    isReloading: false,
    reloadTimer: 0,
    shootCooldown: 0,
    flashIntensity: 0,
    isDead: false,
    radius: 1.5,
    height: 3.5,
    isCrouching: false
  }
};

// Bots database
let bots = [];
let botMeshGroup;
const botRadius = 1.4;
const botHeight = 3.5;

// Grenades array
let activeGrenades = [];
let smokeClouds = [];

// Particle systems for hits and flashes
let particles = [];

// Control states
const keys = {};

// Callback functions for UI integration
let onKillfeedUpdate = null;
let onScoreboardUpdate = null;
let onHUDUpdate = null;
let onRoundEnd = null;

// Initialize WebGL/Three.js context
export function initGame(canvasElement, mapConfig, mode, player1Info, player2Info, callbacks, sendNetDataFn = null) {
  activeMap = mapConfig;
  gameMode = mode;
  isOnlineActive = (mode === 'online');
  sendNetDataCallback = sendNetDataFn;
  isHostPlayer = player1Info.isHost || false;

  onKillfeedUpdate = callbacks.onKillfeedUpdate;
  onScoreboardUpdate = callbacks.onScoreboardUpdate;
  onHUDUpdate = callbacks.onHUDUpdate;
  onRoundEnd = callbacks.onRoundEnd;

  // Setup player detail structures
  players.p1.name = player1Info.name;
  players.p1.emoji = player1Info.emoji;
  players.p1.health = 100;
  players.p1.shield = 0;
  players.p1.cash = 800;
  players.p1.isDead = false;
  players.p1.inventory = ['knife', 'glock'];
  players.p1.activeWeaponIndex = 1;
  players.p1.ammo = { glock: 20 };

  if (gameMode !== 'solo') {
    players.p2.name = player2Info.name;
    players.p2.emoji = player2Info.emoji;
    players.p2.health = 100;
    players.p2.shield = 0;
    players.p2.cash = 800;
    players.p2.isDead = false;
    players.p2.inventory = ['knife', 'usp'];
    players.p2.activeWeaponIndex = 1;
    players.p2.ammo = { usp: 12 };
  } else {
    players.p2.isDead = true;
    players.p2.health = 0;
  }

  // Create Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(activeMap.theme.sky);
  scene.fog = new THREE.FogExp2(activeMap.theme.fog, 0.015);

  // Setup Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Setup Cameras
  players.p1.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
  scene.add(players.p1.camera);

  if (gameMode !== 'solo' && !isOnlineActive) {
    players.p2.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    scene.add(players.p2.camera);
  }

  // Set Spawns
  if (isOnlineActive) {
    if (isHostPlayer) {
      players.p1.position.set(activeMap.spawn1.x * MAP_SCALE, 1.8, activeMap.spawn1.z * MAP_SCALE);
      players.p1.rotation.yaw = activeMap.spawn1.rotation || 0;
      players.p2.position.set(activeMap.spawn2.x * MAP_SCALE, 1.8, activeMap.spawn2.z * MAP_SCALE);
      players.p2.rotation.yaw = activeMap.spawn2.rotation || 3.14;
    } else {
      players.p1.position.set(activeMap.spawn2.x * MAP_SCALE, 1.8, activeMap.spawn2.z * MAP_SCALE);
      players.p1.rotation.yaw = activeMap.spawn2.rotation || 3.14;
      players.p2.position.set(activeMap.spawn1.x * MAP_SCALE, 1.8, activeMap.spawn1.z * MAP_SCALE);
      players.p2.rotation.yaw = activeMap.spawn1.rotation || 0;
    }
    createOpponentModel(player2Info.emoji);
  } else {
    players.p1.position.set(activeMap.spawn1.x * MAP_SCALE, 1.8, activeMap.spawn1.z * MAP_SCALE);
    players.p1.rotation.yaw = activeMap.spawn1.rotation || 0;
    players.p1.rotation.pitch = 0;

    if (gameMode !== 'solo') {
      players.p2.position.set(activeMap.spawn2.x * MAP_SCALE, 1.8, activeMap.spawn2.z * MAP_SCALE);
      players.p2.rotation.yaw = activeMap.spawn2.rotation || 3.14;
      players.p2.rotation.pitch = 0;

      // Create visual models for split screen
      createPlayer3DModel(players.p1, player1Info.emoji);
      createPlayer3DModel(players.p2, player2Info.emoji);
    }
  }

  // Lights
  const ambientLight = new THREE.AmbientLight(activeMap.theme.ambient, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(activeMap.theme.light, 1.2);
  dirLight.position.set(20, 40, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  // Bot mesh group
  botMeshGroup = new THREE.Group();
  scene.add(botMeshGroup);

  // Build Map walls & ground
  buildProceduralMap();

  // Spawn initial bots
  spawnBots();

  // Create Player 3D Guns
  createWeaponMeshes();

  // Setup Keyboard handlers
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Setup Mouse handlers for Player 1
  canvasElement.removeEventListener('click', requestPointerLock);
  canvasElement.addEventListener('click', requestPointerLock);

  document.removeEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  document.removeEventListener('mousemove', onMouseMove);
  document.addEventListener('mousemove', onMouseMove);

  canvasElement.removeEventListener('mousedown', onMouseDown);
  canvasElement.addEventListener('mousedown', onMouseDown);

  window.removeEventListener('mouseup', onMouseUp);
  window.addEventListener('mouseup', onMouseUp);

  isGameRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);

  // Initial updates
  triggerHUDUpdate();
  triggerScoreboardUpdate();
}

function requestPointerLock() {
  if (isGameRunning) {
    document.getElementById('gameCanvas').requestPointerLock();
  }
}

function onPointerLockChange() {
  if (document.pointerLockElement !== document.getElementById('gameCanvas')) {
    isMouseDown = false;
  }
}

function onMouseUp(e) {
  if (e.button === 0) {
    isMouseDown = false;
  }
}

// Generate the themed 3D map environment
function buildProceduralMap() {
  colliders = [];
  colliderMeshes = [];

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(100 * MAP_SCALE, 100 * MAP_SCALE);
  const groundMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(activeMap.theme.ground),
    roughness: 0.9
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add grid or path look
  const gridHelper = new THREE.GridHelper(100 * MAP_SCALE, 20, activeMap.theme.ambient, activeMap.theme.ambient);
  gridHelper.position.y = 0.02;
  scene.add(gridHelper);

  // Walls
  activeMap.walls.forEach(w => {
    const isBoundary = (Math.abs(w.x) === 50 || Math.abs(w.z) === 50);
    
    let wx = w.x * MAP_SCALE;
    let wz = w.z * MAP_SCALE;
    let ww = w.w * (isBoundary ? 1.0 : MAP_SCALE);
    let wd = w.d * (isBoundary ? 1.0 : MAP_SCALE);
    
    if (isBoundary) {
      if (Math.abs(w.x) === 50) {
        ww = w.w; // keep thickness
        wd = w.d * MAP_SCALE; // scale length
      } else {
        ww = w.w * MAP_SCALE; // scale length
        wd = w.d; // keep thickness
      }
    }

    const wallGeo = new THREE.BoxGeometry(ww, w.h, wd);
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(w.color),
      roughness: 0.8
    });
    const mesh = new THREE.Mesh(wallGeo, wallMat);
    mesh.position.set(wx, w.h / 2, wz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Bounding Box collider
    mesh.geometry.computeBoundingBox();
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({ mesh, box });
    colliderMeshes.push(mesh);
  });

  // Covers
  activeMap.covers.forEach(c => {
    let geo, mat;
    let cw = c.w * MAP_SCALE;
    let ch = c.h;
    let cd = c.d * MAP_SCALE;
    let cx = c.x * MAP_SCALE;
    let cz = c.z * MAP_SCALE;

    if (c.type === 'crate') {
      geo = new THREE.BoxGeometry(cw, ch, cd);
      mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 }); // Wooden crate look
    } else if (c.type === 'barrel') {
      geo = new THREE.CylinderGeometry(cw / 2, cw / 2, ch, 12);
      mat = new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.5 }); // Metal barrel look
    } else {
      // pillar
      geo = new THREE.CylinderGeometry(cw / 2, cw / 2, ch, 16);
      mat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.7 }); // Concrete column
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, ch / 2, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    mesh.geometry.computeBoundingBox();
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({ mesh, box });
    colliderMeshes.push(mesh);
  });

  // Generate 50 decorative 3D grass clumps to make bases look greener and more organic
  const numGrassClumps = 60;
  const grassGroup = new THREE.Group();
  scene.add(grassGroup);

  for (let i = 0; i < numGrassClumps; i++) {
    const gx = (Math.random() * 90 - 45) * MAP_SCALE;
    const gz = (Math.random() * 90 - 45) * MAP_SCALE;
    const pos = new THREE.Vector3(gx, 0, gz);

    // Don't spawn grass on top of wall/cover objects
    if (!checkEntityCollision(pos, 2.0)) {
      const clump = new THREE.Group();
      clump.position.set(gx, 0, gz);

      const numBlades = 3 + Math.floor(Math.random() * 3);
      const colors = [0x4c7f0f, 0x3a5f0b, 0x5c8f1f, 0x6ca327];
      const grassMat = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.9
      });

      for (let j = 0; j < numBlades; j++) {
        const h = 0.4 + Math.random() * 0.7;
        const r = 0.08 + Math.random() * 0.12;
        const bladeGeo = new THREE.ConeGeometry(r, h, 4);
        const blade = new THREE.Mesh(bladeGeo, grassMat);
        blade.position.set(
          (Math.random() - 0.5) * 0.4,
          h / 2,
          (Math.random() - 0.5) * 0.4
        );
        blade.rotation.set(
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.3
        );
        blade.castShadow = true;
        clump.add(blade);
      }
      grassGroup.add(clump);
    }
  }

  // Generate 6 extra random crates on the map for richer layout dressing
  const extraCratesCount = 6;
  for (let i = 0; i < extraCratesCount; i++) {
    const cx = (Math.random() * 80 - 40) * MAP_SCALE;
    const cz = (Math.random() * 80 - 40) * MAP_SCALE;
    const pos = new THREE.Vector3(cx, 0, cz);

    const distToSpawn1 = pos.distanceTo(new THREE.Vector3(activeMap.spawn1.x * MAP_SCALE, 0, activeMap.spawn1.z * MAP_SCALE));
    const distToSpawn2 = pos.distanceTo(new THREE.Vector3(activeMap.spawn2.x * MAP_SCALE, 0, activeMap.spawn2.z * MAP_SCALE));

    if (distToSpawn1 > 15 && distToSpawn2 > 15 && !checkEntityCollision(pos, 3.5)) {
      const h = 4.0;
      const w = 4.0;
      const d = 4.0;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, h / 2, cz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      mesh.geometry.computeBoundingBox();
      const box = new THREE.Box3().setFromObject(mesh);
      colliders.push({ mesh, box });
      colliderMeshes.push(mesh);
    }
  }
}

function spawnBots() {
  // Clear old bot meshes
  while (botMeshGroup.children.length > 0) {
    botMeshGroup.remove(botMeshGroup.children[0]);
  }
  bots = [];

  if (gameMode === '1v1' || gameMode === 'online') return; // No bots in 1v1 or online

  const count = gameMode === 'coop' ? 6 : 4;
  const botEmojis = ['🤖', '👹', '👽', '💀', '👾', '🎃'];

  for (let i = 0; i < count; i++) {
    const spawnPos = activeMap.bots[i % activeMap.bots.length];

    const botObj = new THREE.Group();
    botObj.position.set(spawnPos.x * MAP_SCALE + (Math.random() * 4 - 2), 0, spawnPos.z * MAP_SCALE + (Math.random() * 4 - 2));

    // Torso (body)
    const bodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff3333 }); // Red threat color
    const torsoMesh = new THREE.Mesh(bodyGeo, bodyMat);
    torsoMesh.position.y = 2.1;
    torsoMesh.castShadow = true;
    botObj.add(torsoMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdddd });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.5; // relative to torsoMesh (2.1 + 1.5 = 3.6)
    torsoMesh.add(headMesh);

    // Gun representation
    const gunGeo = new THREE.BoxGeometry(0.25, 0.25, 1.6);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const gunMesh = new THREE.Mesh(gunGeo, gunMat);
    gunMesh.position.set(0.5, 0.25, 0.8); // relative to torsoMesh
    torsoMesh.add(gunMesh);

    // Left leg
    const legGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 }); // Dark pants
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.35, 0.5, 0);
    leftLeg.castShadow = true;
    botObj.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.35, 0.5, 0);
    rightLeg.castShadow = true;
    botObj.add(rightLeg);

    botMeshGroup.add(botObj);

    bots.push({
      id: 'bot_' + i,
      name: 'Bot ' + (i + 1),
      emoji: botEmojis[i % botEmojis.length],
      health: 100,
      score: 0,
      kills: 0,
      deaths: 0,
      group: botObj,
      torso: torsoMesh,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      velocity: new THREE.Vector3(),
      shootCooldown: Math.random() * 1000,
      state: 'patrol', // patrol, chase, shoot
      patrolTarget: new THREE.Vector3(),
      targetPlayer: null,
      isDead: false,
      strafeDirection: Math.random() < 0.5 ? 1 : -1,
      strafeTimer: 0,
      isStrafing: false
    });

    updateBotBillboard(bots[bots.length - 1]);
    pickNewPatrolTarget(bots[bots.length - 1]);
  }
}

function pickNewPatrolTarget(bot) {
  bot.patrolTarget.set(
    (Math.random() * 80 - 40) * MAP_SCALE,
    0,
    (Math.random() * 80 - 40) * MAP_SCALE
  );
}

// Generate simple 3D meshes representing weapons and attach them to cameras
function createWeaponMeshes() {
  const configureGunMesh = (player) => {
    if (player.gunMesh) {
      player.camera.remove(player.gunMesh);
    }

    const currentWep = getCurrentWeapon(player);
    const group = new THREE.Group();

    let barrelColor = 0x333333;
    let handguardColor = 0x555555;
    let barrelLength = 1.5;
    let thickness = 0.25;

    // Custom model layouts based on category and weapon id
    if (currentWep.category === 'Pistols') {
      barrelLength = 0.7;
      thickness = 0.16;
      barrelColor = 0x2b2b2b;
      handguardColor = 0x333333;
      if (currentWep.id === 'deagle') {
        barrelLength = 0.9;
        thickness = 0.24;
        barrelColor = 0xc0c0c0; // silver slide
        handguardColor = 0x111111; // black grip
      } else if (currentWep.id === 'usp') {
        barrelLength = 0.6;
        thickness = 0.16;
        barrelColor = 0x222222;
        handguardColor = 0x111111;
      }
    } else if (currentWep.category === 'Rifles') {
      barrelLength = 2.0;
      thickness = 0.25;
      barrelColor = 0x1a1a1a;
      handguardColor = 0x3a4f66;
      if (currentWep.id === 'ak47') {
        handguardColor = 0x8b5a2b; // wood brown
      } else if (currentWep.id === 'm4a4') {
        handguardColor = 0x222222; // matte black
        barrelLength = 1.8;
      } else if (currentWep.id === 'm4a1s') {
        handguardColor = 0x2f3e46; // dark slate
        barrelLength = 1.6;
      } else if (currentWep.id === 'awp' || currentWep.id === 'awm') {
        handguardColor = 0x4f5d4b; // olive green
        barrelLength = 2.5;
        thickness = 0.28;
      } else if (currentWep.id === 'ssg08') {
        handguardColor = 0xc2a679; // desert tan
        barrelLength = 2.2;
        thickness = 0.22;
      } else if (currentWep.id === 'aug') {
        handguardColor = 0x1b4332; // dark green
        barrelLength = 1.5;
        thickness = 0.26;
      } else if (currentWep.id === 'famas') {
        handguardColor = 0x457b9d; // navy grey
        barrelLength = 1.4;
        thickness = 0.24;
      }
    } else if (currentWep.category === 'SMGs') {
      barrelLength = 1.2;
      thickness = 0.2;
      barrelColor = 0x333333;
      handguardColor = 0x555555;
    } else if (currentWep.category === 'Heavy & Shotguns') {
      barrelLength = 1.8;
      thickness = 0.35;
      barrelColor = 0x4a4a4a;
      handguardColor = 0x666666;
    } else if (currentWep.category === 'Melee / Knives') {
      // Knife model
      const bladeGeo = new THREE.BoxGeometry(0.1, 0.4, 1.2);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.6, -0.6, -1.0);
      blade.rotation.x = Math.PI / 6;
      group.add(blade);

      const hiltGeo = new THREE.BoxGeometry(0.15, 0.15, 0.4);
      const hiltMat = new THREE.MeshStandardMaterial({ color: 0xe63946 });
      const hilt = new THREE.Mesh(hiltGeo, hiltMat);
      hilt.position.set(0.6, -0.65, -0.4);
      group.add(hilt);

      player.gunMesh = group;
      player.camera.add(group);
      return;
    } else {
      // Grenades (green egg)
      const eggGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const eggMat = new THREE.MeshStandardMaterial({ color: 0x4f5d4b, roughness: 0.8 });
      const egg = new THREE.Mesh(eggGeo, eggMat);
      egg.position.set(0.6, -0.6, -1.0);
      group.add(egg);

      player.gunMesh = group;
      player.camera.add(group);
      return;
    }

    // Body
    const bodyGeo = new THREE.BoxGeometry(thickness * 1.5, thickness * 1.5, barrelLength * 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: handguardColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0.4, -0.5, -0.6);
    group.add(body);

    // Barrel
    const bGeo = new THREE.CylinderGeometry(thickness / 2, thickness / 2, barrelLength, 8);
    const bMat = new THREE.MeshStandardMaterial({ color: barrelColor, metalness: 0.8, roughness: 0.2 });
    const barrel = new THREE.Mesh(bGeo, bMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.4, -0.45, -0.6 - barrelLength / 2);
    group.add(barrel);

    // Handle
    const hGeo = new THREE.BoxGeometry(thickness * 1.2, thickness * 2.0, thickness * 1.2);
    const hMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const handle = new THREE.Mesh(hGeo, hMat);
    handle.position.set(0.4, -0.85, -0.5);
    handle.rotation.x = -Math.PI / 8;
    group.add(handle);

    // Magazine
    if (currentWep.category !== 'Pistols') {
      const magGeo = new THREE.BoxGeometry(thickness * 0.9, thickness * 3.0, thickness * 1.5);
      const mag = new THREE.Mesh(magGeo, hMat);
      mag.position.set(0.4, -0.9, -0.8);
      mag.rotation.x = Math.PI / 12;
      group.add(mag);
    }

    // Attachment: Silencer
    const hasSilencer = (currentWep.id === 'usp' || currentWep.id === 'm4a1s');
    if (hasSilencer) {
      const silencerLength = currentWep.id === 'usp' ? 0.8 : 1.2;
      const silencerThickness = thickness * 0.6;
      const silGeo = new THREE.CylinderGeometry(silencerThickness, silencerThickness, silencerLength, 8);
      const silMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.3 });
      const silencer = new THREE.Mesh(silGeo, silMat);
      silencer.rotation.x = Math.PI / 2;
      silencer.position.set(0.4, -0.45, -0.6 - barrelLength - silencerLength / 2);
      group.add(silencer);
    }

    // Attachment: Scope
    const hasScope = (currentWep.id === 'awp' || currentWep.id === 'awm' || currentWep.id === 'ssg08' || currentWep.id === 'scar20');
    if (hasScope) {
      const scopeLength = 1.0;
      const scopeGeo = new THREE.CylinderGeometry(thickness * 0.4, thickness * 0.4, scopeLength, 8);
      const scopeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
      const scope = new THREE.Mesh(scopeGeo, scopeMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0.4, -0.45 + thickness * 1.0, -0.6);
      group.add(scope);
    }

    player.gunMesh = group;
    player.camera.add(group);
  };

  configureGunMesh(players.p1);
  if (gameMode !== 'solo') configureGunMesh(players.p2);
}

export function getCurrentWeapon(player) {
  const wepId = player.inventory[player.activeWeaponIndex];
  return WEAPONS.find(w => w.id === wepId);
}

// Keyboard input handlers
function handleKeyDown(e) {
  keys[e.code] = true;
  keys[e.key] = true;
  if (e.key) {
    keys[e.key.toLowerCase()] = true;
    keys[e.key.toUpperCase()] = true;
  }

  // Open Buy Menu shortcuts
  if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
    if (!players.p1.isDead) toggleBuyMenu('p1');
  }
  if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
    if (gameMode !== 'solo' && !players.p2.isDead) toggleBuyMenu('p2');
  }

  // Reload action shortcuts
  if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
    reloadWeapon(players.p1);
  }
  if (e.code === 'KeyO' || e.key === 'o' || e.key === 'O') {
    if (gameMode !== 'solo') reloadWeapon(players.p2);
  }

  // Weapon swap key handlers (1-5 keys)
  if (e.code === 'Digit1' || e.key === '1') swapWeapon(players.p1, 0);
  if (e.code === 'Digit2' || e.key === '2') swapWeapon(players.p1, 1);
  if (e.code === 'Digit3' || e.key === '3') swapWeapon(players.p1, 2);
  if (e.code === 'Digit4' || e.key === '4') swapWeapon(players.p1, 3);
  if (e.code === 'Digit5' || e.key === '5') swapWeapon(players.p1, 4);

  // Player 2 swap keys (6-0 keys)
  if (gameMode !== 'solo') {
    if (e.code === 'Digit6' || e.key === '6') swapWeapon(players.p2, 0);
    if (e.code === 'Digit7' || e.key === '7') swapWeapon(players.p2, 1);
    if (e.code === 'Digit8' || e.key === '8') swapWeapon(players.p2, 2);
    if (e.code === 'Digit9' || e.key === '9') swapWeapon(players.p2, 3);
    if (e.code === 'Digit0' || e.key === '0') swapWeapon(players.p2, 4);
  }
}

function handleKeyUp(e) {
  keys[e.code] = false;
  keys[e.key] = false;
  if (e.key) {
    keys[e.key.toLowerCase()] = false;
    keys[e.key.toUpperCase()] = false;
  }
}

// Mouse inputs (specifically for Player 1)
function onMouseMove(e) {
  if (document.pointerLockElement !== document.getElementById('gameCanvas')) return;
  if (players.p1.isDead) return;

  const sensitivity = 0.002;
  players.p1.rotation.yaw -= e.movementX * sensitivity;
  players.p1.rotation.pitch -= e.movementY * sensitivity;

  // Clamp vertical pitch to look straight down / straight up
  players.p1.rotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, players.p1.rotation.pitch));
}

function onMouseDown(e) {
  if (document.pointerLockElement !== document.getElementById('gameCanvas')) return;
  if (players.p1.isDead) return;

  // Left click to shoot
  if (e.button === 0) {
    isMouseDown = true;
    shootWeapon(players.p1);
  }

  // Right click to throw grenade (if holding grenade slot)
  if (e.button === 2) {
    throwGrenade(players.p1);
  }
}

// Weapon mechanics: Ammo management, recoil, fire rate
function reloadWeapon(player) {
  if (player.isDead || player.isReloading) return;
  const currentWep = getCurrentWeapon(player);
  if (currentWep.clipSize <= 0) return; // No reload on gear / knife

  const currentAmmo = player.ammo[currentWep.id] || 0;
  if (currentAmmo >= currentWep.clipSize) return; // Full

  player.isReloading = true;
  player.reloadTimer = currentWep.id === 'awp' ? 2000 : 1200; // sniper takes longer
  playReloadSound();
}

function swapWeapon(player, slotIndex) {
  if (player.isDead || slotIndex >= player.inventory.length) return;
  player.activeWeaponIndex = slotIndex;
  player.isReloading = false; // Reset reload state on swap
  createWeaponMeshes();
  triggerHUDUpdate();
}

function shootWeapon(player) {
  if (player.isDead || player.isReloading || player.shootCooldown > 0) return;

  const currentWep = getCurrentWeapon(player);
  if (currentWep.id === 'hegrenade' || currentWep.id === 'flashbang' || currentWep.id === 'smokegrenade') {
    throwGrenade(player);
    return;
  }
  if (currentWep.id === 'armor' || currentWep.id === 'defuse') return;

  // Check ammo
  if (currentWep.clipSize > 0) {
    const ammoCount = player.ammo[currentWep.id] || 0;
    if (ammoCount <= 0) {
      // Out of ammo click
      return;
    }
    player.ammo[currentWep.id] = ammoCount - 1;
  }

  player.shootCooldown = currentWep.fireRate;

  // Synthesize sound based on weapon type
  let soundType = 'rifle';
  if (currentWep.category === 'Pistols') soundType = 'pistol';
  else if (currentWep.id === 'awp' || currentWep.id === 'scar20' || currentWep.id === 'ssg08') soundType = 'sniper';
  else if (currentWep.category === 'Heavy & Shotguns' && currentWep.id !== 'negev' && currentWep.id !== 'm249') soundType = 'shotgun';
  else if (currentWep.category === 'Melee / Knives') soundType = 'knife';

  playShootSound(soundType);

  // Recoil visual jump
  if (player.gunMesh) {
    player.gunMesh.position.z += 0.25; // slide kickback
    player.gunMesh.position.y += 0.1;
  }

  // Flash muzzle
  createMuzzleFlash(player);

  // Sync camera orientation in case we are in an event handler and it hasn't synced yet
  player.camera.rotation.order = 'YXZ';
  player.camera.rotation.y = player.rotation.yaw;
  player.camera.rotation.x = player.rotation.pitch;
  player.camera.updateMatrixWorld(true);

  // Force update of the scene matrices to make sure moving objects (bots and opponent)
  // are at their correct positions for the raycast hit detection.
  scene.updateMatrixWorld(true);

  // Bullet hit raycasting
  const origin = player.camera.position.clone();
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(player.camera.quaternion);

  // Add bullet spread based on movement + spread stat
  const velLength = player.velocity.length();
  const baseSpread = currentWep.accuracy;
  const movementSpread = velLength * 0.02;
  const totalSpread = baseSpread + movementSpread;

  if (totalSpread > 0 && currentWep.category !== 'Melee / Knives') {
    dir.x += (Math.random() - 0.5) * totalSpread;
    dir.y += (Math.random() - 0.5) * totalSpread;
    dir.z += (Math.random() - 0.5) * totalSpread;
    dir.normalize();
  }

  const raycaster = new THREE.Raycaster(origin, dir, 0.1, 150);

  // Handle knife close range check
  if (currentWep.category === 'Melee / Knives') {
    raycaster.far = 4.0;
  }

  // Muzzle flash bullet line (Tracer)
  const endPoint = origin.clone().add(dir.clone().multiplyScalar(40));
  let finalHitPoint = endPoint;

  // If online mode and P1 fired, send shoot event to opponent
  if (isOnlineActive && player.id === 'p1' && sendNetDataCallback) {
    sendNetDataCallback({
      type: 'shoot',
      weaponId: currentWep.id,
      origin: origin,
      direction: dir
    });
  }

  // Intersection checking
  // 1. Check walls (optimized using cached array)
  // Exclude billboard sprites from raycasting
  const originalRaycast = THREE.Sprite.prototype.raycast;
  THREE.Sprite.prototype.raycast = () => {};
  const wallIntersections = raycaster.intersectObjects(colliderMeshes);
  THREE.Sprite.prototype.raycast = originalRaycast;

  let closestWallDistance = Infinity;
  if (wallIntersections.length > 0) {
    closestWallDistance = wallIntersections[0].distance;
    finalHitPoint = wallIntersections[0].point;
  }

  // 2. Check Bots (if in Solo/Co-op or coop/online)
  if (gameMode !== '1v1' && gameMode !== 'online') {
    const botIntersects = raycaster.intersectObjects(botMeshGroup.children, true);
    if (botIntersects.length > 0) {
      const closestBotHit = botIntersects[0];
      if (closestBotHit.distance < closestWallDistance) {
        let parent = closestBotHit.object.parent;
        let hitBot = null;
        while (parent && parent !== scene) {
          const found = bots.find(b => b.group === parent);
          if (found) {
            hitBot = found;
            break;
          }
          parent = parent.parent;
        }

        if (hitBot && !hitBot.isDead) {
          closestWallDistance = closestBotHit.distance;
          finalHitPoint = closestBotHit.point;

          // Check for headshot! (Head is SphereGeometry)
          let dmg = currentWep.damage;
          const isHeadshot = closestBotHit.object.geometry && closestBotHit.object.geometry.type === 'SphereGeometry';
          if (isHeadshot) {
            dmg = Math.round(dmg * 2.5); // 2.5x headshot multiplier!
            playHitmarkerSound();
          }

          damageBot(hitBot, dmg, player);
        }
      }
    }
  }

  // 3. Check opposing player (in 1v1, online, or co-op friendly fire)
  const oppPlayer = player.id === 'p1' ? players.p2 : players.p1;
  if ((gameMode === '1v1' || gameMode === 'online' || gameMode === 'coop') && !oppPlayer.isDead) {
    if (oppPlayer.model) {
      const intersect = raycaster.intersectObject(oppPlayer.model, true);
      if (intersect.length > 0) {
        const dist = intersect[0].distance;
        if (dist < closestWallDistance) {
          closestWallDistance = dist;
          finalHitPoint = intersect[0].point;

          // Check for headshot! (Head is SphereGeometry)
          let dmg = currentWep.damage;
          const isHeadshot = intersect[0].object.geometry && intersect[0].object.geometry.type === 'SphereGeometry';
          if (isHeadshot) {
            dmg = Math.round(dmg * 2.5);
            playHitmarkerSound();
          }

          damagePlayer(oppPlayer, dmg, player);
        }
      }
    } else {
      // Fallback to bounding box (if model is not created yet)
      const oppBox = new THREE.Box3(
        new THREE.Vector3(oppPlayer.position.x - oppPlayer.radius, oppPlayer.position.y - 1.8, oppPlayer.position.z - oppPlayer.radius),
        new THREE.Vector3(oppPlayer.position.x + oppPlayer.radius, oppPlayer.position.y + 1.8, oppPlayer.position.z + oppPlayer.radius)
      );

      const hit = raycaster.ray.intersectBox(oppBox, new THREE.Vector3());
      if (hit) {
        const dist = raycaster.ray.origin.distanceTo(hit);
        if (dist < closestWallDistance) {
          closestWallDistance = dist;
          finalHitPoint = hit;

          damagePlayer(oppPlayer, currentWep.damage, player);
        }
      }
    }
  }

  // Draw visual tracer line
  createTracerLine(origin.clone().add(new THREE.Vector3(0.3, -0.4, -0.8).applyQuaternion(player.camera.quaternion)), finalHitPoint);

  // Spark sparks at hitmarker point
  createImpactParticles(finalHitPoint);

  triggerHUDUpdate();
}

function throwGrenade(player) {
  const currentWep = getCurrentWeapon(player);
  if (currentWep.id !== 'hegrenade' && currentWep.id !== 'flashbang' && currentWep.id !== 'smokegrenade') return;

  // Remove 1 grenade from inventory slot
  player.inventory.splice(player.activeWeaponIndex, 1);
  player.activeWeaponIndex = Math.max(0, player.activeWeaponIndex - 1);
  createWeaponMeshes();

  // Sync camera orientation in case we are in an event handler
  player.camera.rotation.order = 'YXZ';
  player.camera.rotation.y = player.rotation.yaw;
  player.camera.rotation.x = player.rotation.pitch;
  player.camera.updateMatrixWorld(true);
  
  // Create grenade physical body
  const geo = new THREE.SphereGeometry(0.25, 8, 8);
  const mat = new THREE.MeshStandardMaterial({ color: currentWep.id === 'flashbang' ? 0xdddddd : 0x4f5d4b });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  // Position at camera front
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.camera.quaternion);
  mesh.position.copy(player.camera.position).add(forward.clone().multiplyScalar(1));
  scene.add(mesh);

  // Add initial velocity physics
  const vel = forward.clone().multiplyScalar(22);
  vel.y += 4; // slight upward arch

  activeGrenades.push({
    mesh,
    velocity: vel,
    type: currentWep.id,
    fuseTime: 2000, // 2 seconds
    owner: player
  });

  triggerHUDUpdate();
}

function damageBot(bot, dmg, attacker) {
  if (bot.isDead) return;
  bot.health -= dmg;
  playHitmarkerSound();

  updateBotBillboard(bot);

  // Draw brief floating text indicator or particle trigger
  if (bot.health <= 0) {
    bot.isDead = true;
    bot.health = 0;
    if (bot.group.parent) {
      bot.group.parent.remove(bot.group);
    } else {
      scene.remove(bot.group);
    }

    // Update attacker scoreboard cash
    attacker.kills += 1;
    attacker.cash = Math.min(16000, attacker.cash + 300); // CS reward
    attacker.score += 100;

    addKillfeed(attacker.emoji + ' ' + attacker.name, bot.emoji + ' ' + bot.name, getCurrentWeapon(attacker).name);
    checkRoundEnd();
  }
}

function damagePlayer(victim, dmg, attacker) {
  if (victim.isDead) return;

  // Kevlar mitigation logic
  const hasKevlar = victim.inventory.includes('armor');
  let finalDmg = dmg;
  if (hasKevlar) {
    finalDmg = Math.round(dmg * 0.65); // 35% shield dampening
  }

  victim.health -= finalDmg;
  playHitmarkerSound();

  updatePlayerBillboard(victim);

  // Flash target screen red if they survived
  victim.flashIntensity = 0.3; // brief punch

  // Send damage data in online mode
  if (isOnlineActive && victim.id === 'p2' && sendNetDataCallback) {
    sendNetDataCallback({
      type: 'damage',
      amount: finalDmg
    });
  }

  if (victim.health <= 0) {
    victim.isDead = true;
    victim.health = 0;
    victim.deaths += 1;
    if (victim.model) {
      victim.model.visible = false;
    }

    if (attacker) {
      attacker.kills += 1;
      attacker.cash = Math.min(16000, attacker.cash + 300);
      attacker.score += 150;
      addKillfeed(attacker.emoji + ' ' + attacker.name, victim.emoji + ' ' + victim.name, getCurrentWeapon(attacker).name);
    } else {
      // Suicide or grenade
      addKillfeed('💀 World', victim.emoji + ' ' + victim.name, 'hazard');
    }

    checkRoundEnd();
  }

  triggerHUDUpdate();
}

// Particle generation helpers (Tracers, Impact debris, Flash triggers)
function createMuzzleFlash(player) {
  const flash = new THREE.PointLight(0xffaa44, 5, 12);
  // Position right in front of camera
  const localBarrelOffset = new THREE.Vector3(0.4, -0.4, -1.8);
  flash.position.copy(player.camera.position).add(localBarrelOffset.applyQuaternion(player.camera.quaternion));
  scene.add(flash);

  setTimeout(() => {
    scene.remove(flash);
  }, 50);
}

function createTracerLine(start, end) {
  const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.8 });
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);

  // Fade out
  let opacity = 0.8;
  const fade = () => {
    opacity -= 0.15;
    if (opacity <= 0) {
      scene.remove(line);
    } else {
      lineMat.opacity = opacity;
      requestAnimationFrame(fade);
    }
  };
  requestAnimationFrame(fade);
}

function createImpactParticles(point) {
  const count = 6;
  const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point);
    scene.add(mesh);

    particles.push({
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 8,
        (Math.random() - 0.5) * 8
      ),
      life: 0.35 // 350ms lifespan
    });
  }
}

// HUD updates and buy verification logic
export function buyWeapon(playerId, weaponId) {
  const player = players[playerId];
  const weapon = WEAPONS.find(w => w.id === weaponId);

  if (!weapon || player.isDead) return false;
  if (player.cash < weapon.cost) return false;

  // Equipment validation
  if (weapon.id === 'armor') {
    if (player.inventory.includes('armor')) return false; // already equipped
    player.inventory.push('armor');
    player.cash -= weapon.cost;
    triggerHUDUpdate();
    return true;
  }

  if (weapon.id === 'defuse') {
    if (player.inventory.includes('defuse')) return false;
    player.inventory.push('defuse');
    player.cash -= weapon.cost;
    triggerHUDUpdate();
    return true;
  }

  // Weapons (pistols, rifles, smg, shotguns) have replacement rules
  // Standard slot structure: [0] Melee, [1] Secondary, [2] Primary, [3] Grenade1, [4] Grenade2
  let targetSlot = 2; // default primary
  if (weapon.category === 'Pistols') {
    targetSlot = 1;
  } else if (weapon.category === 'Melee / Knives') {
    targetSlot = 0;
  } else if (weapon.category === 'Gear & Grenades') {
    // If it's a throwable, find empty slot or push
    player.inventory.push(weapon.id);
    player.ammo[weapon.id] = 1;
    player.cash -= weapon.cost;
    swapWeapon(player, player.inventory.length - 1);
    return true;
  }

  // Update target slot
  player.inventory[targetSlot] = weapon.id;
  // Initialize ammo
  if (weapon.clipSize > 0) {
    player.ammo[weapon.id] = weapon.clipSize;
  }

  player.cash -= weapon.cost;
  swapWeapon(player, targetSlot);
  return true;
}

function triggerHUDUpdate() {
  if (onHUDUpdate) {
    onHUDUpdate();
  }
}

function triggerScoreboardUpdate() {
  if (onScoreboardUpdate) {
    onScoreboardUpdate();
  }
}

function addKillfeed(attacker, victim, weapon) {
  if (onKillfeedUpdate) {
    onKillfeedUpdate(attacker, victim, weapon);
  }
}

// Round state manager: triggers reset, reward, next wave
function checkRoundEnd() {
  // 1v1 mode end check
  if (gameMode === '1v1' || gameMode === 'online') {
    if (players.p1.isDead) {
      endRound(players.p2);
    } else if (players.p2.isDead) {
      endRound(players.p1);
    }
    return;
  }

  // Solo / Co-op wave check
  const activePlayers = [];
  if (!players.p1.isDead) activePlayers.push(players.p1);
  if (gameMode === 'coop' && !players.p2.isDead) activePlayers.push(players.p2);

  if (activePlayers.length === 0) {
    // Both players eliminated -> defeat
    endRound(null);
    return;
  }

  // Check if all bots are eliminated
  const aliveBots = bots.filter(b => !b.isDead);
  if (aliveBots.length === 0) {
    // Players win round
    endRound(activePlayers[0]); // give credit to team representative
  }
}

function endRound(winner) {
  isGameRunning = false;

  // Add round rewards
  if (winner) {
    if (gameMode === '1v1' || gameMode === 'online') {
      winner.score += 500;
      winner.cash = Math.min(16000, winner.cash + 3250);
      addKillfeed('🏆 Round Over', winner.emoji + ' ' + winner.name + ' Won!', 'crown');
    } else {
      // Co-Op win
      players.p1.cash = Math.min(16000, players.p1.cash + 3250);
      if (gameMode === 'coop') players.p2.cash = Math.min(16000, players.p2.cash + 3250);
      addKillfeed('🏆 Round Over', 'Survivors Win!', 'crown');
    }
  } else {
    // Loss reward
    players.p1.cash = Math.min(16000, players.p1.cash + 1400);
    if (gameMode === 'coop') players.p2.cash = Math.min(16000, players.p2.cash + 1400);
    addKillfeed('💀 Round Over', 'Defeated!', 'grave');
  }

  triggerScoreboardUpdate();

  setTimeout(() => {
    // Trigger reset to next round after 3 seconds
    resetRound();
  }, 3000);
}

function resetRound() {
  // Revive and reposition players
  players.p1.health = 100;
  players.p1.isDead = false;
  players.p1.position.set(activeMap.spawn1.x * MAP_SCALE, 1.8, activeMap.spawn1.z * MAP_SCALE);
  players.p1.rotation.yaw = activeMap.spawn1.rotation || 0;
  players.p1.rotation.pitch = 0;
  // Refill ammo for inventory
  players.p1.inventory.forEach(wepId => {
    const wep = WEAPONS.find(w => w.id === wepId);
    if (wep && wep.clipSize > 0) {
      players.p1.ammo[wepId] = wep.clipSize;
    }
  });

  if (gameMode !== 'solo') {
    players.p2.health = 100;
    players.p2.isDead = false;
    players.p2.position.set(activeMap.spawn2.x * MAP_SCALE, 1.8, activeMap.spawn2.z * MAP_SCALE);
    players.p2.rotation.yaw = activeMap.spawn2.rotation || 3.14;
    players.p2.rotation.pitch = 0;

    players.p2.inventory.forEach(wepId => {
      const wep = WEAPONS.find(w => w.id === wepId);
      if (wep && wep.clipSize > 0) {
        players.p2.ammo[wepId] = wep.clipSize;
      }
    });
  }

  // Update visual models & billboards on reset
  if (players.p1.model) {
    updatePlayerBillboard(players.p1);
  }
  if (players.p2.model) {
    updatePlayerBillboard(players.p2);
  }

  // Clear grenades and particle debris
  activeGrenades.forEach(g => scene.remove(g.mesh));
  activeGrenades = [];

  smokeClouds.forEach(s => scene.remove(s));
  smokeClouds = [];

  particles.forEach(p => scene.remove(p.mesh));
  particles = [];

  spawnBots();
  createWeaponMeshes();

  isGameRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);

  triggerHUDUpdate();

  if (isOnlineActive && isHostPlayer && sendNetDataCallback) {
    sendNetDataCallback({ type: 'round_reset' });
  }
}

// Open Buy Menu
let buyMenuOpen = { p1: false, p2: false };
export function toggleBuyMenu(playerKey) {
  buyMenuOpen[playerKey] = !buyMenuOpen[playerKey];
  const domId = playerKey === 'p1' ? 'buy-menu-p1' : 'buy-menu-p2';
  const element = document.getElementById(domId);
  if (element) {
    element.style.display = buyMenuOpen[playerKey] ? 'block' : 'none';
  }

  // Release pointer lock if menu is open
  if (buyMenuOpen.p1 && playerKey === 'p1') {
    document.exitPointerLock();
  }
}

// Game loop, physics updates, bot pathfinders
let lastTime = 0;
function gameLoop(time) {
  if (!isGameRunning) return;

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  // Update Player 1
  updatePlayer(players.p1, dt, time);

  // Update Player 2 (only if NOT online, online player is updated via WebRTC packets)
  if (gameMode !== 'solo' && !isOnlineActive) {
    updatePlayer(players.p2, dt, time);
  }

  // WebRTC Multiplayer Sync broadcast (P1 -> P2)
  if (isOnlineActive && sendNetDataCallback) {
    netUpdateTimer += dt;
    if (netUpdateTimer >= NET_UPDATE_INTERVAL) {
      netUpdateTimer = 0;
      const wep = getCurrentWeapon(players.p1);
      sendNetDataCallback({
        type: 'move',
        position: { x: players.p1.position.x, y: players.p1.position.y, z: players.p1.position.z },
        yaw: players.p1.rotation.yaw,
        pitch: players.p1.rotation.pitch,
        isCrouching: players.p1.isCrouching,
        isDead: players.p1.isDead,
        weaponId: wep ? wep.id : null,
        health: players.p1.health
      });
    }
  }

  // Update AI Bots
  updateBots(dt);

  // Update active Grenade physics
  updateGrenades(dt);

  // Particle updates
  updateParticles(dt);

  // Render viewports
  renderGame();

  requestAnimationFrame(gameLoop);
}

function updatePlayer(player, dt, time) {
  if (player.isDead) return;

  // Handle Weapon Cooldown / Recoil dampening
  if (player.shootCooldown > 0) {
    player.shootCooldown = Math.max(0, player.shootCooldown - dt * 1000);
  }

  // Gun mesh interpolation recoil return
  if (player.gunMesh) {
    player.gunMesh.position.x += (0.4 - player.gunMesh.position.x) * 0.15;
    player.gunMesh.position.y += (-0.5 - player.gunMesh.position.y) * 0.15;
    player.gunMesh.position.z += (-0.6 - player.gunMesh.position.z) * 0.15;
  }

  // Handle reload timers
  if (player.isReloading) {
    player.reloadTimer -= dt * 1000;
    if (player.reloadTimer <= 0) {
      player.isReloading = false;
      const currentWep = getCurrentWeapon(player);
      player.ammo[currentWep.id] = currentWep.clipSize;
      triggerHUDUpdate();
    }
  }

  // Screen flash fade
  if (player.flashIntensity > 0) {
    player.flashIntensity = Math.max(0, player.flashIntensity - dt * 1.5);
  }

  // Look handling for Player 2 (keyboard driven since only 1 pointer lock is active)
  if (player.id === 'p2') {
    const rotSpeed = 2.4 * dt;
    if (keys['ArrowLeft']) player.rotation.yaw += rotSpeed;
    if (keys['ArrowRight']) player.rotation.yaw -= rotSpeed;
    if (keys['ArrowUp']) player.rotation.pitch = Math.min(Math.PI / 2.2, player.rotation.pitch + rotSpeed);
    if (keys['ArrowDown']) player.rotation.pitch = Math.max(-Math.PI / 2.2, player.rotation.pitch - rotSpeed);

    // Player 2 shooting key check (Right Ctrl)
    if (keys['ControlRight']) {
      const currentWep = getCurrentWeapon(player);
      if (isAutomaticWeapon(currentWep)) {
        shootWeapon(player);
      } else {
        if (!player.wasCtrlRightPressed) {
          shootWeapon(player);
          player.wasCtrlRightPressed = true;
        }
      }
    } else {
      player.wasCtrlRightPressed = false;
    }
  }

  // Synchronize Camera direction
  const camera = player.camera;
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.rotation.yaw;
  camera.rotation.x = player.rotation.pitch;

  // Movement vectors
  const moveVector = new THREE.Vector3();

  // Crouch check
  const isCrouchingKey = player.id === 'p1' ? keys['ControlLeft'] : keys['ShiftRight'];
  player.isCrouching = isCrouchingKey;

  // Speed values
  const currentWep = getCurrentWeapon(player);
  let baseSpeed = 16.0 * (currentWep ? currentWep.weight : 1.0);
  if (player.isCrouching) baseSpeed *= 0.45; // 55% slower

  // Map inputs to vectors
  if (player.id === 'p1') {
    const isW = keys['KeyW'] || keys['w'] || keys['W'];
    const isS = keys['KeyS'] || keys['s'] || keys['S'];
    const isA = keys['KeyA'] || keys['a'] || keys['A'];
    const isD = keys['KeyD'] || keys['d'] || keys['D'];
    if (isW) moveVector.z -= 1;
    if (isS) moveVector.z += 1;
    if (isA) moveVector.x -= 1;
    if (isD) moveVector.x += 1;

    // Jump
    const isSpace = keys['Space'] || keys[' '];
    if (isSpace && player.position.y <= 1.81) {
      player.velocity.y = 8.0;
    }

    // Automatic fire checking
    if (isMouseDown) {
      const currentWep = getCurrentWeapon(player);
      if (isAutomaticWeapon(currentWep)) {
        shootWeapon(player);
      }
    }
  } else {
    // Player 2 Keys (IJKL)
    const isI = keys['KeyI'] || keys['i'] || keys['I'];
    const isK = keys['KeyK'] || keys['k'] || keys['K'];
    const isJ = keys['KeyJ'] || keys['j'] || keys['J'];
    const isL = keys['KeyL'] || keys['l'] || keys['L'];
    if (isI) moveVector.z -= 1;
    if (isK) moveVector.z += 1;
    if (isJ) moveVector.x -= 1;
    if (isL) moveVector.x += 1;

    // Jump P2 (Right Shift / Slash)
    const isSlash = keys['Slash'] || keys['/'];
    if (isSlash && player.position.y <= 1.81) {
      player.velocity.y = 8.0;
    }
  }

  moveVector.normalize();
  moveVector.applyEuler(new THREE.Euler(0, player.rotation.yaw, 0));
  moveVector.multiplyScalar(baseSpeed * dt);

  // Gravity
  if (player.position.y > 1.8) {
    player.velocity.y -= 22 * dt; // Gravity acceleration
  } else {
    player.velocity.y = Math.max(0, player.velocity.y);
    player.position.y = 1.8;
  }
  player.position.y += player.velocity.y * dt;

  // Crouch target height interpolation
  const targetCamHeight = player.isCrouching ? 0.9 : 1.8;
  const currentLocalCamHeight = camera.position.y - player.position.y;
  camera.position.y += (player.position.y + targetCamHeight - camera.position.y) * 0.2;

  // Collision checks against walls and covers (Wall Sliding resolver)
  // Check X movement
  const nextX = player.position.clone().add(new THREE.Vector3(moveVector.x, 0, 0));
  if (!checkEntityCollision(nextX, player.radius)) {
    player.position.x = nextX.x;
  }

  // Check Z movement
  const nextZ = player.position.clone().add(new THREE.Vector3(0, 0, moveVector.z));
  if (!checkEntityCollision(nextZ, player.radius)) {
    player.position.z = nextZ.z;
  }

  // Sync camera position
  camera.position.x = player.position.x;
  camera.position.z = player.position.z;

  // Bobbing animation when moving
  if (moveVector.length() > 0 && player.position.y <= 1.85) {
    const bob = Math.sin(time * 0.01) * 0.05;
    camera.position.y += bob;
  }

  // Update 3D model properties if they exist
  if (player.model) {
    const prevPos = player.model.position.clone();
    player.model.position.copy(player.position);
    player.model.position.y = 0;
    player.model.rotation.y = player.rotation.yaw;

    // Crouch scale
    player.model.scale.y = player.isCrouching ? 0.65 : 1.0;
    player.model.userData.torso.position.y = player.isCrouching ? 1.35 : 2.1;

    player.model.visible = !player.isDead;

    // Animate legs when moving
    const distMoved = prevPos.distanceTo(player.model.position);
    const isMoving = distMoved > 0.01;

    const torso = player.model.userData.torso;
    const leftLeg = player.model.userData.leftLeg;
    const rightLeg = player.model.userData.rightLeg;

    if (leftLeg && rightLeg && torso) {
      if (isMoving && !player.isDead) {
        const angle = Math.sin(time * 0.015) * 0.6;
        leftLeg.rotation.x = angle;
        rightLeg.rotation.x = -angle;
        if (!player.isCrouching) {
          torso.position.y = 2.1 + Math.abs(Math.sin(time * 0.03)) * 0.12;
        }
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        if (!player.isCrouching) {
          torso.position.y = 2.1;
        }
      }
    }
  }

  // Save details for bots
  player.velocity.copy(moveVector);
}

function checkEntityCollision(pos, radius) {
  const height = 3.5;
  const buffer = 0.2; // buffer wall distance

  // Player box bounds
  const playerBox = new THREE.Box3(
    new THREE.Vector3(pos.x - radius - buffer, pos.y - 1.8, pos.z - radius - buffer),
    new THREE.Vector3(pos.x + radius + buffer, pos.y + height - 1.8, pos.z + radius + buffer)
  );

  for (let i = 0; i < colliders.length; i++) {
    if (playerBox.intersectsBox(colliders[i].box)) {
      return true;
    }
  }
  return false;
}

function updateBots(dt) {
  if (gameMode === '1v1' || gameMode === 'online') return;

  const time = performance.now() * 0.01;

  bots.forEach(bot => {
    if (bot.isDead) return;

    // AI State machine
    const targets = [];
    if (!players.p1.isDead) targets.push(players.p1);
    if (gameMode === 'coop' && !players.p2.isDead) targets.push(players.p2);

    if (targets.length === 0) {
      bot.state = 'patrol';
    } else {
      // Find closest player
      let closestDist = Infinity;
      let closestPlayer = null;
      targets.forEach(p => {
        const d = bot.group.position.distanceTo(p.position);
        if (d < closestDist) {
          closestDist = d;
          closestPlayer = p;
        }
      });

      bot.targetPlayer = closestPlayer;

      // Raycast line of sight check (optimized to run once every 10 frames per bot)
      if (bot.losCheckTimer === undefined) bot.losCheckTimer = Math.random() * 10;
      bot.losCheckTimer += dt * 60; // frame increment

      let hasLOS = bot.lastLOSState !== undefined ? bot.lastLOSState : false;
      if (bot.losCheckTimer >= 10) {
        bot.losCheckTimer = 0;
        const dirToPlayer = closestPlayer.position.clone().sub(bot.group.position).normalize();
        const ray = new THREE.Raycaster(bot.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), dirToPlayer, 0.1, 70);
        const intersects = ray.intersectObjects(colliderMeshes);
        
        hasLOS = true;
        if (intersects.length > 0 && intersects[0].distance < closestDist) {
          hasLOS = false; // Blocked by wall
        }
        bot.lastLOSState = hasLOS;
      }

      if (hasLOS && closestDist < 45) {
        bot.state = closestDist < 25 ? 'shoot' : 'chase';
      } else {
        bot.state = 'patrol';
      }
    }

    // Process State Actions
    let isMoving = false;

    if (bot.state === 'patrol') {
      const dist = bot.group.position.distanceTo(bot.patrolTarget);
      if (dist < 4.0) {
        pickNewPatrolTarget(bot);
      }
      moveEntityTowards(bot.group, bot.patrolTarget, 8 * dt);
      isMoving = true;
      bot.isStrafing = false;
    } else if (bot.state === 'chase') {
      moveEntityTowards(bot.group, bot.targetPlayer.position, 12 * dt);
      isMoving = true;
      bot.isStrafing = false;
    } else if (bot.state === 'shoot') {
      // Face player
      const lookAtTarget = bot.targetPlayer.position.clone();
      bot.group.lookAt(new THREE.Vector3(lookAtTarget.x, bot.group.position.y, lookAtTarget.z));

      // AI combat movement (strafing & distance adjustment)
      bot.strafeTimer += dt;
      if (bot.strafeTimer > 1.2 + Math.random() * 0.8) {
        bot.strafeTimer = 0;
        bot.strafeDirection = -bot.strafeDirection; // Reverse strafe direction
      }

      // Compute direction and distance to player
      const dirToPlayer = bot.targetPlayer.position.clone().sub(bot.group.position);
      dirToPlayer.y = 0;
      const dist = dirToPlayer.length();
      dirToPlayer.normalize();

      // Strafe vector is perpendicular to dirToPlayer
      const strafeVec = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).multiplyScalar(bot.strafeDirection);

      // Distance control vector
      const moveVec = new THREE.Vector3();
      const idealDist = 18.0; // Ideal combat distance
      if (dist > idealDist + 3.0) {
        // Too far, walk closer
        moveVec.add(dirToPlayer.clone().multiplyScalar(0.5));
      } else if (dist < idealDist - 3.0) {
        // Too close, back away
        moveVec.add(dirToPlayer.clone().multiplyScalar(-0.5));
      }

      // Combine strafe and advance/retreat
      moveVec.add(strafeVec).normalize().multiplyScalar(6 * dt); // Move slightly slower in combat

      // Next position check
      const nextPos = bot.group.position.clone().add(moveVec);
      if (!checkEntityCollision(nextPos, botRadius)) {
        bot.group.position.copy(nextPos);
        isMoving = true;
        bot.isStrafing = true;
      } else {
        isMoving = false;
        bot.isStrafing = false;
        // Flip strafe direction immediately if we hit a wall
        bot.strafeDirection = -bot.strafeDirection;
        bot.strafeTimer = 0;
      }

      // Shoot cooldowns
      bot.shootCooldown -= dt * 1000;
      if (bot.shootCooldown <= 0) {
        bot.shootCooldown = 450 + Math.random() * 400; // randomized shot cadence

        // Fire bullet
        playShootSound('pistol');

        // Check if shot hits target player (incorporate bot accuracy spread)
        const hitRoll = Math.random();
        const distToTgt = bot.group.position.distanceTo(bot.targetPlayer.position);
        const hitProbability = Math.max(0.1, 0.9 - distToTgt * 0.015); // less accurate at range

        if (hitRoll < hitProbability) {
          // Player hit
          damagePlayer(bot.targetPlayer, 15, null);
        }

        // Draw bot bullet tracer
        const startPos = bot.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        const endPos = bot.targetPlayer.position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2 - 0.5,
          (Math.random() - 0.5) * 2
        ));
        createTracerLine(startPos, endPos);
      }
    }

    // Procedural leg/torso animation
    if (bot.leftLeg && bot.rightLeg && bot.torso) {
      if (isMoving) {
        const speedMultiplier = bot.state === 'chase' ? 1.4 : (bot.state === 'shoot' ? 0.7 : 1.0);
        const angle = Math.sin(time * 1.5 * speedMultiplier) * 0.6;
        bot.leftLeg.rotation.x = angle;
        bot.rightLeg.rotation.x = -angle;

        // Bob torso
        bot.torso.position.y = 2.1 + Math.abs(Math.sin(time * 3.0 * speedMultiplier)) * 0.12;
      } else {
        bot.leftLeg.rotation.x = 0;
        bot.rightLeg.rotation.x = 0;
        bot.torso.position.y = 2.1;
      }
    }
  });
}

function moveEntityTowards(group, target, stepSize) {
  const dir = target.clone().sub(group.position);
  dir.y = 0; // lock to horizontal plane
  dir.normalize();

  const nextPos = group.position.clone().add(dir.multiplyScalar(stepSize));

  // Verify wall boundary collisions before walking bot
  if (!checkEntityCollision(nextPos, botRadius)) {
    group.position.copy(nextPos);
    group.lookAt(new THREE.Vector3(target.x, group.position.y, target.z));
  } else {
    // collision: choose new path route point
    if (Math.random() < 0.05) {
      group.position.x += (Math.random() - 0.5) * 2;
      group.position.z += (Math.random() - 0.5) * 2;
    }
  }
}

function updateGrenades(dt) {
  for (let i = activeGrenades.length - 1; i >= 0; i--) {
    const g = activeGrenades[i];

    // Simple physical bounce logic
    g.velocity.y -= 9.8 * dt; // Gravity
    g.mesh.position.add(g.velocity.clone().multiplyScalar(dt));

    // Collision check
    const height = 0.5;
    const box = new THREE.Box3(
      new THREE.Vector3(g.mesh.position.x - 0.3, g.mesh.position.y - 0.3, g.mesh.position.z - 0.3),
      new THREE.Vector3(g.mesh.position.x + 0.3, g.mesh.position.y + 0.3, g.mesh.position.z + 0.3)
    );

    let hit = false;
    for (let c of colliders) {
      if (box.intersectsBox(c.box)) {
        hit = true;
        break;
      }
    }

    if (g.mesh.position.y <= 0.25 || hit) {
      // Bounce
      g.velocity.y = -g.velocity.y * 0.4;
      g.velocity.x *= 0.6;
      g.velocity.z *= 0.6;
      if (g.mesh.position.y < 0.25) g.mesh.position.y = 0.25;
    }

    g.fuseTime -= dt * 1000;
    if (g.fuseTime <= 0) {
      // Explode!
      explodeGrenade(g);
      scene.remove(g.mesh);
      activeGrenades.splice(i, 1);
    }
  }

  // Update smoke cloud sizes
  for (let i = smokeClouds.length - 1; i >= 0; i--) {
    const s = smokeClouds[i];
    s.life -= dt;
    if (s.life <= 0) {
      scene.remove(s.mesh);
      smokeClouds.splice(i, 1);
    } else {
      // grow or shrink smoke sphere
      if (s.life > 6.0) {
        s.mesh.scale.addScalar(dt * 3.5);
      } else if (s.life < 2.0) {
        s.mesh.scale.subScalar(dt * 3.5);
        s.mesh.material.opacity = Math.max(0, s.life / 2.0 * 0.85);
      }
    }
  }
}

function explodeGrenade(grenade) {
  const gPos = grenade.mesh.position;

  if (grenade.type === 'hegrenade') {
    playExplosionSound();
    createImpactParticles(gPos);

    // Damage check within range 15 units
    const radius = 15;
    // Check Bots
    bots.forEach(bot => {
      if (bot.isDead) return;
      const d = bot.group.position.distanceTo(gPos);
      if (d < radius) {
        const falloff = 1.0 - d / radius;
        damageBot(bot, Math.round(95 * falloff), grenade.owner);
      }
    });

    // Check Players
    Object.values(players).forEach(p => {
      if (p.isDead) return;
      const d = p.position.distanceTo(gPos);
      if (d < radius) {
        const falloff = 1.0 - d / radius;
        damagePlayer(p, Math.round(95 * falloff), grenade.owner);
      }
    });

  } else if (grenade.type === 'flashbang') {
    playFlashbangSound();

    // Check if players have LOS (pointing direction vs grenade direction)
    Object.values(players).forEach(p => {
      if (p.isDead) return;
      const d = p.position.distanceTo(gPos);
      if (d < 45) {
        // Line of sight verification
        const dir = gPos.clone().sub(p.camera.position).normalize();
        const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(p.camera.quaternion);
        const dot = dir.dot(lookDir); // dot product

        if (dot > 0.1) {
          // Facing grenade -> Full flash!
          p.flashIntensity = 1.0;
        } else {
          // Back turned -> Partial flash
          p.flashIntensity = 0.25;
        }
      }
    });

  } else if (grenade.type === 'smokegrenade') {
    // Generate a smoke particle sphere
    playExplosionSound();

    const smokeGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x4f4f4f,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const sMesh = new THREE.Mesh(smokeGeo, smokeMat);
    sMesh.position.copy(gPos);
    sMesh.scale.set(0.1, 0.1, 0.1);
    scene.add(sMesh);

    smokeClouds.push({
      mesh: sMesh,
      life: 8.0 // lasts 8 seconds
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    } else {
      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
      p.velocity.y -= 9.8 * dt; // gravity falling
    }
  }
}

// Split viewport rendering logic
function renderGame() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setScissorTest(true);

  if (gameMode === 'solo' || isOnlineActive) {
    // Full screen rendering Player 1
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    players.p1.camera.aspect = w / h;
    players.p1.camera.updateProjectionMatrix();

    // Hide P1 model to not block own camera, show P2 opponent model if it exists
    if (players.p1.model) players.p1.model.visible = false;
    if (players.p2.model) players.p2.model.visible = true;

    renderer.render(scene, players.p1.camera);
  } else {
    // Split screen viewports: P1 Left, P2 Right
    const wHalf = w / 2;

    // Player 1 Left Viewport
    renderer.setViewport(0, 0, wHalf, h);
    renderer.setScissor(0, 0, wHalf, h);
    players.p1.camera.aspect = wHalf / h;
    players.p1.camera.updateProjectionMatrix();

    // Toggle gun mesh visibility so P1 only sees P1 gun, not P2
    if (players.p2.gunMesh) players.p2.gunMesh.visible = false;
    if (players.p1.gunMesh) players.p1.gunMesh.visible = true;

    // Toggle player model visibility so they don't see themselves
    if (players.p1.model) players.p1.model.visible = false;
    if (players.p2.model) players.p2.model.visible = true;

    renderer.render(scene, players.p1.camera);

    // Player 2 Right Viewport
    renderer.setViewport(wHalf, 0, wHalf, h);
    renderer.setScissor(wHalf, 0, wHalf, h);
    players.p2.camera.aspect = wHalf / h;
    players.p2.camera.updateProjectionMatrix();

    if (players.p1.gunMesh) players.p1.gunMesh.visible = false;
    if (players.p2.gunMesh) players.p2.gunMesh.visible = true;

    if (players.p1.model) players.p1.model.visible = true;
    if (players.p2.model) players.p2.model.visible = false;

    renderer.render(scene, players.p2.camera);
  }
  renderer.setScissorTest(false);
}

// Clear game states on exit
export function exitGame() {
  isGameRunning = false;
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('mouseup', onMouseUp);

  // Clear scene elements
  while (scene && scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  scene = null;
  renderer = null;
  opponent3DModel = null;

  players.p1.model = null;
  players.p2.model = null;
  players.p1.billboardCanvas = null;
  players.p2.billboardCanvas = null;
}

export function createOpponentModel(emoji) {
  if (opponent3DModel) {
    scene.remove(opponent3DModel);
  }

  opponent3DModel = new THREE.Group();
  players.p2.model = opponent3DModel;

  // Torso (body)
  const bodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff }); // Neon cyan enemy
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 2.1;
  body.castShadow = true;
  opponent3DModel.add(body);
  opponent3DModel.userData.torso = body;

  // Head sphere representation
  const headGeo = new THREE.SphereGeometry(0.6, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdddd });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.5;
  body.add(head);

  // Gun placeholder box
  const gunGeo = new THREE.BoxGeometry(0.25, 0.25, 1.6);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const gun = new THREE.Mesh(gunGeo, gunMat);
  gun.position.set(0.5, 0.25, 0.8);
  body.add(gun);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.35, 0.5, 0);
  leftLeg.castShadow = true;
  opponent3DModel.add(leftLeg);
  opponent3DModel.userData.leftLeg = leftLeg;

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.35, 0.5, 0);
  rightLeg.castShadow = true;
  opponent3DModel.add(rightLeg);
  opponent3DModel.userData.rightLeg = rightLeg;

  scene.add(opponent3DModel);

  // Initialize billboard with health bar
  players.p2.billboardCanvas = null;
  updatePlayerBillboard(players.p2);
}

export function receiveNetData(data) {
  if (!isGameRunning) return;

  if (data.type === 'move') {
    const prevPos = players.p2.position.clone();
    players.p2.position.set(data.position.x, data.position.y, data.position.z);
    players.p2.rotation.yaw = data.yaw;
    players.p2.rotation.pitch = data.pitch;
    players.p2.isCrouching = data.isCrouching;
    players.p2.isDead = data.isDead;
    players.p2.health = data.health;

    if (data.weaponId) {
      players.p2.inventory = [data.weaponId];
      players.p2.activeWeaponIndex = 0;
    }

    // Update 3D model properties
    if (opponent3DModel) {
      opponent3DModel.position.copy(players.p2.position);
      opponent3DModel.rotation.y = data.yaw;
      
      // Crouch scale
      opponent3DModel.scale.y = data.isCrouching ? 0.65 : 1.0;
      opponent3DModel.position.y = data.isCrouching ? -0.4 : 0.0;
      
      opponent3DModel.visible = !data.isDead;

      // Animate legs when opponent moves
      const distMoved = prevPos.distanceTo(players.p2.position);
      const isMoving = distMoved > 0.01;
      
      const torso = opponent3DModel.userData.torso;
      const leftLeg = opponent3DModel.userData.leftLeg;
      const rightLeg = opponent3DModel.userData.rightLeg;

      if (leftLeg && rightLeg && torso) {
        if (isMoving && !data.isDead) {
          const time = performance.now() * 0.01;
          const angle = Math.sin(time * 1.5) * 0.6;
          leftLeg.rotation.x = angle;
          rightLeg.rotation.x = -angle;
          torso.position.y = 2.1 + Math.abs(Math.sin(time * 3.0)) * 0.12;
        } else {
          leftLeg.rotation.x = 0;
          rightLeg.rotation.x = 0;
          torso.position.y = 2.1;
        }
      }

      // Update opponent billboard
      updatePlayerBillboard(players.p2);
    }

    triggerHUDUpdate();
  } else if (data.type === 'shoot') {
    const oppWep = WEAPONS.find(w => w.id === data.weaponId);
    let soundType = 'rifle';
    if (oppWep) {
      if (oppWep.category === 'Pistols') soundType = 'pistol';
      else if (oppWep.id === 'awp' || oppWep.id === 'scar20' || oppWep.id === 'ssg08') soundType = 'sniper';
      else if (oppWep.category === 'Heavy & Shotguns' && oppWep.id !== 'negev' && oppWep.id !== 'm249') soundType = 'shotgun';
      else if (oppWep.category === 'Melee / Knives') soundType = 'knife';
    }
    playShootSound(soundType);
    
    // Create muzzle flash and tracer from opponent position
    const start = new THREE.Vector3().copy(players.p2.position).add(new THREE.Vector3(0.5, 1.2, 0.6).applyEuler(new THREE.Euler(0, players.p2.rotation.yaw, 0)));
    const originPoint = new THREE.Vector3(data.origin.x, data.origin.y, data.origin.z);
    const dirPoint = new THREE.Vector3(data.direction.x, data.direction.y, data.direction.z);
    const end = originPoint.clone().add(dirPoint.clone().multiplyScalar(40));
    
    createTracerLine(start, end);
    createImpactParticles(end);
  } else if (data.type === 'damage') {
    // Opponent hit us!
    damagePlayer(players.p1, data.amount, players.p2);
  } else if (data.type === 'round_reset') {
    resetRound();
  } else if (data.type === 'init_profile') {
    players.p2.name = data.name;
    players.p2.emoji = data.emoji;
    
    // Update opponent model visual emoji billboard if it exists
    if (players.p2.model) {
      scene.remove(players.p2.model);
      createOpponentModel(data.emoji);
    }
    
    // Update HUD display name & emoji
    const nameEl = document.getElementById('p2-hud-name');
    if (nameEl) nameEl.innerText = data.name;
    const emojiEl = document.getElementById('p2-hud-emoji');
    if (emojiEl) emojiEl.innerText = data.emoji;
    
    triggerHUDUpdate();
    triggerScoreboardUpdate();
  }
}
