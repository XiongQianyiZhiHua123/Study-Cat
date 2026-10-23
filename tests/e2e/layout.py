"""多尺寸布局测试:iPad 全屏/竖放/分屏/Slide Over。检查 1)没有横向溢出 2)关键按钮可见 3)无控制台报错,并截图。
用法: python3 tests/e2e/layout.py [输出目录]"""
import json, subprocess, sys, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/shots'
os.makedirs(OUT, exist_ok=True)
fixture = subprocess.check_output(['node', os.path.join(ROOT, 'tests/e2e/fixture.mjs')], text=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Q, directory=ROOT)
srv = socketserver.TCPServer(('127.0.0.1', 0), handler); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}/'

SIZES = [('ipad-land-1366', 1366, 1024), ('ipad-land-1180', 1180, 820), ('ipad-land-1024', 1024, 768), ('ipad-port-820', 820, 1180),
         ('ipad-port-744', 744, 1133), ('split-678', 678, 820), ('split-583', 583, 820), ('split-507', 507, 820),
         ('slide-375', 375, 812), ('slide-320', 320, 568), ('land-short', 1180, 500)]
PAGES = [('home', ''), ('chars', '#/chars'), ('scenes', '#/scenes'), ('theme', '#/theme'), ('draw', '#/draw'), ('stats', '#/stats')]
fails = []; errors = []

def check(page, name):
    ov = page.evaluate("""() => { const d = document.documentElement; const bad = [];
      document.querySelectorAll('#app *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.bars,.recs,.tray-items,.modal,.scroller,.cscroll') && !(e.closest('svg') && e.tagName !== 'svg')) bad.push(e.className && e.className.baseVal === undefined ? e.className : e.tagName); });
      return {sw: d.scrollWidth, iw: innerWidth, bad: [...new Set(bad)].slice(0,6)}; }""")
    if ov['sw'] > ov['iw'] + 1 or ov['bad']:
        fails.append(f"{name}: horizontal overflow {ov}")

with sync_playwright() as p:
    b = p.chromium.launch()
    for sid, w, h in SIZES:
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=True, is_mobile=w < 700, device_scale_factor=1)
        ctx.add_init_script("if(!localStorage.getItem('studycat.v1')) localStorage.setItem('studycat.v1', %s)" % json.dumps(fixture))
        page = ctx.new_page()
        page.on('pageerror', lambda e, s=sid: errors.append(f'{s}: {e}'))
        page.on('console', lambda m, s=sid: errors.append(f'{s}: {m.text}') if m.type == 'error' else None)
        for pn, hash_ in PAGES:
            page.goto(BASE + hash_); page.wait_for_timeout(350)
            name = f'{sid}/{pn}'
            check(page, name)
            if pn == 'home':
                for sel in ['.bigbtn', '.scene', '.week']:
                    box = page.locator(sel).first.bounding_box()
                    if not box or box['width'] < 40: fails.append(f'{name}: {sel} missing')
                # 大按钮应当在不滚动或滚动一次即可点到
                if sid in ('ipad-land-1366', 'ipad-land-1180', 'ipad-land-1024'):
                    bb = page.locator('.bigbtn').first.bounding_box()
                    if bb['y'] + bb['height'] > h: fails.append(f'{name}: start button below fold ({bb})')
            page.screenshot(path=f'{OUT}/{sid}-{pn}.png')
        ctx.close()
    b.close()
print('\n'.join(fails) or 'layout: no overflow / missing controls')
print('console errors:', errors or 'none')
