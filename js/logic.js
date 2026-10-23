// 核心规则:全部是纯函数,不碰 DOM,可以直接在 Node 里做单元测试。
// 所有"日期"都是本地日期字符串 'YYYY-MM-DD'。

export const DAY = 86400000;
export const RARE_AT = [3, 7, 14, 30, 60, 100];
export const MAX_SESSION_MIN = 180;

/* ---------- 全景场景:3 屏宽,猫坐在中间那屏 ---------- */
export const SCREEN_W = 744;
export const WORLD_W = SCREEN_W * 3;
export const CENTER_X = SCREEN_W * 1.5;
export const RIGHT_AT = 8; // 这个场景里放了 8 个装饰,右边一屏的风景出现
export const LEFT_AT = 20; // 放了 20 个,左边一屏出现
export const CUSTOM_IDS = ['custom', 'custom2', 'custom3', 'custom4', 'custom5'];
export const isCustomId = (id) => CUSTOM_IDS.includes(id);
export const CHAR_IDS = ['cat', 'dog', 'fox', 'wolf', 'snake', 'duck', 'capybara', 'croc'];
const defaultCustom = () => ({ map: {}, big: 'bigstar', rare: 'rainbow', bgColor: '#CFE9FF', icons: {}, useIcon: {} });

/* ---------- 日期工具 ---------- */
export function ymd(d) {
  const x = d instanceof Date ? d : new Date(d);
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
}
export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(s, n) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
}
export function diffDays(a, b) {
  return Math.round((parse(a) - parse(b)) / DAY);
}
export function weekday(s) {
  return parse(s).getDay(); // 0=周日
}
export function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate(); // m: 1-12
}

/* ---------- 初始状态 ---------- */
export const DEFAULT_SETTINGS = {
  goalMin: 40,
  unlockDays: 7,
  minSession: 5,
  maxSmallPerDay: 3,
  restWeekdays: [],
  makeupEvery: 7,
  makeupMax: 2,
  makeupWindow: 3,
  sound: true,
  volume: 0.65,
  penOnly: false,
  charDays: 10
};

export function createState() {
  return {
    v: 2,
    lang: 'zh',
    settings: { ...DEFAULT_SETTINGS },
    theme: { preset: 'cream', custom: null, mine: [] },
    subjects: [
      { id: 'en', name: { zh: '英语', en: 'English' }, color: '#3F6FE0' },
      { id: 'math', name: { zh: '数学', en: 'Math' }, color: '#E08A12' },
      { id: 'art', name: { zh: '画画', en: 'Art' }, color: '#D6408F' }
    ],
    lastSubject: 'en',
    sessions: [],
    restDates: [],
    makeups: [],
    active: null, // { start: ms, subjectId }
    rewards: { pocket: [], smallToday: {}, goalRewarded: {}, claimed: {}, makeupCards: 0, sceneCredits: 1, charCredits: 1 },
    chars: { owned: [], active: null },
    scenes: { owned: [], active: null, placed: {}, customs: { custom: defaultCustom() } },
    nextId: 1
  };
}

