// 配色页:6 套预设 + 5 个部分各自挑(含系统取色器)+ 存成"我的配色"
import * as store from '../store.js';
import { t } from '../i18n.js';
import { SCHEME_IDS, SCHEMES, ROLES, ROLE_OPTIONS, resolve, applyTheme } from '../theme.js';
import { esc, ICON, sceneSVG, pageHead, toast } from '../ui.js';

const same = (a, b) => ROLES.every((r) => a[r].toLowerCase() === b[r].toLowerCase());

export function mount(root) {
  let skip = false;
  function render() {
    const st = store.get(); const th = st.theme; const cur = resolve(th);
    const sid = st.scenes.active || 'night';
    const presets = SCHEME_IDS.map((id) => {
      const c = SCHEMES[id]; const on = !th.custom && th.preset === id;
      return `<button class="pre${on ? ' on' : ''}" data-act="preset" data-id="${id}" aria-pressed="${on}"><b>${esc(t('scheme.' + id))}</b><span class="strip">${ROLES.map((r) => `<i style="background:${c[r]}"></i>`).join('')}</span></button>`;
    }).join('');
    const rows = ROLES.map((r) => `<div class="role"><span class="role-l">${esc(t('role.' + r))}</span><div class="dotsrow">${ROLE_OPTIONS[r].map((c) => `<button class="dot${c.toLowerCase() === cur[r].toLowerCase() ? ' on' : ''}" data-act="role" data-r="${r}" data-c="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${c.toLowerCase() === cur[r].toLowerCase()}"></button>`).join('')}
      <label class="dot rainbow" aria-label="${esc(t('theme.custom'))}"><input type="color" data-r="${r}" value="${cur[r]}"></label></div></div>`).join('');
    const mine = th.mine.map((m, i) => `<span class="mine"><button class="pre small${same(m.colors, cur) ? ' on' : ''}" data-act="usemine" data-i="${i}"><span class="strip">${ROLES.map((r) => `<i style="background:${m.colors[r]}"></i>`).join('')}</span></button><button class="x" data-act="delmine" data-i="${i}" aria-label="${esc(t('common.delete'))}">×</button></span>`).join('');
    root.innerHTML = `<div class="page themepage">${pageHead(t('theme.title'))}
      <div class="two">
        <div class="card preview"><h2>${esc(t('theme.preview'))}</h2>
          <div class="pv"><div class="pv-chips"><span class="chip stat">${ICON.flame}<span>${esc(t('home.streak', { n: 5 }))}</span></span><span class="chip stat">${ICON.star}<span>58</span></span></div>
            ${sceneSVG(st, sid, { cat: true }, 'class="pv-scene" aria-hidden="true"')}
            <div class="pv-row"><span class="bigbtn go mini">${ICON.play}<span>${esc(t('home.start'))}</span></span>
              <div class="pv-week">${['goal', 'goal', 'rest', 'goal', 'today', 'future', 'future'].map((k) => `<div class="cell ${k}">${k === 'goal' ? ICON.paw : (k === 'rest' ? ICON.moon : '')}</div>`).join('')}</div></div>
            <div class="track"><div class="fill" style="width:60%"></div></div></div>
          <p class="note">${esc(t('theme.auto'))}</p></div>
        <div class="col">
          <div class="card"><h2>${esc(t('theme.presets'))}</h2><div class="pgrid">${presets}</div></div>
          <div class="card"><div class="row-h"><h2>${esc(t('theme.mine'))}</h2><div class="grow"></div><button class="btn pri" data-act="save">${esc(t('theme.save'))}</button></div>
            ${rows}<div class="minerow">${mine}</div><p class="note">${esc(t('theme.rainbowHint'))}</p></div>
        </div>
      </div></div>`;
  }
  const setCustom = (role, color, silent) => {
    skip = !!silent;
    store.update((s) => { const base = resolve(s.theme); base[role] = color; s.theme.custom = base; s.theme.preset = null; });
    skip = false;
  };
  const onClick = (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act; const st = store.get();
    if (a === 'preset') store.update((s) => { s.theme.preset = b.dataset.id; s.theme.custom = null; });
    else if (a === 'role') setCustom(b.dataset.r, b.dataset.c);
    else if (a === 'save') {
      const colors = resolve(st.theme);
      store.update((s) => { s.theme.mine = [...s.theme.mine.filter((m) => !same(m.colors, colors)), { colors }].slice(-3); });
      toast(t('theme.saved'));
    } else if (a === 'usemine') store.update((s) => { s.theme.custom = { ...s.theme.mine[Number(b.dataset.i)].colors }; s.theme.preset = null; });
    else if (a === 'delmine') store.update((s) => { s.theme.mine.splice(Number(b.dataset.i), 1); });
  };
  // 系统取色器:拖动时只更新颜色,松手(change)才重画,避免拖动中断
  const onInput = (e) => { if (e.target.matches('input[type=color]')) { setCustom(e.target.dataset.r, e.target.value, true); applyTheme(store.get().theme); } };
  const onChange = (e) => { if (e.target.matches('input[type=color]')) render(); };
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  const unsub = store.subscribe(() => { if (!skip) render(); });
  render();
  return () => { unsub(); root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('change', onChange); };
}
