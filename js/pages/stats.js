// 统计页:月历(爪印)、汇总数字、按科目叠色的每日柱状图
import * as store from '../store.js';
import * as L from '../logic.js';
import { t, getLang, wd } from '../i18n.js';
import { esc, ICON, pageHead } from '../ui.js';

export function mount(root) {
  let offset = 0; // 0 = 本月

  const hm = (min) => {
    const h = Math.floor(min / 60); const m = min % 60;
    return h ? t('fmt.hm', { h, m }) : t('fmt.m', { m });
  };

  function render() {
    const st = store.get(); const lang = getLang();
    const today = L.ymd(Date.now());
    const [ty, tm] = today.split('-').map(Number);
    let y = ty; let m = tm + offset;
    while (m < 1) { m += 12; y--; }
    while (m > 12) { m -= 12; y++; }
    const md = L.monthData(st, y, m, today);
    const goal = st.settings.goalMin;
    const yMax = Math.max(60, Math.ceil((Math.max(md.max, goal) + 5) / 10) * 10);

    const heads = Array.from({ length: 7 }, (_, i) => `<span>${esc(wd((i + 1) % 7))}</span>`).join('');
    const blanks = Array.from({ length: md.offset }, () => '<span class="c blank"></span>').join('');
    const cells = md.days.map((d) => {
      const k = d.status;
      const inner = (k === 'goal' || k === 'makeup') ? ICON.paw : (k === 'rest' ? ICON.moon : `<span>${d.day}</span>`);
      const lab = k === 'goal' || k === 'makeup' ? t('stats.goalDay') : '';
      return `<span class="c ${k}" ${lab ? `role="img" aria-label="${esc(d.day + ' ' + lab)}"` : ''}>${inner}</span>`;
    }).join('');

    const subjTotals = st.subjects.map((s) => {
      const n = md.days.reduce((a, d) => a + (d.bySubject[s.id] || 0), 0);
      return `<span class="lg"><i style="background:${s.color}"></i>${esc(L.subjectName(s, lang))} ${esc(hm(n))}</span>`;
    }).join('');

    const bars = md.days.map((d) => {
      const segs = st.subjects.map((s) => {
        const v = d.bySubject[s.id] || 0;
        return v ? `<i style="height:${(v / yMax) * 100}%;background:${s.color}"></i>` : '';
      }).join('');
      const title = `${d.date}: ${hm(d.minutes)}`;
      return `<div class="bar" title="${esc(title)}">${d.status === 'rest' ? `<span class="rest">${ICON.moon}</span>` : ''}<div class="stack">${segs}</div></div>`;
    }).join('');
    const labels = md.days.map((d) => `<span class="${d.date === today ? 'today' : ''}${d.day % 5 === 1 ? '' : ' minor'}">${d.day}</span>`).join('');

    root.innerHTML = `<div class="page statspage">${pageHead(t('stats.title'), `<div class="monthnav"><button class="btn card-btn round" data-act="prev" aria-label="${esc(t('stats.prev'))}">${ICON.back}</button><b>${esc(t('fmt.month', { y, m }))}</b><button class="btn card-btn round" data-act="next" aria-label="${esc(t('stats.next'))}" ${offset >= 0 ? 'disabled' : ''}>${ICON.next}</button></div>`)}
      <div class="statsgrid">
        <div class="card cal"><h2>${esc(t('stats.prints'))}</h2><div class="calgrid"><div class="calhead">${heads}</div><div class="caldays">${blanks}${cells}</div></div>
          <div class="legend"><span class="lg"><i class="lgpaw">${ICON.paw}</i>${esc(t('stats.goalDay'))}</span><span class="lg"><i class="lgpart"></i>${esc(t('stats.partDay'))}</span><span class="lg"><i class="lgmoon">${ICON.moon}</i>${esc(t('stats.restDay'))}</span></div></div>
        <div class="tiles">
          <div class="card tile"><span>${esc(t('stats.goalDays'))}</span><b>${esc(t('fmt.days', { n: md.goalDays }))}</b><em>${esc(t('stats.goalOf', { n: goal }))}</em></div>
          <div class="card tile"><span>${esc(t('stats.best'))}</span><b>${esc(t('fmt.days', { n: md.best }))}</b><em>${esc(t('stats.restKeeps'))}</em></div>
          <div class="card tile"><span>${esc(t('stats.total'))}</span><b>${esc(hm(md.total))}</b><em>${esc(t('stats.studyDays', { n: md.studyDays }))}</em></div>
          <div class="card tile"><span>${esc(t('stats.avg'))}</span><b>${esc(t('fmt.mins', { n: md.avg }))}</b><em>${esc(t('stats.max', { n: md.max }))}</em></div>
        </div>
        <div class="card chart"><div class="chart-h"><h2>${esc(t('stats.daily'))}</h2><div class="grow"></div>${subjTotals}</div>
          <div class="plot"><div class="goalline" style="bottom:calc(${(goal / yMax) * 100}% )"><span>${esc(t('stats.goalLine', { n: goal }))}</span></div><div class="bars">${bars}</div></div>
          <div class="xlabels">${labels}</div></div>
      </div></div>`;
  }
  const onClick = (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    if (b.dataset.act === 'prev') { offset--; render(); }
    if (b.dataset.act === 'next' && offset < 0) { offset++; render(); }
  };
  root.addEventListener('click', onClick);
  const unsub = store.subscribe(render);
  render();
  return () => { unsub(); root.removeEventListener('click', onClick); };
}
