// 声音:全部用 WebAudio 现场合成,不需要任何音频文件,离线也能响。
// iPad 要求第一次触摸后才能出声,所以每次播放前都先 unlock()。
let ctx = null;

export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* 忽略 */ }
  return ctx;
}

function tone(freq, t0, dur, { type = 'sine', vol = 0.25, to = null, vibrato = 0 } = {}, master = 1) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + t0 + dur);
  if (vibrato) {
    const l = ctx.createOscillator(); const lg = ctx.createGain();
    l.frequency.value = 22; lg.gain.value = vibrato; l.connect(lg); lg.connect(o.frequency);
    l.start(ctx.currentTime + t0); l.stop(ctx.currentTime + t0 + dur + 0.05);
  }
  const v = vol * master;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), ctx.currentTime + t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.05);
}

function hiss(t0, dur, vol, master) {
  const n = Math.floor(ctx.sampleRate * dur); const buf = ctx.createBuffer(1, n, ctx.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500;
  const g = ctx.createGain(); g.gain.value = vol * master;
  src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(ctx.currentTime + t0);
}

const SOUNDS = {
  tap: (m) => tone(660, 0, 0.09, { vol: 0.18 }, m),
  start: (m) => { tone(523, 0, 0.12, { type: 'triangle' }, m); tone(784, 0.1, 0.2, { type: 'triangle' }, m); },
  place: (m) => { tone(880, 0, 0.08, { vol: 0.2 }, m); tone(1320, 0.07, 0.14, { vol: 0.16 }, m); },
  finish: (m) => { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, { type: 'triangle' }, m)); },
  reward: (m) => { [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, i * 0.08, 0.3, { vol: 0.14 }, m)); },
  unlock: (m) => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle' }, m)); },
  bark: (m) => { tone(420, 0, 0.12, { type: 'sawtooth', vol: 0.12, to: 240 }, m); tone(440, 0.18, 0.14, { type: 'sawtooth', vol: 0.12, to: 250 }, m); },
  yip: (m) => { tone(900, 0, 0.1, { type: 'triangle', vol: 0.13, to: 1500 }, m); tone(1000, 0.14, 0.12, { type: 'triangle', vol: 0.13, to: 1700 }, m); },
  howl: (m) => tone(380, 0, 1.1, { type: 'sine', vol: 0.14, to: 720, vibrato: 10 }, m),
  hiss: (m) => { hiss(0, 0.5, 0.18, m); tone(1200, 0.35, 0.18, { type: 'sine', vol: 0.05, to: 1500 }, m); },
  quack: (m) => { tone(520, 0, 0.14, { type: 'square', vol: 0.07, to: 380 }, m); tone(500, 0.2, 0.14, { type: 'square', vol: 0.07, to: 360 }, m); },
  squeak: (m) => tone(1300, 0, 0.16, { type: 'sine', vol: 0.15, to: 950 }, m),
  chomp: (m) => { tone(170, 0, 0.12, { type: 'triangle', vol: 0.2, to: 90 }, m); tone(2000, 0.12, 0.03, { type: 'square', vol: 0.06 }, m); tone(160, 0.2, 0.12, { type: 'triangle', vol: 0.2, to: 90 }, m); },
  meow: (m) => {
    tone(520, 0, 0.5, { type: 'sawtooth', vol: 0.09, to: 900, vibrato: 18 }, m);
    tone(900, 0.28, 0.4, { type: 'sawtooth', vol: 0.07, to: 460, vibrato: 14 }, m);
  }
};

export function play(name, settings) {
  if (!settings || !settings.sound) return;
  if (!unlock() || !SOUNDS[name]) return;
  try { SOUNDS[name](Math.max(0, Math.min(1, settings.volume))); } catch (e) { /* 忽略 */ }
}
