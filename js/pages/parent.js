// 家长页:目标 / 解锁 / 休息日 / 补签卡 / 科目 / 记录 / 声音 / 语言 / 备份。
// 从主界面长按锁头 3 秒进入;离开这一页后需要重新长按。
import * as store from '../store.js';
import * as L from '../logic.js';
import { t, getLang, wd, fmtDay } from '../i18n.js';
import { esc, ICON, pageHead, confirmBox, toast } from '../ui.js';
import { createState } from '../logic.js';
import { openSubjectEditor } from './subjects.js';

const STEPPERS = [
  { k: 'goalMin', min: 10, max: 180, step: 5, unit: 'unit.min', label: 'parent.goal' },
  { k: 'unlockDays', min: 2, max: 30, step: 1, unit: 'unit.day', label: 'parent.unlock' },
  { k: 'minSession', min: 1, max: 20, step: 1, unit: 'unit.min', label: 'parent.minSession' },
  { k: 'maxSmallPerDay', min: 1, max: 10, step: 1, unit: 'unit.count', label: 'parent.maxSmall' },
  { k: 'makeupEvery', min: 2, max: 30, step: 1, unit: 'unit.day', label: 'parent.makeupEvery' },
  { k: 'makeupMax', min: 1, max: 5, step: 1, unit: 'unit.card', label: 'parent.makeupMax' },
  { k: 'makeupWindow', min: 1, max: 14, step: 1, unit: 'unit.day', label: 'parent.makeupWindow' },
  { k: 'charDays', min: 2, max: 60, step: 1, unit: 'unit.day', label: 'parent.charDays' }
];

