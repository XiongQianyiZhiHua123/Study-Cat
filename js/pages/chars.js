// 选角色页:8 个角色。第一次自选 1 个,之后每连续学满 N 天可以再选一个(N 在家长页设置)。
import * as store from '../store.js';
import * as L from '../logic.js';
import { t } from '../i18n.js';
import { CHAR_ORDER, charThumb } from '../chars.js';
import { esc, ICON, pageHead, confirmBox, toast } from '../ui.js';
import { play } from '../sound.js';

export function mount(root) {
  function render() {
    const st = store.get(); const today = L.ymd(Date.now());
    const credits = st.rewards.charCredits; const owned = st.chars.owned; const active = st.chars.active;
    const info = L.streakInfo(st, today); const N = st.settings.charDays;
    const first = owned.length === 0;
    const filled = N > 0 ? info.current % N : 0; const left = N - filled;
    let banner;
    if (first) banner = `<b>${esc(t('chars.first'))}</b><span>${esc(t('chars.firstSub'))}</span>`;
    else if (credits > 0) banner = `<b>${esc(t('chars.credit', { n: credits }))}</b><span>${esc(t('chars.creditSub'))}</span>`;
    else banner = `<b>${esc(t('chars.next', { n: left }))}</b><span>${esc(t('chars.nextSub', { n: N }))}</span>`;
    const dots = credits > 0 || first || N < 1 ? '' : `<div class="dots" role="img" aria-label="${filled}/${N}">${Array.from({ length: Math.min(N, 31) }, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('')}</div>`;
    const cards = CHAR_ORDER.map((id) => {
      const isOwned = owned.includes(id); const isActive = active === id;
      let badge = ''; let overlay = '';
      if (isActive) badge = `<span class="badge on">${esc(t('scenes.using'))}</span>`;
      else if (isOwned) badge = `<span class="badge">${esc(t('scenes.owned'))}</span>`;
      else if (credits > 0) badge = `<span class="badge pick">${esc(t('scenes.canPick'))}</span>`;
      else overlay = `<div class="lock">${ICON.lock}</div>`;
      return `<div class="scard${isActive ? ' active' : ''}">
        <button class="thumb chthumb" data-act="choose" data-id="${id}" aria-label="${esc(t('char.' + id))}">${charThumb(id)}${badge}${overlay}</button>
        <b>${esc(t('char.' + id))}</b><span>${esc(t('chars.sub.' + id))}</span></div>`;
    }).join('');
    root.innerHTML = `<div class="page chars">${pageHead(t('chars.title'))}
      <div class="card banner"><div class="gift">${ICON.paw}</div><div class="banner-t">${banner}</div><div class="grow"></div>${dots}</div>
      <div class="sgrid cgrid">${cards}</div></div>`;
  }
  function choose(id) {
    const st = store.get(); const name = t('char.' + id);
    if (st.chars.owned.includes(id)) {
      store.update((s) => { L.chooseChar(s, id); });
      toast(t('chars.switched', { name }));
      location.hash = '#/';
      return;
    }
    if (st.rewards.charCredits < 1) {
      const N = st.settings.charDays; const today = L.ymd(Date.now());
      toast(t('chars.locked', { n: N - (L.streakInfo(st, today).current % N) }));
      return;
    }
    confirmBox(t('chars.confirm', { name }), t('scenes.pickIt'), () => {
      store.update((s) => { L.chooseChar(s, id); });
      play('unlock', store.get().settings);
      location.hash = '#/';
    });
  }
  const onClick = (e) => { const b = e.target.closest('[data-act=choose]'); if (b) choose(b.dataset.id); };
  root.addEventListener('click', onClick);
  const unsub = store.subscribe(render);
  render();
  return () => { unsub(); root.removeEventListener('click', onClick); };
}
