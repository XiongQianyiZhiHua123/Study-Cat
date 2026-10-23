// 入口:加载数据 → 应用配色和语言 → 按网址 # 后面的路径显示对应页面
import * as store from './store.js';
import { setLang } from './i18n.js';
import { applyTheme } from './theme.js';
import { unlock } from './sound.js';
import * as home from './pages/home.js';
import * as chars from './pages/chars.js';
import * as scenes from './pages/scenes.js';
import * as theme from './pages/theme.js';
import * as draw from './pages/draw.js';
import * as stats from './pages/stats.js';
import * as parent from './pages/parent.js';

const ROUTES = { '/': home, '/chars': chars, '/scenes': scenes, '/theme': theme, '/draw': draw, '/stats': stats, '/parent': parent };
const app = document.getElementById('app');
let unmount = null;

function applyGlobal() {
  const st = store.get();
  setLang(st.lang);
  applyTheme(st.theme);
  document.title = st.lang === 'en' ? 'Study Cat' : '学习小猫';
}

function route() {
  if (unmount) { try { unmount(); } catch (e) { console.error(e); } unmount = null; }
  document.querySelectorAll('.modal').forEach((m) => m.remove());
  let path = (location.hash.replace(/^#/, '') || '/').split('?')[0];
  if (!ROUTES[path]) path = '/';
  const st = store.get();
  // 第一次打开:先挑一个角色,再从 10 个场景里挑一个
  if (path === '/' && !st.chars.active) { location.replace('#/chars'); return; }
  if (path === '/' && !st.scenes.active) { location.replace('#/scenes'); return; }
  app.dataset.route = path === '/' ? 'home' : path.slice(1);
  app.innerHTML = '';
  unmount = ROUTES[path].mount(app);
  window.scrollTo(0, 0);
}

async function boot() {
  store.load();
  await store.loadDrawing();
  applyGlobal();
  store.subscribe(applyGlobal); // 先于各页面登记,保证页面重画时配色和语言已更新
  store.requestPersist();
  window.addEventListener('hashchange', route);
  window.addEventListener('pointerdown', unlock, { once: true });
  route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
boot();
