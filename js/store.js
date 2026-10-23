// 状态存储:主数据放 localStorage;画作(体积大)放 IndexedDB。
import { createState, normalize } from './logic.js';

const KEY = 'studycat.v1';
let state = createState();
const subs = new Set();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? normalize(JSON.parse(raw)) : createState();
  } catch (e) {
    state = createState();
  }
  return state;
}
export const get = () => state;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 存储满了或被禁用:继续运行 */ }
}
export function update(fn) {
  fn(state);
  save();
  subs.forEach((f) => f(state));
}
export function replace(obj) {
  state = normalize(obj);
  save();
  subs.forEach((f) => f(state));
}
export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
export function requestPersist() {
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* 忽略 */ }
}

/* ---------- 画作 (IndexedDB):每张自己的画布一份,按场景 id 存 ---------- */
export const drawings = {}; // id -> { strokes, png }
export const drawingOf = (id) => drawings[id] || { strokes: [], png: '' };
const DRAW_IDS = ['custom', 'custom2', 'custom3', 'custom4', 'custom5'];

function idb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('no idb'));
    const req = indexedDB.open('studycat', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function loadDrawing() {
  try {
    const db = await idb();
    for (const id of DRAW_IDS) {
      const v = await new Promise((res) => {
        const r = db.transaction('kv').objectStore('kv').get(id);
        r.onsuccess = () => res(r.result); r.onerror = () => res(null);
      });
      if (v) drawings[id] = { strokes: v.strokes || [], png: v.png || '' };
    }
  } catch (e) { /* 没有 IndexedDB 就当没有画作 */ }
  return drawings;
}
export async function saveDrawing(id, strokes, png) {
  drawings[id] = { strokes, png };
  try {
    const db = await idb();
    await new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put({ strokes, png }, id);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  } catch (e) { /* 忽略 */ }
  subs.forEach((f) => f(state));
}
export async function clearDrawings() {
  for (const id of DRAW_IDS) await saveDrawing(id, [], '');
}

/* ---------- 备份 ---------- */
export function exportJSON() {
  return JSON.stringify({ app: 'study-cat', exportedAt: new Date().toISOString(), state, drawings }, null, 1);
}
export async function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'study-cat' || !data.state) throw new Error('bad file');
  replace(data.state);
  if (data.drawings) for (const id of DRAW_IDS) if (data.drawings[id]) await saveDrawing(id, data.drawings[id].strokes || [], data.drawings[id].png || '');
}
