import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { zh } from '../js/locales/zh.js';
import { en } from '../js/locales/en.js';

function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }

test('zh and en have the same keys, same placeholders', () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k in zh) assert.equal(ph(zh[k]), ph(en[k]), k);
});
test('every static t() key used in code exists', () => {
  const src = walk('js').filter((f) => f.endsWith('.js') && !f.includes('locales')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const keys = new Set([...src.matchAll(/\bt\('([\w.]+)'/g)].map((m) => m[1]));
  const missing = [...keys].filter((k) => !(k in zh) && !Object.keys(zh).some((z) => z.startsWith(k)) && k !== 'key');
  assert.deepEqual(missing, []);
  const dyn = ['scene.', 'scenes.sub.', 'scheme.', 'role.', 'wd.'];
  const ids = ['night','garden','sea','forest','candy','sky','snow','dino','castle','farm'];
  for (const i of ids) { assert.ok(zh['scene.' + i]); assert.ok(zh['scenes.sub.' + i]); }
  void dyn;
});
test('角色名和说明齐全', () => {
  for (const c of ['cat','dog','fox','wolf','snake','duck','capybara','croc']) { assert.ok(zh['char.' + c] && en['char.' + c]); assert.ok(zh['chars.sub.' + c] && en['chars.sub.' + c]); }
});
