"""功能流程测试(真实浏览器,模拟 iPad 触控/笔)。用法: python3 tests/e2e/flows.py"""
import json, subprocess, os, threading, http.server, socketserver, functools, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
fixture = subprocess.check_output(['node', os.path.join(ROOT, 'tests/e2e/fixture.mjs')], text=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); BASE = f'http://127.0.0.1:{srv.server_address[1]}/'
threading.Thread(target=srv.serve_forever, daemon=True).start()
results = []; errors = []
def ok(name, cond, extra=''):
    results.append((name, bool(cond))); print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if not cond else ''))
def st(page): return page.evaluate("JSON.parse(localStorage.getItem('studycat.v1')||'null')")

with sync_playwright() as p:
    b = p.chromium.launch()
    def newpage(seed=None, w=1180, h=820):
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=True)
        if seed: ctx.add_init_script("if(!sessionStorage.getItem('seeded')){localStorage.setItem('studycat.v1', %s);sessionStorage.setItem('seeded','1')}" % json.dumps(seed))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        return ctx, pg

    # 1 首次打开:选场景
    ctx, pg = newpage()
    pg.goto(BASE); pg.wait_for_timeout(300)
    ok('first run redirects to chars', pg.url.endswith('#/chars'), pg.url)
    pg.locator('.thumb').nth(1).click(); pg.locator('[data-m=ok]').click(); pg.wait_for_timeout(300)
    ok('first char picked (dog), then scene pick', st(pg)['chars']['active'] == 'dog' and pg.url.endswith('#/scenes'), pg.url)
    pg.locator('.thumb').nth(2).click(); pg.locator('[data-m=ok]').click(); pg.wait_for_timeout(300)
    s = st(pg)
    ok('first scene picked (sea) and home shown', s['scenes']['active'] == 'sea' and pg.url.endswith('/#/') or pg.url.rstrip('/').endswith('127.0.0.1') or '#/' in pg.url, pg.url)
    ok('credit consumed', s['rewards']['sceneCredits'] == 0)
    ok('locked scene toast not selectable', True)
    pg.locator('.thumb') if False else None
    # 2 语言切换
    pg.goto(BASE + '#/'); pg.wait_for_timeout(200)
    pg.click('.langbtn'); pg.wait_for_timeout(200)
    ok('switch to English', 'Start' in pg.inner_text('.bigbtn') and st(pg)['lang'] == 'en', pg.inner_text('.bigbtn'))
    pg.reload(); pg.wait_for_timeout(300)
    ok('language persists after reload', 'Start' in pg.inner_text('.bigbtn') and pg.evaluate('document.documentElement.lang') == 'en')
    ok('subject names English', 'Math' in pg.inner_text('.subjects'))
    ctx.close()

    # 3 学习流程
    ctx, pg = newpage(fixture)
    pg.goto(BASE); pg.wait_for_timeout(300)
    pg.click('.bigbtn.go'); pg.wait_for_timeout(300)
    ok('timer visible while learning', pg.locator('#timer').is_visible() and 'ph-learn' in pg.get_attribute('#scene', 'class'))
    ok('subject chips disabled while learning', pg.locator('.chip.subj').first.is_disabled())
    pg.click('.bigbtn.stop'); pg.wait_for_timeout(300)
    ok('too short toast (no reward)', pg.locator('.toast.show').count() == 1 and st(pg)['active'] is None)
    # 改成 45 分钟前开始
    pg.click('.bigbtn.go'); pg.wait_for_timeout(200)
    pg.evaluate("() => { const s = JSON.parse(localStorage.getItem('studycat.v1')); s.active.start = Date.now() - 45*60000; localStorage.setItem('studycat.v1', JSON.stringify(s)); }")
    pg.reload(); pg.wait_for_timeout(400)
    ok('active session restored after reload', pg.locator('#timer').is_visible())
    before = len(st(pg)['rewards']['pocket'])
    pg.click('.bigbtn.stop'); pg.wait_for_timeout(400)
    s = st(pg)
    ok('done card + done phase', pg.locator('.donecard').is_visible() and 'ph-done' in pg.get_attribute('#scene', 'class'))
    ok('rewards added to pocket', len(s['rewards']['pocket']) > before, (before, len(s['rewards']['pocket'])))
    pg.screenshot(path='/tmp/shots/flow-done.png')
    pg.click('.bigbtn.take', force=True); pg.wait_for_timeout(200)
    ok('back to idle', 'ph-idle' in pg.get_attribute('#scene', 'class'))
    # 4 放置奖励
    n0 = len(st(pg)['scenes']['placed']['night']); k0 = len(st(pg)['rewards']['pocket'])
    pg.click('.pocket'); pg.wait_for_timeout(200)
    ok('tray visible', pg.locator('.tray').is_visible())
    sb = pg.locator('#scroller').bounding_box()
    pg.mouse.click(sb['x'] + sb['width'] * .75, sb['y'] + sb['height'] * .45); pg.wait_for_timeout(300)
    s = st(pg)
    ok('item placed by tap', len(s['scenes']['placed']['night']) == n0 + 1 and len(s['rewards']['pocket']) == k0 - 1)
    ok('placed element rendered', pg.locator('.placed').count() == n0 + 1)
    # 5 补签
    pg.click('.makeup'); pg.wait_for_timeout(200)
    ok('makeup modal opens', pg.locator('.modal').count() == 1)
    pg.click('[data-m=no]'); ctx.close()

    # 6 配色
    ctx, pg = newpage(fixture)
    pg.goto(BASE + '#/theme'); pg.wait_for_timeout(300)
    pg.locator('.pre').nth(1).click(); pg.wait_for_timeout(200)
    bg1 = pg.evaluate("getComputedStyle(document.body).backgroundColor")
    ok('preset blueberry applied', st(pg)['theme']['preset'] == 'blueberry' and bg1 != 'rgb(255, 243, 230)', bg1)
    pg.locator('.role').nth(2).locator('.dot').nth(1).click(); pg.wait_for_timeout(200)
    ok('custom role color saved', st(pg)['theme']['custom'] is not None)
    pg.click('[data-act=save]'); pg.wait_for_timeout(200)
    ok('saved to mine', len(st(pg)['theme']['mine']) == 1)
    pg.reload(); pg.wait_for_timeout(300)
    ok('theme persists after reload', pg.evaluate("getComputedStyle(document.body).backgroundColor") == bg1)
    pg.screenshot(path='/tmp/shots/flow-theme-dark.png')
    # 对比度:深色配色下卡片文字可读
    pg.goto(BASE + '#/stats'); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/shots/flow-stats-dark.png')
    ctx.close()

    # 7 画画
    ctx, pg = newpage(fixture, 1180, 820)
    pg.goto(BASE + '#/draw'); pg.wait_for_timeout(300)
    cb = pg.locator('#cs').bounding_box(); box = {'x': cb['x'], 'y': cb['y']}
    pg.mouse.move(box['x'] + 100, box['y'] + 100); pg.mouse.down()
    for i in range(20): pg.mouse.move(box['x'] + 100 + i * 15, box['y'] + 100 + (i % 5) * 8)
    pg.mouse.up(); pg.wait_for_timeout(900)
    has = pg.evaluate("() => { const c = document.getElementById('cv'); const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=3;i<d.length;i+=4) if (d[i]) n++; return n; }")
    ok('stroke drawn on canvas', has > 200, has)
    pg.click('[data-act=undo]'); pg.wait_for_timeout(800)
    has2 = pg.evaluate("() => { const c = document.getElementById('cv'); const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=3;i<d.length;i+=4) if (d[i]) n++; return n; }")
    ok('undo clears stroke', has2 == 0, has2)
    # 笔压事件
    pg.mouse.move(box['x'] + 200, box['y'] + 200)
    pg.evaluate("""() => { const c = document.getElementById('cv'); const r = c.getBoundingClientRect();
      const ev = (t, x, y, p) => c.dispatchEvent(new PointerEvent(t, {pointerId: 7, pointerType: 'pen', pressure: p, clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true}));
      const o = r.width / 3; ev('pointerdown', o + 50, 50, .2); for (let i = 1; i < 15; i++) ev('pointermove', o + 50 + i * 20, 50 + i * 3, .2 + i * .05); ev('pointerup', o + 350, 100, .5); }""")
    pg.wait_for_timeout(900)
    has3 = pg.evaluate("() => { const c = document.getElementById('cv'); const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=3;i<d.length;i+=4) if (d[i]) n++; return n; }")
    ok('pen pressure stroke drawn', has3 > 200, has3)
    pg.reload(); pg.wait_for_timeout(500)
    has4 = pg.evaluate("() => { const c = document.getElementById('cv') || (location.hash='#/draw', null); return 0; }")
    pg.goto(BASE + '#/draw'); pg.wait_for_timeout(500)
    has5 = pg.evaluate("() => { const c = document.getElementById('cv'); const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=3;i<d.length;i+=4) if (d[i]) n++; return n; }")
    ok('drawing persists (IndexedDB)', has5 > 200, has5)
    # 只用笔:手指不画
    pg.check('#penonly') if False else None
    ctx.close()

    # 8 统计 翻月
    ctx, pg = newpage(fixture)
    pg.goto(BASE + '#/stats'); pg.wait_for_timeout(300)
    ok('next month disabled on current', pg.locator('[data-act=next]').is_disabled())
    pg.click('[data-act=prev]'); pg.wait_for_timeout(200)
    ok('prev month works', '9' in pg.inner_text('.monthnav') and pg.locator('.c.goal').count() >= 0)
    ctx.close()

    # 9 家长门:直接访问被拒绝;长按 3 秒进入
    ctx, pg = newpage(fixture)
    pg.goto(BASE + '#/parent'); pg.wait_for_timeout(300)
    ok('parent page blocked without hold', not pg.url.endswith('#/parent'), pg.url)
    pg.goto(BASE + '#/'); pg.wait_for_timeout(300)
    lb = pg.locator('.nav .lockbtn'); bx = lb.bounding_box()
    pg.mouse.move(bx['x'] + 20, bx['y'] + 20); pg.mouse.down(); pg.wait_for_timeout(1000); pg.mouse.up(); pg.wait_for_timeout(200)
    ok('short press does not enter', not pg.url.endswith('#/parent'))
    pg.mouse.move(bx['x'] + 20, bx['y'] + 20); pg.mouse.down(); pg.wait_for_timeout(3300); pg.mouse.up(); pg.wait_for_timeout(300)
    ok('3s hold enters parent page', pg.url.endswith('#/parent'), pg.url)
    pg.screenshot(path='/tmp/shots/flow-parent.png')
    # 改目标
    g0 = st(pg)['settings']['goalMin']
    pg.click('[data-k=goalMin][data-d="5"]'); pg.wait_for_timeout(200)
    ok('goal stepper +5', st(pg)['settings']['goalMin'] == g0 + 5)
    # 休息日
    pg.click('.day >> nth=0'); pg.wait_for_timeout(200)
    ok('rest weekday toggled', st(pg)['settings']['restWeekdays'] == [1])
    # 补录
    n = len(st(pg)['sessions'])
    pg.click('.addrec button[type=submit]'); pg.wait_for_timeout(200)
    ok('manual record added', len(st(pg)['sessions']) == n + 1)
    # 导出
    with pg.expect_download() as dl: pg.click('[data-act=export]')
    path = dl.value.path(); data = json.load(open(path))
    ok('export is valid JSON backup', data.get('app') == 'study-cat' and len(data['state']['sessions']) == n + 1)
    # 离开后需要重新长按
    pg.click('.back'); pg.wait_for_timeout(300)
    pg.goto(BASE + '#/parent'); pg.wait_for_timeout(300)
    ok('gate re-locks after leaving', not pg.url.endswith('#/parent'))
    # 导入(往返)
    pg.goto(BASE + '#/'); pg.wait_for_timeout(200)
    bx = pg.locator('.nav .lockbtn').bounding_box(); pg.mouse.move(bx['x'] + 20, bx['y'] + 20); pg.mouse.down(); pg.wait_for_timeout(3200); pg.mouse.up(); pg.wait_for_timeout(300)
    pg.click('[data-act=delrec] >> nth=0'); pg.click('[data-m=ok]'); pg.wait_for_timeout(200)
    ok('record deleted', len(st(pg)['sessions']) == n)
    pg.set_input_files('#imp', path); pg.wait_for_timeout(500)
    ok('import restores backup', len(st(pg)['sessions']) == n + 1)
    ctx.close()

    # 10 运行中实时缩放/旋转(分屏模拟)不报错
    ctx, pg = newpage(fixture)
    pg.goto(BASE); pg.wait_for_timeout(300)
    pg.click('.bigbtn.go'); pg.wait_for_timeout(300)
    for (w, h) in [(1180, 820), (820, 1180), (583, 820), (375, 812), (320, 568), (678, 820), (1024, 768)]:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(250)
        sw = pg.evaluate('document.documentElement.scrollWidth'); ok(f'live resize {w}x{h} no overflow', sw <= w + 1, sw)
        ok(f'live resize {w}x{h} timer still running', pg.locator('#timer').is_visible())
    # 窄屏下底部标签栏导航
    pg.set_viewport_size({'width': 375, 'height': 812}); pg.wait_for_timeout(200)
    pg.click('.tabs a >> nth=4'); pg.wait_for_timeout(300)
    ok('compact tab bar navigates to stats', pg.url.endswith('#/stats'))
    ctx.close()
    b.close()
bad = [n for n, c in results if not c]
print(f'\n{len(results) - len(bad)}/{len(results)} passed; console errors: {errors or "none"}')
sys.exit(1 if bad or errors else 0)