export function mount(root) {
  let ok = false;
  try { ok = sessionStorage.getItem('studycat.parent') === '1'; } catch (e) { ok = false; }
  if (!ok) { location.hash = '#/'; return () => {}; }

  function render() {
    const st = store.get(); const S = st.settings; const lang = getLang(); const today = L.ymd(Date.now());
    const step = (cfg) => `<div class="srow"><span class="sl">${esc(t(cfg.label))}</span><button class="stp" data-act="step" data-k="${cfg.k}" data-d="-${cfg.step}" aria-label="${esc(t('common.less'))}">${ICON.minus}</button><b class="sv" id="v-${cfg.k}">${S[cfg.k]} ${esc(t(cfg.unit))}</b><button class="stp" data-act="step" data-k="${cfg.k}" data-d="${cfg.step}" aria-label="${esc(t('common.more'))}">${ICON.plus}</button></div>`;
    const rest = [1, 2, 3, 4, 5, 6, 0].map((d) => `<button class="day${S.restWeekdays.includes(d) ? ' on' : ''}" data-act="rest" data-d="${d}" aria-pressed="${S.restWeekdays.includes(d)}">${esc(wd(d))}</button>`).join('');
    const subj = st.subjects.map((s) => `<button class="chip subj on" data-act="editsubj" data-id="${s.id}" style="--c:${s.color}"><i></i>${esc(L.subjectName(s, lang))}${ICON.edit}</button>`).join('');
    const subjName = (id) => { const s = st.subjects.find((q) => q.id === id); return s ? L.subjectName(s, lang) : t('parent.deleted'); };
    const recs = [...st.sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)).slice(0, 30)
      .map((r) => `<div class="rec"><span>${esc(fmtDay(r.date))}</span><span>${esc(subjName(r.subjectId))}</span><span>${esc(r.start ? new Date(r.start).toTimeString().slice(0, 5) + '–' + new Date(r.end).toTimeString().slice(0, 5) : t('parent.manual'))}</span><b>${esc(t('fmt.mins', { n: r.minutes }))}</b><button class="stp small" data-act="delrec" data-id="${r.id}" aria-label="${esc(t('common.delete'))}">${ICON.trash}</button></div>`).join('');
    root.innerHTML = `<div class="page parentpage">${pageHead(t('parent.title'))}
      <div class="pgrid2">
        <div class="col">
          <div class="card"><h2>${esc(t('parent.goals'))}</h2>${step(STEPPERS[0])}${step(STEPPERS[1])}${step(STEPPERS[7])}${step(STEPPERS[2])}${step(STEPPERS[3])}</div>
          <div class="card"><h2>${esc(t('parent.restMakeup'))}</h2>
            <div class="srow"><span class="sl">${esc(t('parent.restDays'))}</span><div class="days">${rest}</div></div>
            ${step(STEPPERS[4])}${step(STEPPERS[5])}${step(STEPPERS[6])}</div>
          <div class="card"><h2>${esc(t('parent.subjects'))}</h2><div class="chips">${subj}<button class="chip add" data-act="addsubj">+ ${esc(t('common.add'))}</button></div></div>
        </div>
        <div class="col">
          <div class="card"><div class="row-h"><h2>${esc(t('parent.records'))}</h2><span class="tag">${esc(t('parent.recent'))}</span></div>
            <div class="recs">${recs || `<p class="note">${esc(t('parent.noRecords'))}</p>`}</div>
            <form class="addrec" data-act="addrec"><input type="date" id="r-date" value="${today}" max="${today}" aria-label="${esc(t('parent.date'))}">
              <select id="r-subj" aria-label="${esc(t('parent.subject'))}">${st.subjects.map((s) => `<option value="${s.id}">${esc(L.subjectName(s, lang))}</option>`).join('')}</select>
              <input type="number" id="r-min" min="1" max="180" value="30" aria-label="${esc(t('parent.minutes'))}"><button class="btn card-btn" type="submit">${esc(t('parent.addRecord'))}</button></form>
            <p class="note">${esc(t('parent.addRecordHint'))}</p></div>
          <div class="card"><h2>${esc(t('parent.soundLang'))}</h2>
            <label class="switch"><input type="checkbox" id="snd" ${S.sound ? 'checked' : ''}><b></b><span>${esc(t('parent.sound'))}</span></label>
            <label class="srow"><span class="sl">${esc(t('parent.volume'))}</span><input type="range" id="vol" min="0" max="1" step="0.05" value="${S.volume}" style="flex:1"></label>
            <div class="srow"><span class="sl">${esc(t('common.language'))}</span><div class="seg"><button class="${st.lang === 'zh' ? 'on' : ''}" data-act="lang" data-l="zh">中文</button><button class="${st.lang === 'en' ? 'on' : ''}" data-act="lang" data-l="en">English</button></div></div></div>
          <div class="card"><h2>${esc(t('parent.backup'))}</h2>
            <div class="btnrow"><button class="btn pri" data-act="export">${esc(t('parent.export'))}</button><label class="btn card-btn">${esc(t('parent.import'))}<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn ghost danger" data-act="reset">${esc(t('parent.reset'))}</button></div>
            <p class="note">${esc(t('parent.backupHint'))}</p></div>
        </div>
      </div></div>`;
  }

  const act = {
    step(b) {
      const cfg = STEPPERS.find((c) => c.k === b.dataset.k); const d = Number(b.dataset.d);
      store.update((s) => { s.settings[cfg.k] = Math.max(cfg.min, Math.min(cfg.max, s.settings[cfg.k] + d)); });
    },
    rest(b) {
      const d = Number(b.dataset.d);
      store.update((s) => { const a = s.settings.restWeekdays; s.settings.restWeekdays = a.includes(d) ? a.filter((x) => x !== d) : [...a, d]; });
    },
    editsubj(b) { openSubjectEditor(b.dataset.id); },
    addsubj() { openSubjectEditor(); },
    delrec(b) { confirmBox(t('parent.delAsk'), t('common.delete'), () => store.update((s) => L.deleteSession(s, Number(b.dataset.id)))); },
    lang(b) { store.update((s) => { s.lang = b.dataset.l; }); },
    export() {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'study-cat-backup-' + L.ymd(Date.now()) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast(t('parent.exported'));
    },
    reset() {
      confirmBox(t('parent.resetAsk'), t('parent.resetOk'), async () => {
        store.replace(createState()); await store.clearDrawings();
        toast(t('parent.resetDone')); location.hash = '#/scenes';
      });
    }
  };
  const onClick = (e) => { const b = e.target.closest('button[data-act]'); if (b && act[b.dataset.act]) act[b.dataset.act](b, e); };
  const onSubmit = (e) => {
    if (!e.target.matches('.addrec')) return;
    e.preventDefault();
    const date = root.querySelector('#r-date').value; const subjectId = root.querySelector('#r-subj').value;
    const minutes = Number(root.querySelector('#r-min').value);
    if (!date || !(minutes > 0)) return;
    store.update((s) => L.addManualSession(s, { date, subjectId, minutes }));
    toast(t('parent.recordAdded'));
  };
  const onChange = async (e) => {
    if (e.target.id === 'snd') store.update((s) => { s.settings.sound = e.target.checked; });
    if (e.target.id === 'vol') store.update((s) => { s.settings.volume = Number(e.target.value); });
    if (e.target.id === 'imp' && e.target.files[0]) {
      try { await store.importJSON(await e.target.files[0].text()); toast(t('parent.imported')); } catch (err) { toast(t('parent.importBad')); }
    }
  };
  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  root.addEventListener('change', onChange);
  const unsub = store.subscribe(render);
  render();
  return () => {
    unsub();
    root.removeEventListener('click', onClick); root.removeEventListener('submit', onSubmit); root.removeEventListener('change', onChange);
    try { sessionStorage.removeItem('studycat.parent'); } catch (e) { /* 忽略 */ }
  };
}
