// 配色:6 套预设 + 5 个部分都能自己调。界面所有颜色都来自 CSS 变量。

export const SCHEMES = {
  cream: { bg: '#FFF3E6', card: '#FFFFFF', pri: '#C2570C', acc: '#F2A413', ink: '#2B2140' },
  blueberry: { bg: '#2A2750', card: '#3B3880', pri: '#FFC93C', acc: '#7FD6FF', ink: '#F4F0FF' },
  mint: { bg: '#EAF8E6', card: '#FFFFFF', pri: '#17806F', acc: '#F2A413', ink: '#1F3A33' },
  sakura: { bg: '#FFE8EE', card: '#FFFFFF', pri: '#D4336F', acc: '#FF8FB8', ink: '#4A1F33' },
  sky: { bg: '#E8F5FF', card: '#FFFFFF', pri: '#2F6FE0', acc: '#FFB347', ink: '#1E2F55' },
  night: { bg: '#16151F', card: '#26243A', pri: '#FF9F5A', acc: '#B58CFF', ink: '#F4F0FF' }
};
export const SCHEME_IDS = Object.keys(SCHEMES);
export const ROLES = ['bg', 'card', 'pri', 'acc', 'ink'];
export const ROLE_OPTIONS = {
  bg: ['#FFF3E6', '#FFE8EE', '#E8F5FF', '#EAF8E6', '#F3ECFF', '#2A2750', '#16151F'],
  card: ['#FFFFFF', '#FFE3EC', '#DDF0FF', '#DDF5D8', '#EADFFF', '#3B3880', '#26243A'],
  pri: ['#C2570C', '#D4336F', '#2F6FE0', '#17806F', '#6B4FD8', '#FFC93C', '#FF9F5A'],
  acc: ['#F2A413', '#FF8FB8', '#7FD6FF', '#8E7CFF', '#4CC26B', '#FFB347', '#B58CFF'],
  ink: ['#2B2140', '#4A1F33', '#1E2F55', '#1F3A33', '#3A2A1A', '#F4F0FF', '#FFFFFF']
};

const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export function lum(hex) {
  const c = rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
  const x = lum(a); const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** 在 bg 上该用白字还是深字 */
export function onColor(bg) {
  return contrast('#FFFFFF', bg) >= contrast('#2B2140', bg) ? '#FFFFFF' : '#2B2140';
}
export function mix(a, b, t) {
  const A = rgb(a); const B = rgb(b);
  return '#' + A.map((v, i) => Math.round(v * (1 - t) + B[i] * t).toString(16).padStart(2, '0')).join('');
}

export function resolve(theme) {
  if (theme.custom && ROLES.every((r) => /^#[0-9a-f]{6}$/i.test(theme.custom[r] || ''))) return { ...theme.custom };
  return { ...(SCHEMES[theme.preset] || SCHEMES.cream) };
}

/** 颜色太接近时自动改用能看清的文字色(对比度不到 4.5 就换) */
export function derive(c) {
  const dark = lum(c.bg) < 0.2;
  const inkBg = contrast(c.ink, c.bg) >= 4.5 ? c.ink : onColor(c.bg);
  const inkCard = contrast(c.ink, c.card) >= 4.5 ? c.ink : onColor(c.card);
  return {
    '--bg': c.bg, '--card': c.card, '--pri': c.pri, '--acc': c.acc,
    '--ink': inkBg, '--ink-card': inkCard,
    '--ink2': mix(inkBg, c.bg, 0.3),
    '--ink2-card': mix(inkCard, c.card, 0.3),
    '--soft': mix(c.card, inkCard, 0.07),
    '--track': mix(c.card, inkCard, 0.13),
    '--onpri': onColor(c.pri), '--onacc': onColor(c.acc),
    '--shadow': dark ? 'rgba(0,0,0,.4)' : 'rgba(43,33,64,.12)'
  };
}

export function applyTheme(theme) {
  const vars = derive(resolve(theme));
  const root = document.documentElement;
  for (const k in vars) root.style.setProperty(k, vars[k]);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', vars['--bg']);
}
