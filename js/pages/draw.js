// 画自己的场景。笔画以矢量方式保存(可撤销、可重绘),同时缓存一张 PNG 给主界面用。
// 支持 Apple Pencil 压感:指针事件的 pressure 决定线条粗细。
import * as store from '../store.js';
import * as L from '../logic.js';
import { t, getLang } from '../i18n.js';
import { EL, CUSTOM_CHOICES, CUSTOM_BIG, CUSTOM_RARE } from '../art.js';
import { esc, ICON, pageHead, sceneName, confirmBox, toast } from '../ui.js';
import { play } from '../sound.js';

const COLORS = ['#2B2140', '#E5484D', '#F5A623', '#F7D63C', '#4FA55B', '#2F9BD9', '#3F6FE0', '#8E5BD9', '#E24DA8', '#8B5E3C', '#FFFFFF'];
const SIZES = [4, 10, 20];
const SW = 744; const W = SW * 3; const H = 500; const SCALE = 2; // 3 屏宽的画布,猫坐中间那屏
const widthOf = (s, p) => s.s * (s.e ? 3 : 1) * (0.35 + 1.3 * p);

function drawSeg(ctx, s, a, b) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
  ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
  if (!b) {
    ctx.beginPath(); ctx.arc(a[0] * SCALE, a[1] * SCALE, (widthOf(s, a[2]) * SCALE) / 2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.lineWidth = widthOf(s, (a[2] + b[2]) / 2) * SCALE;
    ctx.beginPath(); ctx.moveTo(a[0] * SCALE, a[1] * SCALE); ctx.lineTo(b[0] * SCALE, b[1] * SCALE); ctx.stroke();
  }
  ctx.restore();
}
function drawStroke(ctx, s) {
  if (s.p.length === 1) drawSeg(ctx, s, s.p[0], null);
  for (let i = 1; i < s.p.length; i++) drawSeg(ctx, s, s.p[i - 1], s.p[i]);
}

