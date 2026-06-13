// network.js - WebRTC PeerJS Multiplayer Synchronization
// Allows static hosting on GitHub Pages with real-time multiplayer over the internet.

export let peer = null;
export let conn = null;
export let isHost = false;
export let myPeerId = '';

let onConnectCallback = null;
let onDataCallback = null;

export function initNetwork(callbacks) {
  onConnectCallback = callbacks.onConnect;
  onDataCallback = callbacks.onData;

  // Initialize PeerJS client using PeerJS public cloud servers
  if (typeof Peer === 'undefined') {
    console.error('PeerJS library not loaded.');
    return;
  }

  peer = new Peer(null, {
    debug: 1
  });

  peer.on('open', (id) => {
    myPeerId = id;
    if (callbacks.onIdReady) {
      callbacks.onIdReady(id);
    }
  });

  // Handle incoming connections (We are hosting)
  peer.on('connection', (connection) => {
    conn = connection;
    isHost = true;
    setupConnection(conn);
  });

  peer.on('error', (err) => {
    console.warn('Network PeerJS warning:', err);
    if (err.type === 'peer-unavailable') {
      alert('Xatolik: Do\'stingizning IDsi topilmadi. Iltimos IDni tekshiring.');
    }
  });
}

export function connectToPeer(targetId) {
  isHost = false;
  conn = peer.connect(targetId);
  setupConnection(conn);
}

function setupConnection(connection) {
  connection.on('open', () => {
    console.log('Direct WebRTC channel open!');
    if (onConnectCallback) {
      onConnectCallback();
    }
  });

  connection.on('data', (data) => {
    if (onDataCallback) {
      onDataCallback(data);
    }
  });

  connection.on('close', () => {
    alert('Tarmoq aloqasi uzildi.');
    window.location.reload();
  });
}

export function sendNetData(data) {
  if (conn && conn.open) {
    conn.send(data);
  }
}

export function closeNetwork() {
  if (conn) conn.close();
  if (peer) peer.destroy();
}
