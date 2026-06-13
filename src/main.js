// Main entry point for CS2 3D Game
// Connects HTML controls, Leaderboard records, HUD minimap drawing, and Buy Menus.
window.gameInitialized = true;

import { MAPS } from './maps.js';
import { WEAPONS, WEAPON_CATEGORIES } from './weapons.js';
import { initGame, exitGame, buyWeapon, players, getCurrentWeapon, toggleBuyMenu, receiveNetData } from './game.js';
import { playBuySound, playRoundWinSound } from './audio.js';
import { initNetwork, connectToPeer, sendNetData, myPeerId, isHost } from './network.js';

// Local storage leaderboard helper keys
const LEADERBOARD_KEY = 'cs3d_leaderboards';

// UI selections
let selectedMapIndex = 0;
let selectedMode = 'solo'; // solo, 1v1, coop
let p1Registered = false;
let p2Registered = false;

let p1Emoji = '🦁';
let p2Emoji = '🐯';

let p1Score = 0;
let p2Score = 0;
let botScore = 0;

function init() {
  loadLeaderboard();
  renderMapOptions();
  setupLobbyEvents();
  setupScoreboardHandler();
  setupNetworkEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Load and render registration Leaderboard
function loadLeaderboard() {
  const records = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
  const tbody = document.getElementById('leaderboard-tbody');
  tbody.innerHTML = '';

  // Sort by score descending
  records.sort((a, b) => b.score - a.score);

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#8a90a0;">Hozircha hech kim ro'yxatdan o'tmagan</td></tr>`;
    return;
  }

  records.slice(0, 5).forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${record.emoji} ${record.name}</strong></td>
      <td>${record.kills}</td>
      <td>${record.deaths}</td>
      <td><span style="color:#00f0ff; font-weight:700;">${record.score}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function saveToLeaderboard(name, emoji, kills = 0, deaths = 0, score = 100) {
  const records = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
  
  // Check if player already exists
  const existing = records.find(r => r.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.kills += kills;
    existing.deaths += deaths;
    existing.score = Math.max(0, existing.score + score);
  } else {
    records.push({ name, emoji, kills, deaths, score });
  }

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(records));
  loadLeaderboard();
}

