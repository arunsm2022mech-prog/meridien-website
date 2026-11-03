import sys, asyncio, os
from playwright.sync_api import sync_playwright
url,out=sys.argv[1],sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1440; h=int(sys.argv[4]) if len(sys.argv)>4 else 900
scroll=int(sys.argv[5]) if len(sys.argv)>5 else 0
with sync_playwright() as p:
    import os
    b=p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY',''),'bypass':'localhost,127.0.0.1'}, args=['--ignore-certificate-errors','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']); pg=b.new_page(viewport={'width':w,'height':h})
    logs=[]; pg.on('console',lambda m: logs.append(m.type+': '+m.text)); pg.on('pageerror',lambda e: logs.append('ERR '+str(e)))
    pg.goto(url); pg.wait_for_timeout(int(os.environ.get('WAIT','3500')))
    if scroll:
        for i in range(0,scroll,300):
            pg.mouse.wheel(0,300); pg.wait_for_timeout(60)
        pg.wait_for_timeout(1500)
    pg.screenshot(path=out); print('\n'.join(logs[:20])); b.close()
