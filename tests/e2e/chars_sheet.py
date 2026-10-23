"""把 8 个角色在 待机/学习/完成 三种状态下截图拼成一张图,人工检查画得对不对。"""
import json, subprocess, os, threading, http.server, socketserver, functools, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/shots'
fx = json.loads(subprocess.check_output(['node', os.path.join(ROOT, 'tests/e2e/fixture.mjs')], text=True))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); BASE = f'http://127.0.0.1:{srv.server_address[1]}/'
threading.Thread(target=srv.serve_forever, daemon=True).start()
ids = ['cat','dog','fox','wolf','snake','duck','capybara','croc']
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1180, 'height': 820})
    for cid in ids:
        fx['chars'] = {'owned': [cid], 'active': cid}; fx['scenes']['placed'] = {}
        pg.add_init_script("localStorage.setItem('studycat.v1', %s)" % json.dumps(json.dumps(fx)))
        pg.goto(BASE); pg.wait_for_timeout(300)
        for ph in ['ph-idle', 'ph-learn', 'ph-done']:
            pg.evaluate("(ph) => { const s = document.getElementById('scene'); s.className = 'scene ' + ph; }", ph)
            pg.wait_for_timeout(450)
            pg.locator('#scene').screenshot(path=f'{OUT}/ch-{cid}-{ph}.png')
        pg.reload() if False else None
    b.close()
tiles = []
for cid in ids:
    row = [Image.open(f'{OUT}/ch-{cid}-{ph}.png') for ph in ['ph-idle','ph-learn','ph-done']]
    row = [im.crop((int(im.width*.28), int(im.height*.3), int(im.width*.72), im.height)).resize((330, 330*0+int(330*(im.height*.7)/(im.width*.44)))) for im in row]
    tiles.append(row)
h = tiles[0][0].height
S = Image.new('RGB', (330*6, h*4), 'white')
for k, row in enumerate(tiles):
    for j, im in enumerate(row): S.paste(im, ((k % 2)*990 + j*330, (k//2)*h))
S.save(f'{OUT}/chars-sheet.png'); print(S.size)
