// 各页面共用的小工具:转义、图标、场景拼装、弹窗、提示条
import { SCENE_BY_ID, typeMarkup, KIND_SCALE, elementMarkup, elementType, fgPath } from './art.js';
import { catFx } from './cat.js';
import { charOf } from './chars.js';
import { drawingOf } from './store.js';
import { isCustomId, customCfg, screensOpen, SCREEN_W, WORLD_W, CUSTOM_IDS } from './logic.js';
import { t } from './i18n.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const S = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
const STAR_PTS = '0,-14 4.1,-5.6 13.3,-4.3 6.7,2.2 8.2,11.3 0,7 -8.2,11.3 -6.7,2.2 -13.3,-4.3 -4.1,-5.6';
export const ICON = {
  flame: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2 C15 8 22 10 22 17 A8 8 0 0 1 6 17 C6 13 9.5 12 9.5 7.5 C12 8.5 13 6 14 2Z" fill="#FF8A3D"/><path d="M14 13 C15 16 18 16.5 18 19.5 A4 4 0 0 1 10 19.5 C10 17.5 13 17 14 13Z" fill="#FFD166"/></svg>',
  star: `<svg viewBox="-16 -16 32 32" aria-hidden="true"><polygon points="${STAR_PTS}" fill="#FFC93C" stroke="#E7A100" stroke-width="2" stroke-linejoin="round"/></svg>`,
  scene: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><rect x="3" y="5" width="22" height="18" rx="4"/><path d="M3 19 L10 12 L15 17 L19 13 L25 19"/></svg>`,
  palette: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M14 3 C7 3 3 8 3 13 C3 19 8 25 14 25 C16 25 16 23 15 21.5 C14 20 15 18.5 17 18.5 H20 C23 18.5 25 17 25 14 C25 8 20 3 14 3Z"/><circle cx="9" cy="12" r="1.5"/><circle cx="14" cy="8.5" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
  pencil: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M5 23 L6 18 L18 6 L22 10 L10 22 Z"/><path d="M16 8 L20 12"/></svg>`,
  chart: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M6 23 V13 M14 23 V5 M22 23 V16"/></svg>',
  lock: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><rect x="5" y="12" width="18" height="12" rx="4"/><path d="M9 12 V9 A5 5 0 0 1 19 9 V12"/></svg>`,
  back: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 5 L8 14 L17 23"/></svg>',
  next: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 L20 14 L11 23"/></svg>',
  play: '<svg viewBox="0 0 40 40" aria-hidden="true"><polygon points="12,6 12,34 34,20" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 21 L17 30 L33 11" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  paw: '<svg viewBox="-16 -16 32 32" aria-hidden="true"><g fill="currentColor"><circle cx="-9" cy="-5" r="3.6"/><circle cx="-3.5" cy="-10.5" r="3.8"/><circle cx="3.5" cy="-10.5" r="3.8"/><circle cx="9" cy="-5" r="3.6"/><path d="M0 -2 C6.5 -2 11 4 9.5 8.5 C8.5 12 4.5 11.5 0 11.5 C-4.5 11.5 -8.5 12 -9.5 8.5 C-11 4 -6.5 -2 0 -2Z"/></g></svg>',
  moon: '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M20 4 A12 12 0 1 0 26 20 A10 10 0 0 1 20 4Z" fill="currentColor"/></svg>',
  ticket: `<svg viewBox="0 0 30 30" ${S} aria-hidden="true"><path d="M3 9 H27 V13 A2 2 0 0 0 27 17 V21 H3 V17 A2 2 0 0 0 3 13Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M12 4 V20 M4 12 H20"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M4 12 H20"/></svg>`,
  edit: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M5 23 L6 18 L18 6 L22 10 L10 22 Z"/></svg>`,
  trash: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M5 8 H23"/><path d="M11 8 V5 H17 V8"/><path d="M7 8 L8.5 23 H19.5 L21 8"/></svg>`,
  undo: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M9 6 L4 11 L9 16"/><path d="M4 11 H17 A6 6 0 0 1 17 23 H10"/></svg>`,
  eraser: `<svg viewBox="0 0 28 28" ${S} aria-hidden="true"><path d="M4 18 L15 6 L23 13 L14 23 H8 Z"/><path d="M10 12 L19 19"/></svg>`
};

/* 场景是 3 屏宽的全景(世界坐标 0..2232),猫坐在中间那屏。左右两屏用中间那屏的镜像拼接,接缝自然。
   wide=false 时只取中间那屏(缩略图用)。 */
const T = (x) => `translate(${x} 0)`;
const MIRROR = (x) => `translate(${x + SCREEN_W} 0) scale(-1 1)`;
export const viewBoxOf = (wide) => (wide ? `0 0 ${WORLD_W} 500` : `${SCREEN_W} 0 ${SCREEN_W} 500`);

