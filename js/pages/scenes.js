// 场景页:10 个预设场景 + "我的画布"。第一次从全部里自选 1 个,之后每连续学满 N 天再选 1 个。
import * as store from '../store.js';
import * as L from '../logic.js';
import { t } from '../i18n.js';
import { SCENES, sceneElements } from '../art.js';
import { esc, ICON, sceneSVG, sceneName, elementIcons, pageHead, confirmBox, toast } from '../ui.js';
import { play } from '../sound.js';

export function mount(root) {
  function render() {
    const st = store.get(); const today = L.ymd(Date.now());
    const credits = st.rewards.sceneCredits; const owned = st.scenes.owned; const active = st.scenes.active;
    const info = L.streakInfo(st, today); const N = st.settings.unlockDays;
    const filled = info.current % N; const left = N - filled;
    const first = owned.length === 0;
    let banner;
    if (first) banner = `<b>${esc(t('scenes.first'))}</b><span>${esc(t('scenes.firstSub'))}</span>`;
    else if (credits > 0) banner = `<b>${esc(t('scenes.credit', { n: credits }))}</b><span>${esc(t('scenes.creditSub'))}</span>`;
    else banner = `<b>${esc(t('scenes.next', { n: left }))}</b><span>${esc(t('scenes.nextSub', { n: N }))}</span>`;
    const dots = credits > 0 || first ? '' : `<div class="dots" role="img" aria-label="${filled}/${N}">${Array.from({ length: Math.min(N, 31) }, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('')}</div>`;

    const nextCustom = L.CUSTOM_IDS.find((id) => !owned.includes(id));
    const all = [...SCENES.map((s) => s.id), ...L.CUSTOM_IDS.filter((id) => owned.includes(id) || id === nextCustom)];
    const cards = all.map((id) => {
      const isOwned = owned.includes(id); const isActive = active === id;
      const name = sceneName(id); const isCustom = L.isCustomId(id); const free = id === 'custom' && !isOwned;
      const prog = L.sceneProgress(st, id);
      let badge = ''; let overlay = '';
      if (isActive) badge = `<span class="badge on">${esc(t('scenes.using'))}</span>`;
      else if (isOwned) badge = `<span class="badge">${esc(t('scenes.owned'))}</span>`;
      else if (free) badge = `<span class="badge pick">${esc(t('scenes.free'))}</span>`;
      else if (credits > 0) badge = `<span class="badge pick">${esc(t('scenes.canPick'))}</span>`;
      else overlay = `<div class="lock">${ICON.lock}</div>`;
      if (prog >= 100) badge += `<span class="badge done">${esc(t('scenes.complete'))}</span>`;
      const sub = isOwned ? t('home.sceneCount', { n: prog, g: 100 }) : (isCustom ? t('scenes.customSub') : t('scenes.sub.' + id));
      return `<div class="scard${isActive ? ' active' : ''}">
        <button class="thumb" data-act="choose" data-id="${id}" aria-label="${esc(name)}">${sceneSVG(st, id, { elements: isOwned }, 'aria-hidden="true"')}${badge}${overlay}</button>
        <b>${esc(name)}</b><span>${esc(sub)}</span>
        <div class="hintrow" title="${esc(t('scenes.grows'))}">${(() => { const e = sceneElements(id, st); return elementIcons([...e.small, e.big, e.rare]); })()}</div>
        ${isCustom && isOwned ? `<a class="btn card-btn small" href="#/draw?id=${id}">${ICON.pencil}<span>${esc(t('scenes.edit'))}</span></a>` : ''}
      </div>`;
    }).join('');
    root.innerHTML = `<div class="page scenes">${pageHead(t('scenes.title'))}
      <div class="card banner"><div class="gift">${ICON.star}</div><div class="banner-t">${banner}</div><div class="grow"></div>${dots}</div>
      <div class="sgrid">${cards}</div></div>`;
  }

  function choose(id) {
    const st = store.get(); const name = sceneName(id);
    if (id === 'custom' && !st.scenes.owned.includes(id)) { // 第一张自己的画布免费
      store.update((s) => { L.chooseScene(s, id); });
      play('unlock', store.get().settings);
      location.hash = '#/draw?id=custom';
      return;
    }
    if (st.scenes.owned.includes(id)) {
      store.update((s) => { L.chooseScene(s, id); });
      toast(t('scenes.switched', { name }));
      location.hash = '#/';
      return;
    }
    if (st.rewards.sceneCredits < 1) {
      const today = L.ymd(Date.now()); const N = st.settings.unlockDays;
      toast(t('scenes.locked', { n: N - (L.streakInfo(st, today).current % N) }));
      return;
    }
    confirmBox(t('scenes.confirm', { name }), t('scenes.pickIt'), () => {
      store.update((s) => { L.chooseScene(s, id); });
      play('unlock', store.get().settings);
      location.hash = L.isCustomId(id) ? '#/draw?id=' + id : '#/';
    });
  }
  const onClick = (e) => {
    const b = e.target.closest('[data-act=choose]');
    if (b) choose(b.dataset.id);
  };
  root.addEventListener('click', onClick);
  const unsub = store.subscribe(render);
  render();
  return () => { unsub(); root.removeEventListener('click', onClick); };
}
