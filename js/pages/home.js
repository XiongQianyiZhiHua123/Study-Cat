// 主界面:猫咪、计时、奖励、口袋放置、本周印章
import * as store from '../store.js';
import * as L from '../logic.js';
import { t, getLang, wd, fmtDay } from '../i18n.js';
import { esc, ICON, sceneSVG, sceneName, elementIcons, modal, toast, NAV } from '../ui.js';
import { play, unlock } from '../sound.js';
import { pocketIcon, SCENE_BY_ID, sceneElements } from '../art.js';
import { charOf } from '../chars.js';
import { openSubjectEditor } from './subjects.js';

const SCENE_GOAL = 100;
const HOLD_MS = 3000;

export function mount(root) {
  const ui = { dragged: false, phase: store.get().active ? 'learning' : 'idle', placing: false, sel: 0, done: null, pop: -1, prompted: false };
  let tick = null; let holdTimer = null;

  const fmtTime = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const x = s % 60;
    const p = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`;
  };
  const sceneId = () => store.get().scenes.active;

  function liveMinutes() {
    const st = store.get(); const today = L.ymd(Date.now());
    const base = L.dayMinutes(st, today);
    return base + (st.active ? Math.min(L.MAX_SESSION_MIN, Math.floor((Date.now() - st.active.start) / 60000)) : 0);
  }
  function earnedStars(st) {
    return Object.values(st.scenes.placed).reduce((n, a) => n + a.length, 0) + st.rewards.pocket.length;
  }

  function weekCells(st, today) {
    const dow = (L.weekday(today) + 6) % 7;
    const monday = L.addDays(today, -dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = L.addDays(monday, i);
      const stt = L.dayStatus(st, d, today);
      let inner = ''; let cls = 'cell ' + stt;
      if (stt === 'goal' || stt === 'makeup') inner = ICON.paw;
      else if (stt === 'rest') inner = ICON.moon;
      else if (stt === 'today') inner = `<span>${esc(t('home.today'))}</span>`;
      return `<div class="wk"><span class="wk-l">${esc(t('home.weekday', { w: wd((i + 1) % 7) }))}</span><div class="${cls}" ${stt === 'goal' || stt === 'makeup' ? `role="img" aria-label="${esc(t('stats.goalDay'))}"` : ''}>${inner}</div></div>`;
    }).join('');
  }

  function doneCard() {
    const st = store.get(); const d = ui.done; if (!d) return '';
    const sid = sceneId();
    const lines = d.events.map((e) => {
      if (e.type === 'small') return `<li><span class="mini">${pocketIcon(sid, st, { kind: 'small', slot: e.slot })}</span>${esc(t('done.small'))}</li>`;
      if (e.type === 'big') return `<li><span class="mini">${pocketIcon(sid, st, { kind: 'big' })}</span>${esc(t('done.big', { n: st.settings.goalMin }))}</li>`;
      if (e.type === 'rare') return `<li><span class="mini">${pocketIcon(sid, st, { kind: 'rare' })}</span>${esc(t('done.rare', { n: e.streak }))}</li>`;
      if (e.type === 'unlock') return `<li><span class="mini">${ICON.scene}</span>${esc(t('done.unlock'))} <button class="btn mini-btn" data-act="goscenes">${esc(t('done.pickNow'))}</button></li>`;
      if (e.type === 'unlockChar') return `<li><span class="mini">${ICON.paw}</span>${esc(t('done.unlockChar'))} <button class="btn mini-btn" data-act="gochars">${esc(t('done.pickNow'))}</button></li>`;
      if (e.type === 'makeup') return `<li><span class="mini">${ICON.ticket}</span>${esc(t('done.makeup'))}</li>`;
      return '';
    }).join('');
    return `<div class="donecard"><h2>${esc(t('done.title'))}</h2><p>${esc(t('done.minutes', { n: d.minutes }))}</p><ul>${lines || `<li>${esc(t('done.nothing'))}</li>`}</ul></div>`;
  }

  function tray(st) {
    if (!ui.placing) return '';
    const sid = sceneId();
    const items = st.rewards.pocket.map((it, i) => `<button class="tray-item${i === ui.sel ? ' on' : ''}" data-act="pick" data-i="${i}" aria-label="${esc(t('home.pocketItem', { n: i + 1 }))}" aria-pressed="${i === ui.sel}">${pocketIcon(sid, st, it)}</button>`).join('');
    return `<div class="tray"><div class="tray-items">${items}</div><span class="tray-hint">${esc(t('home.placeHint'))}</span><button class="btn card-btn" data-act="closeplace">${esc(t('common.done'))}</button></div>`;
  }

  function render() {
    const oldSc = root.querySelector('#scroller');
    const ratio = oldSc && oldSc.clientWidth ? oldSc.scrollLeft / oldSc.clientWidth : 1;
    const st = store.get(); const lang = getLang(); const now = Date.now(); const today = L.ymd(now);
    const S = st.settings; const info = L.streakInfo(st, today);
    const sid = sceneId() || 'night';
    const learning = ui.phase === 'learning'; const done = ui.phase === 'done';
    const mins = liveMinutes(); const pct = Math.min(100, Math.round((mins / S.goalMin) * 100));
    const cls = learning ? 'ph-learn' : (done ? 'ph-done' : 'ph-idle');
    const subj = st.subjects.find((s) => s.id === (st.active ? st.active.subjectId : st.lastSubject)) || st.subjects[0];
    const subjHtml = st.subjects.map((s) => `<button class="chip subj${s.id === subj.id ? ' on' : ''}" data-act="subj" data-id="${s.id}" style="--c:${s.color}" aria-pressed="${s.id === subj.id}"${learning ? ' disabled' : ''}><i></i>${esc(L.subjectName(s, lang))}</button>`).join('');
    const scenePlaced = L.sceneProgress(st, sid);
    const sceneLabel = sceneName(sid);
    const pocket = st.rewards.pocket.length;
    const bubble = learning ? t('bubble.learn') : (done ? t('bubble.done') : t('bubble.idle'));
    const makeupN = st.rewards.makeupCards;

    const bigBtn = learning
      ? `<button class="bigbtn stop" data-act="stop">${ICON.check}<span>${esc(t('home.stop'))}</span></button>`
      : (done ? `<button class="bigbtn take" data-act="reset">${ICON.star}<span>${esc(t('home.take'))}</span></button>`
        : `<button class="bigbtn go" data-act="start">${ICON.play}<span>${esc(t('home.start'))}</span></button>`);

    root.innerHTML = `<div class="home">
      <header class="topbar">
        <div class="chip stat streak">${ICON.flame}<span>${esc(t('home.streak', { n: info.current }))}</span></div>
        <div class="chip prog"><span id="prog-text">${esc(t('home.today.progress', { m: mins, g: S.goalMin }))}</span><div class="track"><div class="fill" id="prog-fill" style="width:${pct}%"></div></div></div>
        <div class="grow"></div>
        <div class="chip stat stars">${ICON.star}<span>${earnedStars(st)}</span></div>
        <button class="chip stat langbtn" data-act="lang" aria-label="${esc(t('common.language'))}">${lang === 'zh' ? 'EN' : '中'}</button>
        <nav class="nav" aria-label="${esc(t('nav.label'))}">${NAV.map((n) => `<a class="navbtn" href="${n.href}" aria-label="${esc(t(n.key))}">${ICON[n.icon]}<span>${esc(t(n.key))}</span></a>`).join('')}
          <button class="navbtn lockbtn" data-act="lock" aria-label="${esc(t('nav.parent'))}">${ICON.lock}<span>${esc(t('nav.parent'))}</span><i class="ring"></i></button></nav>
      </header>
      <section class="main">
        <div class="scene ${cls}${ui.placing ? ' placing' : ''}" id="scene">
          <div class="scroller" id="scroller">${sceneSVG(st, sid, { wide: true, mist: true, cat: true, elements: true, fx: true, pop: ui.pop }, `role="img" aria-label="${esc(t('home.sceneAlt', { name: sceneLabel }))}" class="pano"`)}</div>
          <button class="pan l" data-act="pan" data-d="-1" aria-label="${esc(t('home.panLeft'))}">${ICON.back}</button><button class="pan r" data-act="pan" data-d="1" aria-label="${esc(t('home.panRight'))}">${ICON.next}</button>
          <button class="caption" data-act="hint"><b>${esc(sceneLabel)}<i class="q">?</i></b><span>${esc(t('home.sceneCount', { n: scenePlaced, g: SCENE_GOAL }))}</span></button>
          <div class="bubble">${esc(bubble)}</div>
          ${ui.placing ? tray(st) : `<button class="pocket" data-act="pocket">${ICON.star}<span>${esc(t('home.pocket', { n: pocket }))}</span><em>${esc(t('home.pocketHint'))}</em></button>`}
          ${done ? doneCard() : ''}
        </div>
        <aside class="side">
          <div class="card subjects"><h2>${esc(t('home.whatToday'))}</h2><div class="chips">${subjHtml}${learning ? '' : `<button class="chip add" data-act="addsubj">+ ${esc(t('common.add'))}</button>`}</div></div>
          <div class="btnzone">
            ${learning ? `<div class="timer-box"><span class="timer-l">${esc(t('home.learning', { s: L.subjectName(subj, lang) }))}</span><span class="timer" id="timer">${fmtTime(now - st.active.start)}</span></div>` : ''}
            ${bigBtn}
            ${!learning && !done ? `<span class="hint">${esc(t('home.startHint'))}</span>` : ''}
          </div>
        </aside>
      </section>
      <section class="week card">
        <b class="wk-title">${esc(t('home.week'))}</b>
        <div class="wk-grid">${weekCells(st, today)}</div>
        <button class="btn makeup" data-act="makeup">${ICON.ticket}<span>${esc(t('home.makeup', { n: makeupN }))}</span></button>
      </section>
      <nav class="tabs" aria-label="${esc(t('nav.label'))}">${NAV.map((n) => `<a href="${n.href}">${ICON[n.icon]}<span>${esc(t(n.key))}</span></a>`).join('')}<button data-act="lock" class="lockbtn">${ICON.lock}<span>${esc(t('nav.parent'))}</span><i class="ring"></i></button></nav>
    </div>`;
    const sc2 = root.querySelector('#scroller');
    if (sc2) sc2.scrollLeft = ratio * sc2.clientWidth;
  }

  function updateLive() {
    const st = store.get();
    if (!st.active) return;
    const el = root.querySelector('#timer'); if (el) el.textContent = fmtTime(Date.now() - st.active.start);
    const mins = liveMinutes(); const g = st.settings.goalMin;
    const pt = root.querySelector('#prog-text'); if (pt) pt.textContent = t('home.today.progress', { m: mins, g });
    const pf = root.querySelector('#prog-fill'); if (pf) pf.style.width = Math.min(100, Math.round((mins / g) * 100)) + '%';
    if (!ui.prompted && Date.now() - st.active.start > 120 * 60000) {
      ui.prompted = true;
      modal(`<p class="modal-msg">${esc(t('home.stillLearning'))}</p><div class="modal-actions"><button class="btn ghost" data-m="keep">${esc(t('home.keep'))}</button><button class="btn pri" data-m="end">${esc(t('home.endNow'))}</button></div>`, (el2, close) => {
        el2.querySelector('[data-m=keep]').onclick = close;
        el2.querySelector('[data-m=end]').onclick = () => { close(); act.stop(); };
      });
    }
  }
  function startTick() { stopTick(); tick = setInterval(updateLive, 1000); }
  function stopTick() { if (tick) clearInterval(tick); tick = null; }

  const act = {
    start() {
      unlock();
      const st = store.get();
      const sid = st.subjects.some((s) => s.id === st.lastSubject) ? st.lastSubject : st.subjects[0].id;
      ui.phase = 'learning'; ui.placing = false; ui.prompted = false;
      store.update((s) => L.startSession(s, sid, Date.now()));
      play('start', store.get().settings);
      startTick();
    },
    stop() {
      let res;
      ui.phase = 'done';
      stopTick();
      store.update((s) => { res = L.finishSession(s, Date.now()); });
      if (!res.ok) {
        ui.phase = 'idle';
        render();
        toast(res.reason === 'short' ? t('home.tooShort', { n: store.get().settings.minSession }) : t('home.noSession'));
        return;
      }
      ui.done = res;
      const S = store.get().settings;
      play('finish', S);
      setTimeout(() => play(charOf(store.get().chars.active).sound, S), 450);
      setTimeout(() => play('reward', S), 1100);
      render();
    },
    reset() { ui.phase = 'idle'; ui.done = null; render(); },
    subj(b) {
      if (ui.phase === 'learning') return;
      play('tap', store.get().settings);
      store.update((s) => { s.lastSubject = b.dataset.id; });
    },
    addsubj() { openSubjectEditor(); },
    lang() { store.update((s) => { s.lang = s.lang === 'zh' ? 'en' : 'zh'; }); },
    pocket() {
      const n = store.get().rewards.pocket.length;
      if (!n) { toast(t('home.pocketEmpty')); return; }
      ui.placing = true; ui.sel = 0; render();
    },
    pick(b) { ui.sel = Number(b.dataset.i); render(); },
    closeplace() { ui.placing = false; render(); },
    goscenes() { location.hash = '#/scenes'; },
    gochars() { location.hash = '#/chars'; },
    makeup() {
      const st = store.get(); const today = L.ymd(Date.now());
      const opts = [];
      for (let i = 1; i <= st.settings.makeupWindow; i++) {
        const d = L.addDays(today, -i);
        if (L.canUseMakeup(st, d, today)) opts.push(d);
      }
      let body;
      if (st.rewards.makeupCards < 1) body = `<p class="modal-msg">${esc(t('makeup.none', { n: st.settings.makeupEvery }))}</p>`;
      else if (!opts.length) body = `<p class="modal-msg">${esc(t('makeup.noDays', { n: st.settings.makeupWindow }))}</p>`;
      else body = `<p class="modal-msg">${esc(t('makeup.pick'))}</p><div class="list">${opts.map((d) => `<button class="btn card-btn wide" data-d="${d}">${esc(fmtDay(d))}</button>`).join('')}</div>`;
      modal(`<h2>${esc(t('makeup.title'))}</h2>${body}<div class="modal-actions"><span class="grow"></span><button class="btn ghost" data-m="no">${esc(t('common.close'))}</button></div>`, (el, close) => {
        el.querySelector('[data-m=no]').onclick = close;
        el.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => {
          let r; store.update((s) => { r = L.useMakeup(s, b.dataset.d, today); });
          close(); play('reward', store.get().settings);
          toast(t('makeup.done'));
          if (r && r.events.some((e) => e.type === 'unlock')) toast(t('done.unlock'));
        }; });
      });
    },
    pan(b) {
      const sc = root.querySelector('#scroller'); if (!sc) return;
      const cur = Math.round(sc.scrollLeft / sc.clientWidth);
      sc.scrollTo({ left: Math.max(0, Math.min(2, cur + Number(b.dataset.d))) * sc.clientWidth, behavior: 'smooth' });
    },
    hint() {
      const st = store.get(); const sid = sceneId(); const e = sceneElements(sid, st); const lang = getLang();
      const subj = [0, 1, 2].map((i) => st.subjects.filter((_, k) => k % 3 === i).map((x) => L.subjectName(x, lang)).join(' / '));
      const row = (icons, text) => `<div class="hrow"><span class="hic">${icons}</span><span>${esc(text)}</span></div>`;
      modal(`<h2>${esc(t('hint.title', { name: sceneName(sid) }))}</h2>
        ${e.small.map((k, i) => row(elementIcons([k]), t('hint.small', { s: subj[i] || '' }))).join('')}
        ${row(elementIcons([e.big]), t('hint.big', { n: st.settings.goalMin }))}
        ${row(elementIcons([e.rare]), t('hint.rare', { d: L.RARE_AT.join(' / ') }))}
        <p class="note">${esc(t('hint.pano', { a: L.RIGHT_AT, b: L.LEFT_AT }))}</p>
        <div class="modal-actions"><span class="grow"></span><button class="btn pri" data-m="no">${esc(t('common.close'))}</button></div>`, (el, close) => { el.querySelector('[data-m=no]').onclick = close; });
    },
    lock() { /* 长按在下面单独处理 */ }
  };

  const onClick = (e) => {
    const b = e.target.closest('[data-act]');
    if (b && b.dataset.act !== 'lock' && act[b.dataset.act]) { act[b.dataset.act](b, e); return; }
    // 放置奖励 / 点角色:点画面
    const sc = e.target.closest('.pano');
    if (!sc || ui.dragged || e.target.closest('.tray')) return;
    const r = sc.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * L.WORLD_W; const y = Math.min(480, ((e.clientY - r.top) / r.height) * 500);
    if (ui.placing) {
      const st = store.get();
      if (!st.rewards.pocket.length) return;
      if (!L.canPlaceAt(st, sceneId(), x)) { toast(t('home.sideLocked', { n: x < L.SCREEN_W ? L.screensOpen(st, sceneId()).leftNeed : L.screensOpen(st, sceneId()).rightNeed })); return; }
      store.update((s2) => { L.placeFromPocket(s2, ui.sel, x, y); });
      ui.pop = (store.get().scenes.placed[sceneId()] || []).length - 1;
      play('place', store.get().settings);
      if (!store.get().rewards.pocket.length) ui.placing = false;
      ui.sel = Math.min(ui.sel, Math.max(0, store.get().rewards.pocket.length - 1));
      render();
    } else if (Math.abs(x - L.CENTER_X) < 95 && y > 290) {
      poke();
    }
  };
  let pokeTimer = null;
  function poke() {
    const el = root.querySelector('#scene'); if (!el) return;
    unlock();
    el.classList.remove('poke'); void el.getBoundingClientRect(); el.classList.add('poke');
    play(charOf(store.get().chars.active).sound, store.get().settings);
    clearTimeout(pokeTimer); pokeTimer = setTimeout(() => el.classList.remove('poke'), 1100);
  }
  // 鼠标拖动全景(手指和笔用系统自带的滑动)
  let drag = null;
  const dragStart = (e) => {
    const sc = e.target.closest('#scroller');
    if (!sc || e.pointerType !== 'mouse' || ui.placing) return;
    drag = { x: e.clientX, left: sc.scrollLeft, sc, moved: false };
  };
  const dragMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 6) { drag.moved = true; ui.dragged = true; }
    if (drag.moved) drag.sc.scrollLeft = drag.left - dx;
  };
  const dragEnd = () => { if (drag) { drag = null; setTimeout(() => { ui.dragged = false; }, 0); } };
  // 家长入口:长按 3 秒
  const holdStart = (e) => {
    const b = e.target.closest('.lockbtn'); if (!b) return;
    b.classList.add('holding');
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      b.classList.remove('holding');
      try { sessionStorage.setItem('studycat.parent', '1'); } catch (err) { /* 忽略 */ }
      location.hash = '#/parent';
    }, HOLD_MS);
  };
  const holdEnd = (e) => {
    if (e.type === 'pointerleave' && !(e.target.classList && e.target.classList.contains('lockbtn'))) return;
    const b = e.target.closest && e.target.closest('.lockbtn'); if (!b) return;
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; b.classList.remove('holding'); if (e.type === 'pointerup') toast(t('nav.holdHint')); }
  };
  root.addEventListener('click', onClick);
  root.addEventListener('pointerdown', holdStart);
  root.addEventListener('pointerdown', dragStart);
  window.addEventListener('pointermove', dragMove);
  window.addEventListener('pointerup', dragEnd);
  root.addEventListener('pointerup', holdEnd);
  root.addEventListener('pointercancel', holdEnd);
  root.addEventListener('pointerleave', holdEnd, true);

  const unsub = store.subscribe(() => render());
  render();
  if (store.get().active) startTick();
  const onVis = () => { if (!document.hidden) updateLive(); };
  document.addEventListener('visibilitychange', onVis);

  return () => {
    stopTick(); clearTimeout(holdTimer); unsub();
    document.removeEventListener('visibilitychange', onVis);
    root.removeEventListener('click', onClick);
    root.removeEventListener('pointerdown', holdStart);
    root.removeEventListener('pointerdown', dragStart);
    window.removeEventListener('pointermove', dragMove);
    window.removeEventListener('pointerup', dragEnd);
    clearTimeout(pokeTimer);
    root.removeEventListener('pointerup', holdEnd);
    root.removeEventListener('pointercancel', holdEnd);
    root.removeEventListener('pointerleave', holdEnd, true);
  };
}
void SCENE_BY_ID;
