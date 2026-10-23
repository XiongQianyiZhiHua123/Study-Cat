// 画一个自己的小装饰:在小方格里画,保存后就会作为这个位置的装饰出现在场景里(透明背景)。
import * as store from '../store.js';
import * as L from '../logic.js';
import { t } from '../i18n.js';
import { esc, ICON, modal, toast } from '../ui.js';

const COLORS = ['#2B2140', '#E5484D', '#F5A623', '#F7D63C', '#4FA55B', '#2F9BD9', '#3F6FE0', '#8E5BD9', '#E24DA8', '#8B5E3C', '#FFFFFF'];
const SIZES = [5, 11, 20];
const N = 192;

export function openIconEditor(sceneId, key) {
  const c0 = L.customCfg(store.get(), sceneId);
  const base = c0.icons[key] || '';
  const tool = { color: COLORS[1], size: 1, eraser: false };
  let strokes = []; let cur = null; let baseImg = null;
  const html = `<h2>${esc(t('icon.title'))}</h2>
    <div class="iconpad"><canvas id="ic" width="${N}" height="${N}" aria-label="${esc(t('icon.title'))}"></canvas></div>
    <p class="note">${esc(t('icon.hint'))}</p>
    <div class="swatches" id="ic-col">${COLORS.map((k) => `<button class="sw${k === tool.color ? ' on' : ''}" data-c="${k}" style="background:${k}" aria-label="${k}"></button>`).join('')}</div>
    <div class="sizes" id="ic-sz">${SIZES.map((z, i) => `<button class="size${i === tool.size ? ' on' : ''}" data-i="${i}" aria-label="${esc(t('draw.size' + i))}"><i style="width:${6 + i * 9}px;height:${6 + i * 9}px"></i></button>`).join('')}
      <button class="size" id="ic-er" aria-pressed="false" aria-label="${esc(t('draw.eraser'))}">${ICON.eraser}</button>
      <button class="size" id="ic-un" aria-label="${esc(t('draw.undo'))}">${ICON.undo}</button>
      <button class="size" id="ic-cl" aria-label="${esc(t('draw.clear'))}">${ICON.trash}</button></div>
    <div class="modal-actions"><span class="grow"></span><button class="btn ghost" data-m="no">${esc(t('common.cancel'))}</button><button class="btn pri" data-m="ok">${esc(t('common.save'))}</button></div>`;
  modal(html, (el, close) => {
    const cv = el.querySelector('#ic'); const ctx = cv.getContext('2d');
    const seg = (s, a, b) => {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over'; ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
      const w = s.s * (s.e ? 2.2 : 1) * (0.5 + p2(a, b));
      if (!b) { ctx.beginPath(); ctx.arc(a[0], a[1], w / 2, 0, Math.PI * 2); ctx.fill(); } else { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.restore();
    };
    const p2 = (a, b) => (b ? (a[2] + b[2]) / 2 : a[2]);
    const redraw = () => {
      ctx.clearRect(0, 0, N, N);
      if (baseImg) ctx.drawImage(baseImg, 0, 0, N, N);
      strokes.forEach((s) => { if (s.p.length === 1) seg(s, s.p[0], null); for (let i = 1; i < s.p.length; i++) seg(s, s.p[i - 1], s.p[i]); });
    };
    if (base) { baseImg = new Image(); baseImg.onload = redraw; baseImg.src = base; }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * N, ((e.clientY - r.top) / r.height) * N, e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5]; };
    cv.addEventListener('pointerdown', (e) => {
      if (store.get().settings.penOnly && e.pointerType === 'touch') return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      cur = { id: e.pointerId, c: tool.color, s: SIZES[tool.size], e: tool.eraser ? 1 : 0, p: [pt(e)] }; seg(cur, cur.p[0], null);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!cur || e.pointerId !== cur.id) return; e.preventDefault();
      const q = pt(e); const last = cur.p[cur.p.length - 1]; cur.p.push(q); seg(cur, last, q);
    });
    const up = (e) => { if (!cur || e.pointerId !== cur.id) return; strokes.push(cur); cur = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    el.querySelector('#ic-col').addEventListener('click', (e) => {
      const b = e.target.closest('.sw'); if (!b) return;
      tool.color = b.dataset.c; tool.eraser = false;
      el.querySelectorAll('#ic-col .sw').forEach((x) => x.classList.toggle('on', x === b));
      el.querySelector('#ic-er').classList.remove('on');
    });
    el.querySelector('#ic-sz').addEventListener('click', (e) => {
      const b = e.target.closest('.size'); if (!b) return;
      if (b.dataset.i !== undefined) { tool.size = Number(b.dataset.i); el.querySelectorAll('#ic-sz .size[data-i]').forEach((x) => x.classList.toggle('on', x === b)); }
    });
    el.querySelector('#ic-er').onclick = (e) => { tool.eraser = !tool.eraser; e.currentTarget.classList.toggle('on', tool.eraser); e.currentTarget.setAttribute('aria-pressed', tool.eraser); };
    el.querySelector('#ic-un').onclick = () => { strokes.pop(); redraw(); };
    el.querySelector('#ic-cl').onclick = () => { strokes = []; baseImg = null; redraw(); };
    el.querySelector('[data-m=no]').onclick = close;
    el.querySelector('[data-m=ok]').onclick = () => {
      const d = ctx.getImageData(0, 0, N, N).data; let any = false;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 8) { any = true; break; }
      if (!any) { toast(t('icon.empty')); return; }
      const png = cv.toDataURL('image/png');
      store.update((s) => { const c = L.customCfg(s, sceneId); c.icons[key] = png; c.useIcon[key] = true; });
      close(); toast(t('draw.saved'));
    };
  });
}
