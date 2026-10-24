// 离线缓存:第一次打开后,没有网络也能用。改了代码后把 VERSION 加 1,旧缓存会被清掉。
const VERSION = 'studycat-v4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'icons/icon.svg', 'icons/icon-180.png',
  'js/main.js', 'js/logic.js', 'js/store.js', 'js/theme.js', 'js/sound.js', 'js/i18n.js', 'js/ui.js', 'js/art.js', 'js/cat.js', 'js/chars.js',
  'js/locales/zh.js', 'js/locales/en.js',
  'js/pages/home.js', 'js/pages/chars.js', 'js/pages/iconedit.js', 'js/pages/scenes.js', 'js/pages/theme.js', 'js/pages/draw.js', 'js/pages/stats.js', 'js/pages/parent.js', 'js/pages/subjects.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 先联网取最新(每次都向服务器确认有没有更新),没网络时再用缓存 —— 这样发布新版本后,孩子打开就是新的。
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => {
    if (r.ok && new URL(e.request.url).origin === location.origin) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))));
});
