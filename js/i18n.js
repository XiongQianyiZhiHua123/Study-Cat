// 中英文切换。文案全部在 locales/zh.js 和 locales/en.js 里,代码里只写 t('key')。
// 想加第三种语言:新建 locales/xx.js,在下面的 LOCALES 里登记即可。
import { zh } from './locales/zh.js';
import { en } from './locales/en.js';

export const LOCALES = { zh, en };
let lang = 'zh';

export function setLang(l) {
  lang = LOCALES[l] ? l : 'zh';
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
}
export const getLang = () => lang;

export function t(key, vars) {
  let s = LOCALES[lang][key];
  if (s === undefined) s = zh[key];
  if (s === undefined) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

/** 星期几的简称,i: 0=周日 */
export const wd = (i) => t('wd.' + i);

/** '2026-10-20' → '10月20日 周二' / 'Oct 20 Tue' */
export function fmtDay(d) {
  const [y, m, day] = d.split('-').map(Number);
  const w = new Date(y, m - 1, day, 12).getDay();
  return t('fmt.day', { m, d: day, w: wd(w) });
}
