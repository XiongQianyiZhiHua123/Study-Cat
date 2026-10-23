// 科目的新增 / 修改 / 删除小弹窗(主页的"+添加"和家长页共用)
import * as store from '../store.js';
import { t } from '../i18n.js';
import { esc, modal, toast } from '../ui.js';

const COLORS = ['#3F6FE0', '#E08A12', '#D6408F', '#17806F', '#6B4FD8', '#C2570C', '#2F9BD9', '#4CC26B'];

export function openSubjectEditor(id) {
  const st = store.get();
  const cur = st.subjects.find((s) => s.id === id);
  const nm = cur ? (typeof cur.name === 'string' ? { zh: cur.name, en: cur.name } : cur.name) : { zh: '', en: '' };
  let color = cur ? cur.color : COLORS[st.subjects.length % COLORS.length];
  const html = `<h2>${esc(cur ? t('subj.edit') : t('subj.add'))}</h2>
    <label class="field"><span>${esc(t('subj.nameZh'))}</span><input id="sj-zh" maxlength="12" value="${esc(nm.zh || '')}"></label>
    <label class="field"><span>${esc(t('subj.nameEn'))}</span><input id="sj-en" maxlength="18" value="${esc(nm.en || '')}"></label>
    <div class="swatches" role="group" aria-label="${esc(t('subj.color'))}">${COLORS.map((c) => `<button type="button" class="sw${c === color ? ' on' : ''}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
    <div class="modal-actions">${cur && st.subjects.length > 1 ? `<button class="btn ghost danger" data-m="del">${esc(t('common.delete'))}</button>` : ''}<span class="grow"></span><button class="btn ghost" data-m="no">${esc(t('common.cancel'))}</button><button class="btn pri" data-m="ok">${esc(t('common.save'))}</button></div>`;
  modal(html, (el, close) => {
    el.querySelectorAll('.sw').forEach((b) => { b.onclick = () => { color = b.dataset.c; el.querySelectorAll('.sw').forEach((x) => x.classList.toggle('on', x === b)); }; });
    el.querySelector('[data-m=no]').onclick = close;
    const del = el.querySelector('[data-m=del]');
    if (del) del.onclick = () => {
      store.update((s) => {
        s.subjects = s.subjects.filter((x) => x.id !== id);
        if (s.lastSubject === id) s.lastSubject = s.subjects[0].id;
      });
      close();
    };
    el.querySelector('[data-m=ok]').onclick = () => {
      let zh = el.querySelector('#sj-zh').value.trim(); let en = el.querySelector('#sj-en').value.trim();
      if (!zh && !en) { toast(t('subj.needName')); return; }
      zh = zh || en; en = en || zh;
      store.update((s) => {
        if (cur) { const x = s.subjects.find((q) => q.id === id); x.name = { zh, en }; x.color = color; } else {
          const newId = 'c' + s.nextId++;
          s.subjects.push({ id: newId, name: { zh, en }, color });
          s.lastSubject = newId;
        }
      });
      close();
    };
  });
}
