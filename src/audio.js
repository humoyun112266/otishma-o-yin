// Web Audio API Sound Synthesizer for 3D FPS Game
// This allows high-quality audio feedback without loading heavy external sound files.

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate a buffer of white noise for explosions and gunshots
let noiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

export function playShootSound(type = 'rifle') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Gunshot click/noise component
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    // Sinusoidal/Boom component for weight
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    if (type === 'pistol') {
      // Pistol: Quick snap
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1000, now);
      noiseFilter.Q.setValueAtTime(3, now);

      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      noise.start(now);
      noise.stop(now + 0.15);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'sniper') {
      // Sniper: Heavy boom & long echo
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.Q.setValueAtTime(2, now);

      noiseGain.gain.setValueAtTime(0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      oscGain.gain.setValueAtTime(0.6, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.start(now);
      noise.stop(now + 0.4);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'shotgun') {
      // Shotgun: Multi-pellet blast (wide burst)
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1500, now);

      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      noise.start(now);
      noise.stop(now + 0.25);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'knife') {
      // Knife: Whistle/swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Default Rifle (AK-47 / M4)
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(2, now);

      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.start(now);
      noise.stop(now + 0.2);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playExplosionSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(20, now + 1.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Deep sub bass boom
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, now);
    sub.frequency.linearRampToValueAtTime(10, now + 0.8);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    sub.connect(subGain);
    subGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 1.5);
    sub.start(now);
    sub.stop(now + 0.8);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playFlashbangSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Explosion sound first
    playExplosionSound();

    // High pitch ear ringing oscillator
    const ring = ctx.createOscillator();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(8000, now); // Very high pitch tinnitus

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0); // 4 seconds fade out

    ring.connect(gain);
    gain.connect(ctx.destination);

    ring.start(now);
    ring.stop(now + 4.0);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playReloadSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Click 1 (remove mag)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(400, now);
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // Click 2 (insert new mag) after 0.3s
    setTimeout(() => {
      const t = ctx.currentTime;
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(600, t);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.15, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.08);
    }, 300);

    // Click 3 (pull bolt) after 0.6s
    setTimeout(() => {
      const t = ctx.currentTime;
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(800, t);
      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.2, t);
      gain3.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(t);
      osc3.stop(t + 0.1);
    }, 600);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playBuySound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playHitmarkerSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.setValueAtTime(1500, now + 0.02);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playRoundWinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      const t = now + i * 0.15;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playRoundLoseSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [293.66, 277.18, 261.63, 220]; // D4, C#4, C4, A3 (melancholic desc)
    notes.forEach((freq, i) => {
      const t = now + i * 0.2;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}