/** 把导入/旧版本的数据补齐成完整状态 */
export function normalize(obj) {
  const base = createState();
  if (!obj || typeof obj !== 'object') return base;
  const s = { ...base, ...obj };
  s.settings = { ...base.settings, ...(obj.settings || {}) };
  s.theme = { ...base.theme, ...(obj.theme || {}) };
  s.rewards = { ...base.rewards, ...(obj.rewards || {}) };
  s.scenes = { ...base.scenes, ...(obj.scenes || {}) };
  s.chars = { ...base.chars, ...(obj.chars || {}) };
  const oc = obj.scenes || {};
  s.scenes.customs = { ...(oc.customs || {}) };
  if (oc.custom) s.scenes.customs.custom = { ...defaultCustom(), ...oc.custom }; // 旧版本单张画布
  delete s.scenes.custom;
  CUSTOM_IDS.forEach((id) => { if (s.scenes.customs[id]) s.scenes.customs[id] = { ...defaultCustom(), ...s.scenes.customs[id] }; });
  if (!s.scenes.customs.custom) s.scenes.customs.custom = defaultCustom();
  if (!(Number(obj.v) >= 2)) { // 旧版本场景只有 744 宽,元素整体右移到中间那屏
    s.scenes.placed = JSON.parse(JSON.stringify(s.scenes.placed || {}));
    Object.values(s.scenes.placed).forEach((a) => a.forEach((e) => { e.x += SCREEN_W; }));
  }
  s.v = 2;
  if (!Array.isArray(s.subjects) || !s.subjects.length) s.subjects = base.subjects;
  ['sessions', 'restDates', 'makeups'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
  return s;
}

export function subjectName(subject, lang) {
  if (!subject) return '';
  return typeof subject.name === 'string' ? subject.name : (subject.name[lang] || subject.name.zh || subject.name.en || '');
}
export function subjectSlot(state, subjectId) {
  const i = state.subjects.findIndex((s) => s.id === subjectId);
  return (i < 0 ? 0 : i) % 3;
}

/* ---------- 每天的状态 ---------- */
export function dayMinutes(state, d) {
  let n = 0;
  for (const s of state.sessions) if (s.date === d) n += s.minutes;
  return n;
}
export function dayBySubject(state, d) {
  const out = {};
  for (const s of state.sessions) if (s.date === d) out[s.subjectId] = (out[s.subjectId] || 0) + s.minutes;
  return out;
}
export function isRest(state, d) {
  return state.settings.restWeekdays.includes(weekday(d)) || state.restDates.includes(d);
}

/**
 * goal 达成目标 | makeup 补签 | today 今天还在进行 | rest 休息日
 * part 学了但没达标 | none 没学 | future 还没到
 */
export function dayStatus(state, d, today) {
  if (d > today) return 'future';
  if (dayMinutes(state, d) >= state.settings.goalMin) return 'goal';
  if (state.makeups.includes(d)) return 'makeup';
  if (d === today) return 'today';
  if (isRest(state, d)) return 'rest';
  return dayMinutes(state, d) > 0 ? 'part' : 'none';
}
const counts = (st) => st === 'goal' || st === 'makeup';

export function earliestDate(state, today) {
  let e = today;
  for (const s of state.sessions) if (s.date < e) e = s.date;
  for (const m of state.makeups) if (m < e) e = m;
  return e;
}

/** 连续天数:休息日不断开也不计数;今天还没达标时不影响昨天的连续 */
export function streakInfo(state, today) {
  const first = earliestDate(state, today);
  let cur = 0; let start = null;
  if (counts(dayStatus(state, today, today))) { cur = 1; start = today; }
  let d = addDays(today, -1);
  while (d >= first) {
    const st = dayStatus(state, d, today);
    if (counts(st)) { cur++; start = d; } else if (st !== 'rest') break;
    d = addDays(d, -1);
  }
  let best = 0; let run = 0;
  for (d = first; d <= today; d = addDays(d, 1)) {
    const st = dayStatus(state, d, today);
    if (counts(st)) { run++; if (run > best) best = run; } else if (st === 'rest' || st === 'today') { /* 不断开 */ } else run = 0;
  }
  return { current: cur, start, best };
}

/* ---------- 学习记录与奖励 ---------- */
function nextId(state) { return state.nextId++; }

export function startSession(state, subjectId, now) {
  state.active = { start: now, subjectId };
  state.lastSubject = subjectId;
}

/** 结束学习。返回 { ok, minutes, events };太短则 ok:false 且不记录 */
export function finishSession(state, now) {
  const act = state.active;
  state.active = null;
  if (!act) return { ok: false, reason: 'none', minutes: 0, events: [] };
  const raw = (now - act.start) / 60000;
  const minutes = Math.min(MAX_SESSION_MIN, Math.round(raw));
  const date = ymd(now);
  if (minutes < state.settings.minSession) return { ok: false, reason: 'short', minutes, events: [] };
  state.sessions.push({ id: nextId(state), date, subjectId: act.subjectId, start: act.start, end: now, minutes });
  const events = awardFor(state, act.subjectId, date);
  return { ok: true, minutes, events, date };
}

function awardFor(state, subjectId, date) {
  const R = state.rewards; const S = state.settings; const events = [];
  const made = R.smallToday[date] || 0;
  if (made < S.maxSmallPerDay) {
    R.smallToday[date] = made + 1;
    R.pocket.push({ kind: 'small', slot: subjectSlot(state, subjectId) });
    events.push({ type: 'small', slot: subjectSlot(state, subjectId) });
  }
  if (dayMinutes(state, date) >= S.goalMin && !R.goalRewarded[date]) {
    R.goalRewarded[date] = true;
    R.pocket.push({ kind: 'big' });
    events.push({ type: 'big' });
    checkMilestones(state, date, events);
  }
  return events;
}

export function checkMilestones(state, today, events = []) {
  const info = streakInfo(state, today);
  const k = info.current; const S = state.settings; const R = state.rewards;
  if (!k || !info.start) return events;
  const key = (s) => info.start + ':' + s;
  if (RARE_AT.includes(k) && !R.claimed[key('r' + k)]) {
    R.claimed[key('r' + k)] = 1; R.pocket.push({ kind: 'rare' }); events.push({ type: 'rare', streak: k });
  }
  if (S.unlockDays > 0 && k % S.unlockDays === 0 && !R.claimed[key('u' + k)]) {
    R.claimed[key('u' + k)] = 1; R.sceneCredits++; events.push({ type: 'unlock', streak: k });
  }
  if (S.charDays > 0 && k % S.charDays === 0 && !R.claimed[key('c' + k)]) {
    R.claimed[key('c' + k)] = 1; R.charCredits++; events.push({ type: 'unlockChar', streak: k });
  }
  if (S.makeupEvery > 0 && k % S.makeupEvery === 0 && !R.claimed[key('m' + k)]) {
    R.claimed[key('m' + k)] = 1;
    if (R.makeupCards < S.makeupMax) { R.makeupCards++; events.push({ type: 'makeup', streak: k }); }
  }
  return events;
}

export function canUseMakeup(state, date, today) {
  const age = diffDays(today, date);
  if (state.rewards.makeupCards < 1) return false;
  if (age < 1 || age > state.settings.makeupWindow) return false;
  const st = dayStatus(state, date, today);
  return st === 'none' || st === 'part';
}
export function useMakeup(state, date, today) {
  if (!canUseMakeup(state, date, today)) return { ok: false, events: [] };
  state.makeups.push(date);
  state.rewards.makeupCards--;
  return { ok: true, events: checkMilestones(state, today) };
}

export function addManualSession(state, { date, subjectId, minutes }) {
  state.sessions.push({ id: nextId(state), date, subjectId, start: null, end: null, minutes: Math.max(1, Math.min(MAX_SESSION_MIN, Math.round(minutes))), manual: true });
}
export function deleteSession(state, id) {
  state.sessions = state.sessions.filter((s) => s.id !== id);
}

/* ---------- 场景 ---------- */
export function customCfg(state, id) {
  const c = state.scenes.customs;
  if (!c[id]) c[id] = defaultCustom();
  if (!c[id].icons) c[id].icons = {};
  if (!c[id].useIcon) c[id].useIcon = {};
  return c[id];
}
export function chooseChar(state, id) {
  const ch = state.chars;
  if (!CHAR_IDS.includes(id)) return false;
  if (ch.owned.includes(id)) { ch.active = id; return true; }
  if (state.rewards.charCredits < 1) return false;
  state.rewards.charCredits--;
  ch.owned.push(id);
  ch.active = id;
  return true;
}
/** 全景里哪几屏已经"出现" */
export function screensOpen(state, sceneId) {
  const n = sceneProgress(state, sceneId);
  return { left: n >= LEFT_AT, right: n >= RIGHT_AT, leftNeed: Math.max(0, LEFT_AT - n), rightNeed: Math.max(0, RIGHT_AT - n) };
}
export function canPlaceAt(state, sceneId, x) {
  const o = screensOpen(state, sceneId);
  if (x < SCREEN_W) return o.left;
  if (x >= SCREEN_W * 2) return o.right;
  return true;
}
export function chooseScene(state, sceneId) {
  const sc = state.scenes;
  if (sc.owned.includes(sceneId)) { sc.active = sceneId; return true; }
  if (sceneId === 'custom') { sc.owned.push(sceneId); sc.active = sceneId; return true; } // 第一张自己的画布免费
  if (state.rewards.sceneCredits < 1) return false;
  state.rewards.sceneCredits--;
  sc.owned.push(sceneId);
  sc.active = sceneId;
  return true;
}
export function placeFromPocket(state, index, x, y, rng = Math.random) {
  const R = state.rewards; const sc = state.scenes;
  if (!sc.active || index < 0 || index >= R.pocket.length) return null;
  if (!canPlaceAt(state, sc.active, x)) return null;
  const item = R.pocket.splice(index, 1)[0];
  const el = { kind: item.kind, slot: item.slot || 0, x: Math.round(x), y: Math.round(Math.min(480, Math.max(60, y))), r: Math.round((rng() - 0.5) * 30), f: rng() < 0.5 ? 1 : -1 };
  (sc.placed[sc.active] = sc.placed[sc.active] || []).push(el);
  return el;
}
export function sceneProgress(state, sceneId) {
  return (state.scenes.placed[sceneId] || []).length;
}

/* ---------- 统计 ---------- */
export function monthData(state, y, m, today) {
  const n = daysInMonth(y, m);
  const days = [];
  let goalDays = 0; let studyDays = 0; let total = 0; let max = 0;
  for (let d = 1; d <= n; d++) {
    const date = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const minutes = dayMinutes(state, date);
    const status = dayStatus(state, date, today);
    days.push({ date, day: d, minutes, bySubject: dayBySubject(state, date), status });
    total += minutes;
    if (minutes > 0) studyDays++;
    if (status === 'goal' || status === 'makeup') goalDays++;
    if (minutes > max) max = minutes;
  }
  let best = 0; let run = 0;
  for (const d of days) {
    if (d.status === 'goal' || d.status === 'makeup') { run++; best = Math.max(best, run); } else if (d.status === 'rest' || d.status === 'today' || d.status === 'future') { /* 不断开 */ } else run = 0;
  }
  const offset = (weekday(days[0].date) + 6) % 7; // 周一为一周开始
  return { y, m, days, goalDays, studyDays, total, max, best, avg: studyDays ? Math.round(total / studyDays) : 0, offset };
}