export function sceneInner(state, sceneId, { wide = false, cat = false, elements = false, fx = false, pop = -1, mist = false } = {}) {
  let bg; let fgFill;
  const tiles = wide ? [0, 1, 2] : [1];
  if (isCustomId(sceneId)) {
    const c = customCfg(state, sceneId); const d = drawingOf(sceneId);
    bg = `<rect width="${WORLD_W}" height="500" fill="${c.bgColor}"/>` + (d.png ? `<image href="${d.png}" x="0" y="0" width="${WORLD_W}" height="500" preserveAspectRatio="none"/>` : '');
    fgFill = '#6FB86B';
  } else {
    const sc = SCENE_BY_ID[sceneId] || SCENE_BY_ID.night;
    const tile = sc.bg();
    bg = tiles.map((i) => `<g transform="${i === 1 ? T(SCREEN_W) : MIRROR(i * SCREEN_W)}">${tile}</g>`).join('');
    fgFill = sc.fg;
  }
  const fgTiles = tiles.map((i) => `<g transform="${i === 1 ? T(SCREEN_W) : MIRROR(i * SCREEN_W)}">${fgPath(fgFill)}</g>`).join('');
  const ch = charOf(state.chars && state.chars.active);
  let out = bg;
  if (cat) out += `<g transform="${T(SCREEN_W)}">${ch.back()}</g>`;
  out += fgTiles;
  if (cat) out += `<g transform="${T(SCREEN_W)}">${ch.front()}</g>`;
  if (elements) {
    const list = state.scenes.placed[sceneId] || [];
    out += list.map((el, i) => {
      const sc2 = KIND_SCALE[el.kind] || 1;
      return `<g transform="translate(${el.x} ${el.y}) rotate(${el.r}) scale(${(sc2 * el.f).toFixed(2)} ${sc2})"><g class="${i === pop ? 'placed pop' : 'placed'}"><g class="anim ${(() => { const ty = elementType(sceneId, state, el); return ty.startsWith('img:') ? 'a-mine' : 'a-' + ty; })()}" style="animation-delay:-${((i * 0.73) % 4).toFixed(2)}s">${elementMarkup(sceneId, state, el)}</g></g></g>`;
    }).join('');
  }
  if (cat && fx) out += `<g transform="${T(SCREEN_W)}">${catFx()}</g>`;
  if (wide && mist) {
    const o = screensOpen(state, sceneId);
    const veil = (x, need) => `<g class="mist" transform="${T(x)}"><rect width="${SCREEN_W}" height="500" fill="#fff" opacity=".78"/><g transform="translate(372 200) scale(2.2)" color="#6b5f7d">${ICON.lock.replace('<svg ', '<svg x="-14" y="-14" width="28" height="28" ')}</g><text x="372" y="290" text-anchor="middle" font-size="26" font-weight="700" fill="#2B2140" style="font-family:inherit">${esc(t('home.mist', { n: need }))}</text></g>`;
    if (!o.left) out += veil(0, o.leftNeed);
    if (!o.right) out += veil(SCREEN_W * 2, o.rightNeed);
  }
  return out;
}
export function sceneSVG(state, sceneId, opts = {}, attrs = '') {
  return `<svg viewBox="${viewBoxOf(opts.wide)}" ${attrs}>${sceneInner(state, sceneId, opts)}</svg>`;
}

export const sceneName = (id) => (isCustomId(id) ? t('scene.customN', { n: CUSTOM_IDS.indexOf(id) + 1 }) : t('scene.' + id));

/** 一排小图标:这个场景会长出什么(给场景页和"说明"弹窗用) */
export function elementIcons(list, state) {
  return list.map((k) => `<svg viewBox="-24 -24 48 48" aria-hidden="true">${typeMarkup(k, state)}</svg>`).join('');
}

/* ---------- 弹窗和提示 ---------- */
export function modal(html, onMount) {
  const el = document.createElement('div');
  el.className = 'modal';
  el.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  if (onMount) onMount(el, close);
  const first = el.querySelector('button, input');
  if (first) first.focus();
  return close;
}
let toastTimer;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
export function confirmBox(message, okLabel, onOk) {
  modal(`<p class="modal-msg">${esc(message)}</p><div class="modal-actions"><button class="btn ghost" data-m="no">${esc(t('common.cancel'))}</button><button class="btn pri" data-m="ok">${esc(okLabel)}</button></div>`, (el, close) => {
    el.querySelector('[data-m=no]').onclick = close;
    el.querySelector('[data-m=ok]').onclick = () => { close(); onOk(); };
  });
}

/** 非主页的顶部栏 */
export function pageHead(title, extra = '') {
  return `<header class="pagehead"><a class="btn card-btn back" href="#/">${ICON.back}<span>${esc(t('common.back'))}</span></a><h1>${esc(title)}</h1><div class="grow"></div>${extra}</header>`;
}

/** 站内导航(顶部和底部标签栏共用) */
export const NAV = [
  { href: '#/chars', icon: 'paw', key: 'nav.chars' },
  { href: '#/scenes', icon: 'scene', key: 'nav.scenes' },
  { href: '#/theme', icon: 'palette', key: 'nav.theme' },
  { href: '#/draw', icon: 'pencil', key: 'nav.draw' },
  { href: '#/stats', icon: 'chart', key: 'nav.stats' }
];