// Render 10 maps in the selection grid
function renderMapOptions() {
  const container = document.getElementById('bases-list');
  container.innerHTML = '';

  MAPS.forEach((map, idx) => {
    const card = document.createElement('div');
    card.className = `base-card ${idx === selectedMapIndex ? 'active' : ''}`;
    card.innerHTML = `
      <div class="base-name">${map.name}</div>
      <div class="base-desc">${map.description}</div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.base-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedMapIndex = idx;
    });

    container.appendChild(card);
  });
}

// Setup Event listeners for lobby screens
function setupLobbyEvents() {
  // P1 Emoji selector
  document.querySelectorAll('#p1-emoji-selector .emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#p1-emoji-selector .emoji-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      p1Emoji = btn.dataset.emoji;
    });
  });

  // Player 1 Register click
  const p1RegBtn = document.getElementById('p1-register-btn');
  p1RegBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('p1-name-input');
    const name = nameInput.value.trim();
    if (!name) {
      alert("Iltimos, ismingizni kiriting!");
      return;
    }

    saveToLeaderboard(name, p1Emoji, 0, 0, 100);
    p1Registered = true;

    // Visual feedback: disable registration form
    document.getElementById('p1-registration').style.opacity = '0.75';
    document.getElementById('p1-registration').style.pointerEvents = 'none';
    p1RegBtn.innerText = '✔️ Ro\'yxatdan o\'tildi';

    // Unlock Online Section
    document.getElementById('online-lobby-section').style.opacity = '1';
    document.getElementById('online-lobby-section').style.pointerEvents = 'auto';

    checkReadyToPlay();
  });

  // (Removed local split-screen setup)

  // Mode Selection toggles
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;

      const onlineSection = document.getElementById('online-lobby-section');

      // Adjust display and opacity
      if (selectedMode === 'solo') {
        onlineSection.style.display = 'none';
      } else if (selectedMode === 'online') {
        onlineSection.style.display = 'block';
        if (p1Registered) {
          onlineSection.style.opacity = '1';
          onlineSection.style.pointerEvents = 'auto';
        } else {
          onlineSection.style.opacity = '0.5';
          onlineSection.style.pointerEvents = 'none';
        }
      }

      checkReadyToPlay();
    });
  });

  // Clear leaderboard button
  document.getElementById('clear-leaderboard-btn').addEventListener('click', () => {
    if (confirm("Haqiqatan ham peshqadamlar jadvalini tozalamoqchimisiz?")) {
      localStorage.removeItem(LEADERBOARD_KEY);
      loadLeaderboard();
    }
  });

  // Start Game Button click handler
  const startBtn = document.getElementById('start-game-btn');
  startBtn.addEventListener('click', () => {
    launchActiveGame();
  });
}

function checkReadyToPlay() {
  const startBtn = document.getElementById('start-game-btn');
  startBtn.disabled = !p1Registered;
}

// Launches Three.js viewport and sets up DOM listeners
function launchActiveGame() {
  const lobby = document.getElementById('lobby-container');
  const game = document.getElementById('game-container');
  const canvas = document.getElementById('gameCanvas');

  // Hide lobby, show viewport
  lobby.style.display = 'none';
  game.style.display = 'block';

  // Toggle HUD viewport elements based on multiplayer state
  const hudLayout = document.getElementById('game-hud');
  const hudP2 = document.getElementById('hud-p2');

  if (selectedMode === 'solo' || selectedMode === 'online') {
    hudLayout.classList.remove('split-hud');
    hudP2.style.display = 'none';
  } else {
    hudLayout.classList.add('split-hud');
    hudP2.style.display = 'block';
  }

  // Set Profile info in HUD
  document.getElementById('p1-hud-emoji').innerText = p1Emoji;
  document.getElementById('p1-hud-name').innerText = document.getElementById('p1-name-input').value.trim();
  
  if (selectedMode !== 'solo') {
    document.getElementById('p2-hud-emoji').innerText = p2Emoji;
    document.getElementById('p2-hud-name').innerText = selectedMode === 'online' ? 'Opponent' : document.getElementById('p2-name-input').value.trim();
  }

  // Populate dynamic Buy menu structures
  populateBuyMenus();

  // Initialize Three.js Loop
  const mapConfig = MAPS[selectedMapIndex];
  const p1Name = document.getElementById('p1-name-input').value.trim();
  const p2Name = selectedMode === 'online' ? 'Opponent' : document.getElementById('p2-name-input').value.trim();

  // Dynamic audio activation warning
  playBuySound(); // triggers web audio initiation

  initGame(canvas, mapConfig, selectedMode, 
    { name: p1Name, emoji: p1Emoji, isHost: isHost },
    { name: p2Name, emoji: p2Emoji },
    {
      onKillfeedUpdate: addKillfeedItem,
      onScoreboardUpdate: refreshScoreboard,
      onHUDUpdate: updateGameHUD,
      onRoundEnd: handleRoundEnding
    },
    selectedMode === 'online' ? sendNetData : null
  );
}

// Setup P2P Network Handlers and Events
function setupNetworkEvents() {
  if (typeof Peer === 'undefined') {
    return;
  }

  const myIdInput = document.getElementById('p2p-my-id-input');
  const targetIdInput = document.getElementById('p2p-target-id');
  const copyBtn = document.getElementById('p2p-copy-btn');
  const connectBtn = document.getElementById('p2p-connect-btn');
  const statusDiv = document.getElementById('p2p-status');

  initNetwork({
    onIdReady: (id) => {
      myIdInput.value = id;
    },
    onConnect: () => {
      statusDiv.innerHTML = `<span style="color:#00ff00; font-weight:bold;">✔️ Ulanish o'rnatildi! O'yin boshlanmoqda...</span>`;
      
      setTimeout(() => {
        sendNetData({
          type: 'init_profile',
          name: document.getElementById('p1-name-input').value.trim(),
          emoji: p1Emoji,
          isHost: isHost
        });
        launchActiveGame();
      }, 1000);
    },
    onData: (data) => {
      receiveNetData(data);
    }
  });

  copyBtn.addEventListener('click', () => {
    if (myIdInput.value && myIdInput.value !== 'Yuklanmoqda...') {
      navigator.clipboard.writeText(myIdInput.value);
      copyBtn.innerText = 'Nusxalandi!';
      setTimeout(() => { copyBtn.innerText = 'Nusxa'; }, 1500);
    }
  });

  connectBtn.addEventListener('click', () => {
    const targetId = targetIdInput.value.trim();
    if (!targetId) {
      alert("Iltimos, do'stingizning xona kodini kiriting!");
      return;
    }
    statusDiv.innerHTML = `<span style="color:#00f0ff;">Ulanishga urinilmoqda...</span>`;
    connectToPeer(targetId);
  });
}

// Resize listener
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  const canvas = document.getElementById('gameCanvas');
  const game = document.getElementById('game-container');
  canvas.width = game.clientWidth;
  canvas.height = game.clientHeight;
}

// Populate the Buy menus (Player 1 and Player 2) with 50 items
function populateBuyMenus() {
  const generateCategories = (playerKey) => {
    const categoriesContainer = document.getElementById(`${playerKey}-buy-categories`);
    categoriesContainer.innerHTML = '';

    // Group weapons by categories
    Object.values(WEAPON_CATEGORIES).forEach(category => {
      const sect = document.createElement('div');
      sect.className = 'buy-category-section';

      const title = document.createElement('div');
      title.className = 'buy-category-title';
      title.innerText = category;
      sect.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'buy-items-grid';

      // Find items matching this category
      const items = WEAPONS.filter(w => w.category === category);
      items.forEach(w => {
        const card = document.createElement('div');
        card.className = 'buy-card';
        card.dataset.wepId = w.id;

        card.innerHTML = `
          ${w.img ? `<img src="${w.img}" class="weapon-img" alt="${w.name}" />` : w.svg}
          <div class="buy-wep-name">${w.name}</div>
          <div class="buy-wep-cost">$${w.cost}</div>
          <div class="buy-wep-stats">Dmg: ${w.damage} | Clip: ${w.clipSize}</div>
        `;

        // Click buy callback
        card.addEventListener('click', () => {
          const success = buyWeapon(playerKey, w.id);
          if (success) {
            playBuySound();
            // Close menu
            toggleBuyMenu(playerKey);
            updateGameHUD();
          } else {
            // Insufficient funds alert look
            card.style.borderColor = '#ff4444';
            setTimeout(() => { card.style.borderColor = 'rgba(255,255,255,0.07)'; }, 300);
          }
        });

        grid.appendChild(card);
      });

      sect.appendChild(grid);
      categoriesContainer.appendChild(sect);
    });
  };

  generateCategories('p1');
  if (selectedMode !== 'solo') {
    generateCategories('p2');
  }
}



// Setup Scoreboard handlers (Tab-key)
function setupScoreboardHandler() {
  const scoreboard = document.getElementById('scoreboard-overlay');
  
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
      e.preventDefault();
      scoreboard.style.display = 'block';
      refreshScoreboard();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Tab') {
      scoreboard.style.display = 'none';
    }
  });
}

function refreshScoreboard() {
  const tbody = document.getElementById('scoreboard-tbody');
  tbody.innerHTML = '';

  // Gather players currently in play
  const list = [
    { name: players.p1.name, emoji: players.p1.emoji, kills: players.p1.kills, deaths: players.p1.deaths, score: players.p1.score, type: 'p1' }
  ];

  if (selectedMode !== 'solo') {
    list.push({ name: players.p2.name, emoji: players.p2.emoji, kills: players.p2.kills, deaths: players.p2.deaths, score: players.p2.score, type: 'p2' });
  }

  // Sort by score
  list.sort((a, b) => b.score - a.score);

  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = p.type === 'p1' ? 'highlight-p1' : 'highlight-p2';
    tr.innerHTML = `
      <td><strong>${p.emoji} ${p.name}</strong></td>
      <td>${p.kills}</td>
      <td>${p.deaths}</td>
      <td><span style="color:#00f0ff; font-weight:700;">${p.score}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// HUD Rendering: Health details, ammo counts, canvas radar updates
function updateGameHUD() {
  // Update Player 1
  document.getElementById('p1-hud-health').innerText = Math.round(players.p1.health);
  document.getElementById('p1-hud-shield').innerText = players.p1.inventory.includes('armor') ? 100 : 0;
  document.getElementById('p1-hud-cash').innerText = `$${players.p1.cash}`;
  document.getElementById('p1-buy-cash').innerText = `$${players.p1.cash}`;

  const wep1 = getCurrentWeapon(players.p1);
  if (wep1) {
    document.getElementById('p1-hud-weapon').innerText = wep1.name;
    const clip = players.p1.ammo[wep1.id] !== undefined ? players.p1.ammo[wep1.id] : 0;
    const reserve = wep1.maxAmmo;
    document.getElementById('p1-hud-ammo').innerHTML = wep1.clipSize > 0 ? `${clip}/<span>${reserve}</span>` : '—';

    // Reload prompt logic
    const prompt = document.getElementById('p1-reload-prompt');
    if (wep1.clipSize > 0 && clip <= Math.round(wep1.clipSize * 0.25) && !players.p1.isReloading) {
      prompt.style.display = 'block';
    } else {
      prompt.style.display = 'none';
    }
  }

  // Red damage blood flash trigger
  const bloodP1 = document.getElementById('blood-p1');
  if (players.p1.flashIntensity > 0) {
    bloodP1.style.boxShadow = `inset 0 0 50px rgba(255, 0, 0, ${players.p1.flashIntensity * 0.8})`;
  } else {
    bloodP1.style.boxShadow = `none`;
  }

  // Flashbang overlay opacity
  document.getElementById('flash-p1').style.opacity = players.p1.flashIntensity || 0;

  // Render P1 Radar Map
  drawRadar('p1');

  // Update Player 2 if split screen
  if (selectedMode !== 'solo') {
    document.getElementById('p2-hud-health').innerText = Math.round(players.p2.health);
    document.getElementById('p2-hud-shield').innerText = players.p2.inventory.includes('armor') ? 100 : 0;
    document.getElementById('p2-hud-cash').innerText = `$${players.p2.cash}`;
    document.getElementById('p2-buy-cash').innerText = `$${players.p2.cash}`;

    const wep2 = getCurrentWeapon(players.p2);
    if (wep2) {
      document.getElementById('p2-hud-weapon').innerText = wep2.name;
      const clip = players.p2.ammo[wep2.id] !== undefined ? players.p2.ammo[wep2.id] : 0;
      const reserve = wep2.maxAmmo;
      document.getElementById('p2-hud-ammo').innerHTML = wep2.clipSize > 0 ? `${clip}/<span>${reserve}</span>` : '—';

      const prompt = document.getElementById('p2-reload-prompt');
      if (wep2.clipSize > 0 && clip <= Math.round(wep2.clipSize * 0.25) && !players.p2.isReloading) {
        prompt.style.display = 'block';
      } else {
        prompt.style.display = 'none';
      }
    }

    const bloodP2 = document.getElementById('blood-p2');
    if (players.p2.flashIntensity > 0) {
      bloodP2.style.boxShadow = `inset 0 0 50px rgba(255, 0, 0, ${players.p2.flashIntensity * 0.8})`;
    } else {
      bloodP2.style.boxShadow = `none`;
    }

    document.getElementById('flash-p2').style.opacity = players.p2.flashIntensity || 0;
    drawRadar('p2');
  }

  // Update central score
  document.getElementById('global-round-score').innerText = `${p1Score + p2Score} - ${botScore}`;

  // Check weapon costs against player balance in buy card overlays
  updateBuyCardDisables('p1');
  if (selectedMode !== 'solo') {
    updateBuyCardDisables('p2');
  }
}

function updateBuyCardDisables(playerKey) {
  const player = players[playerKey];
  const overlay = document.getElementById(`buy-menu-${playerKey}`);
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.buy-card');
  cards.forEach(card => {
    const wepId = card.dataset.wepId;
    const wep = WEAPONS.find(w => w.id === wepId);
    if (wep && player.cash < wep.cost) {
      card.classList.add('disabled');
    } else {
      card.classList.remove('disabled');
    }
  });
}

// Draw a tactical circular radar/minimap
function drawRadar(playerKey) {
  const canvas = document.getElementById(`radar-${playerKey}`);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = 90;
  const h = canvas.height = 90;
  const cx = w / 2;
  const cy = h / 2;
  const radarRadius = 40;

  // Clear canvas
  ctx.clearRect(0, 0, w, h);

  // Background radar ring
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Internal circles
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, radarRadius * 0.6, 0, Math.PI * 2);
  ctx.arc(cx, cy, radarRadius * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Cross lines
  ctx.beginPath();
  ctx.moveTo(cx - radarRadius, cy);
  ctx.lineTo(cx + radarRadius, cy);
  ctx.moveTo(cx, cy - radarRadius);
  ctx.lineTo(cx, cy + radarRadius);
  ctx.stroke();

  // Draw self green arrow marker facing forward (forward is up in radar)
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5);
  ctx.lineTo(cx - 4, cy + 4);
  ctx.lineTo(cx + 4, cy + 4);
  ctx.closePath();
  ctx.fill();
}

// Killfeed item management (lasts 4 seconds)
function addKillfeedItem(attacker, victim, weapon) {
  const feed = document.getElementById('global-killfeed');
  const item = document.createElement('div');
  item.className = 'killfeed-item';

  let icon = '🔫';
  if (weapon === 'knife' || weapon === 'Karambit' || weapon === 'Butterfly Knife') icon = '🔪';
  else if (weapon === 'hegrenade') icon = '💣';
  else if (weapon === 'crown') icon = '🏆';
  else if (weapon === 'grave') icon = '💀';

  item.innerHTML = `
    <span class="killer">${attacker}</span>
    <span class="weapon">${icon} ${weapon}</span>
    <span class="victim">${victim}</span>
  `;

  feed.appendChild(item);

  // Autodelete item after 4 seconds
  setTimeout(() => {
    item.style.animation = 'feed-slide 0.3s reverse';
    setTimeout(() => {
      feed.removeChild(item);
    }, 280);
  }, 4000);
}

// Round result callback triggers
function handleRoundEnding(winnerId) {
  if (winnerId) {
    if (winnerId === 'p1' || winnerId === 'p2') {
      p1Score += 1;
      playRoundWinSound();
    } else {
      botScore += 1;
    }
  } else {
    botScore += 1;
  }

  // Update persistent Leaderboard stats
  const p1Name = document.getElementById('p1-name-input').value.trim();
  saveToLeaderboard(p1Name, p1Emoji, players.p1.kills, players.p1.deaths, players.p1.score);

  if (selectedMode !== 'solo') {
    const p2Name = document.getElementById('p2-name-input').value.trim();
    saveToLeaderboard(p2Name, p2Emoji, players.p2.kills, players.p2.deaths, players.p2.score);
  }
}