export function mount(root) {
  const q = new URLSearchParams((location.hash.split('?')[1]) || '');
  let id = q.get('id');
  const st0 = store.get();
  if (!L.isCustomId(id)) id = st0.scenes.active && L.isCustomId(st0.scenes.active) ? st0.scenes.active : (st0.scenes.owned.find(L.isCustomId) || 'custom');
  if (id !== 'custom' && !st0.scenes.owned.includes(id)) { location.hash = '#/scenes'; return () => {}; }
  let screenIdx = 1;
  let strokes = JSON.parse(JSON.stringify(store.drawingOf(id).strokes || []));
  const tool = { mode: 'pen', color: COLORS[1], size: 1 };
  let saving = false; let saveTimer = null; let cur = null; let canvas; let ctx;

  function redraw() {
    ctx.clearRect(0, 0, W * SCALE, H * SCALE);
    strokes.forEach((s) => drawStroke(ctx, s));
  }
  function flush() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!canvas) return Promise.resolve();
    saving = true;
    return store.saveDrawing(id, JSON.parse(JSON.stringify(strokes)), strokes.length ? canvas.toDataURL('image/png') : '').then(() => { saving = false; });
  }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 500); }

  function build() {
    const st = store.get(); const S = st.settings; const c = L.customCfg(st, id); const lang = getLang();
    const tabs = st.scenes.owned.filter(L.isCustomId);
    if (!tabs.includes(id)) tabs.unshift(id);
    const slots = [0, 1, 2].map((i) => {
      const names = st.subjects.filter((_, k) => k % 3 === i).map((s) => L.subjectName(s, lang)).join(' / ');
      const cur2 = (c.map && c.map[i]) || CUSTOM_CHOICES[i];
      return `<div class="elrow"><span>${esc(names)}</span><div class="elopts">${CUSTOM_CHOICES.map((k) => `<button class="elopt${k === cur2 ? ' on' : ''}" data-act="el" data-slot="${i}" data-k="${k}" aria-pressed="${k === cur2}"><svg viewBox="-24 -24 48 48" aria-hidden="true">${EL[k]}</svg></button>`).join('')}</div></div>`;
    }).join('');
    const pickRow = (label, key, list) => `<div class="elrow"><span>${esc(label)}</span><div class="elopts">${list.map((k) => `<button class="elopt${k === c[key] ? ' on' : ''}" data-act="el" data-slot="${key}" data-k="${k}" aria-pressed="${k === c[key]}"><svg viewBox="-24 -24 48 48" aria-hidden="true">${EL[k]}</svg></button>`).join('')}</div></div>`;
    root.innerHTML = `<div class="page drawpage">${pageHead(t('draw.title'))}
      <div class="drawgrid">
        <div class="tools">
          <button class="tool${tool.mode === 'pen' ? ' on' : ''}" data-act="pen" aria-pressed="${tool.mode === 'pen'}">${ICON.pencil}<span>${esc(t('draw.pen'))}</span></button>
          <button class="tool${tool.mode === 'eraser' ? ' on' : ''}" data-act="eraser" aria-pressed="${tool.mode === 'eraser'}">${ICON.eraser}<span>${esc(t('draw.eraser'))}</span></button>
          <button class="tool" data-act="undo">${ICON.undo}<span>${esc(t('draw.undo'))}</span></button>
          <button class="tool" data-act="clear">${ICON.trash}<span>${esc(t('draw.clear'))}</span></button>
        </div>
        <div class="canvascol">
          ${tabs.length > 1 ? `<div class="seg ctabs">${tabs.map((k) => `<button class="${k === id ? 'on' : ''}" data-act="tab" data-id="${k}">${esc(sceneName(k))}</button>`).join('')}</div>` : ''}
          <div class="canvaswrap">
            <div class="cscroll" id="cs"><div class="cinner" style="background:${c.bgColor}">
              <canvas id="cv" width="${W * SCALE}" height="${H * SCALE}" aria-label="${esc(t('draw.canvas'))}"></canvas>
              <div class="catzone" aria-hidden="true"><span>${esc(t('draw.catHere'))}</span></div></div></div>
            <div class="pencilhint">${ICON.pencil}<span>${esc(t('draw.pressure'))}</span></div>
          </div>
          <div class="screenbtns"><span>${esc(t('draw.screens'))}</span>${[0, 1, 2].map((i) => `<button class="btn card-btn small${i === screenIdx ? ' on' : ''}" data-act="screen" data-i="${i}">${esc(t('draw.screen' + i))}</button>`).join('')}</div>
        </div>
        <div class="dside">
          <div class="card"><h2>${esc(t('draw.colors'))}</h2>
            <div class="swatches">${COLORS.map((k) => `<button class="sw${k === tool.color && tool.mode === 'pen' ? ' on' : ''}" data-act="color" data-c="${k}" style="background:${k}" aria-label="${k}"></button>`).join('')}
              <label class="sw rainbow" aria-label="${esc(t('theme.custom'))}"><input type="color" id="pick" value="${tool.color}"></label></div>
            <div class="sizes">${SIZES.map((z, i) => `<button class="size${i === tool.size ? ' on' : ''}" data-act="size" data-i="${i}" aria-label="${esc(t('draw.size' + i))}" aria-pressed="${i === tool.size}"><i style="width:${6 + i * 9}px;height:${6 + i * 9}px"></i></button>`).join('')}</div>
            <label class="field row"><span>${esc(t('draw.bg'))}</span><input type="color" id="bgc" value="${c.bgColor}"></label>
            <label class="switch"><input type="checkbox" id="penonly" ${S.penOnly ? 'checked' : ''}><b></b><span>${esc(t('draw.penOnly'))}</span></label>
          </div>
          <details class="card grows"><summary>${esc(t('draw.grows'))}</summary>${slots}${pickRow(t('draw.big'), 'big', CUSTOM_BIG)}${pickRow(t('draw.rare'), 'rare', CUSTOM_RARE)}<p class="note">${esc(t('draw.growsHint'))}</p></details>
          <button class="btn pri big" data-act="finish">${esc(t('draw.finish'))}</button>
        </div>
      </div></div>`;
    canvas = root.querySelector('#cv'); ctx = canvas.getContext('2d');
    redraw();
    const cs = root.querySelector('#cs');
    cs.scrollLeft = screenIdx * cs.clientWidth;
    cs.addEventListener('scroll', () => { screenIdx = Math.round(cs.scrollLeft / Math.max(1, cs.clientWidth)); root.querySelectorAll('[data-act=screen]').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === screenIdx)); });
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }

  const pt = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;
    return [Math.round(((e.clientX - r.left) / r.width) * W * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * H * 10) / 10, Math.round(p * 100) / 100];
  };
  function down(e) {
    if (store.get().settings.penOnly && e.pointerType === 'touch') return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    cur = { id: e.pointerId, c: tool.color, s: SIZES[tool.size], e: tool.mode === 'eraser' ? 1 : 0, p: [pt(e)] };
    drawSeg(ctx, cur, cur.p[0], null);
  }
  function move(e) {
    if (!cur || e.pointerId !== cur.id) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach((ev) => {
      const q = pt(ev); const last = cur.p[cur.p.length - 1];
      if (Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) < 0.4) return;
      cur.p.push(q); drawSeg(ctx, cur, last, q);
    });
  }
  function up(e) {
    if (!cur || e.pointerId !== cur.id) return;
    const { c, s, e: er, p } = cur; cur = null;
    strokes.push({ c, s, e: er, p });
    scheduleSave();
  }

  const act = {
    pen() { tool.mode = 'pen'; build(); },
    eraser() { tool.mode = 'eraser'; build(); },
    color(b) { tool.color = b.dataset.c; tool.mode = 'pen'; build(); },
    size(b) { tool.size = Number(b.dataset.i); build(); },
    undo() { strokes.pop(); redraw(); scheduleSave(); },
    clear() { if (!strokes.length) return; confirmBox(t('draw.clearAsk'), t('draw.clear'), () => { strokes = []; redraw(); flush(); }); },
    tab(b) { flush().then(() => { location.hash = '#/draw?id=' + b.dataset.id; }); },
    screen(b) {
      screenIdx = Number(b.dataset.i);
      const cs = root.querySelector('#cs'); cs.scrollTo({ left: screenIdx * cs.clientWidth, behavior: 'smooth' });
    },
    el(b) {
      const k = b.dataset.slot;
      store.update((s) => { const c2 = L.customCfg(s, id); if (k === 'big' || k === 'rare') c2[k] = b.dataset.k; else { c2.map = c2.map || {}; c2.map[k] = b.dataset.k; } });
    },
    async finish() {
      await flush();
      store.update((s) => { L.chooseScene(s, id); s.scenes.active = id; });
      toast(t('draw.saved')); location.hash = '#/';
    }
  };
  const onClick = (e) => { const b = e.target.closest('[data-act]'); if (b && act[b.dataset.act]) act[b.dataset.act](b, e); };
  const onInput = (e) => {
    if (e.target.id === 'pick') { tool.color = e.target.value; tool.mode = 'pen'; }
    if (e.target.id === 'bgc') { root.querySelector('.cinner').style.background = e.target.value; saving = true; store.update((s) => { L.customCfg(s, id).bgColor = e.target.value; }); saving = false; scheduleSave(); }
  };
  const onChange = (e) => {
    if (e.target.id === 'penonly') { saving = true; store.update((s) => { s.settings.penOnly = e.target.checked; }); saving = false; }
  };
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  const unsub = store.subscribe(() => { if (!saving) build(); });
  build();
  return () => {
    unsub();
    if (saveTimer) flush();
    root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('change', onChange);
  };
}
