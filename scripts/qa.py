# QA screenshots for the bilingual site.
# usage: python3 scripts/qa.py OUTDIR
import os, sys
from playwright.sync_api import sync_playwright

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
BASE = 'http://localhost:4173'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']

def page(b, w, h, mobile=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page()
    logs = []
    pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: logs.append(f'PAGEERROR {e}'))
    return ctx, pg, logs

def goto_section(pg, sel, offset=0):
    pg.evaluate("""([sel, off]) => { const el = document.querySelector(sel);
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off); }""", [sel, offset])
    pg.wait_for_timeout(1600)

with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    report = []

    for lang, path in (('fr', '/'), ('en', '/en/')):
        ctx, pg, logs = page(b, 1440, 900)
        pg.goto(BASE + path); pg.wait_for_timeout(6500)
        pg.screenshot(path=f'{out}/{lang}-desktop-hero.png')
        goto_section(pg, '#membership', -70); pg.screenshot(path=f'{out}/{lang}-desktop-membership.png')
        goto_section(pg, '#join', -90); pg.screenshot(path=f'{out}/{lang}-desktop-join.png')
        goto_section(pg, '#events', -70); pg.screenshot(path=f'{out}/{lang}-desktop-events.png')
        goto_section(pg, '#partner', -70); pg.screenshot(path=f'{out}/{lang}-desktop-partner.png')
        goto_section(pg, '.footer', 0); pg.screenshot(path=f'{out}/{lang}-desktop-footer.png')
        report.append((lang, 'desktop', logs[:]))
        ctx.close()

    # French projects panels (pinned horizontal scroll) at a few points
    ctx, pg, logs = page(b, 1440, 900)
    pg.goto(BASE + '/'); pg.wait_for_timeout(6000)
    top = pg.evaluate("document.querySelector('#projects').getBoundingClientRect().top + scrollY")
    for i, dy in enumerate((0, 900, 1900, 2900, 3700)):
        pg.evaluate(f'window.scrollTo(0, {top + dy})'); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{out}/fr-desktop-projects-{i}.png')
    report.append(('fr', 'projects', logs[:]))
    ctx.close()

    # Mobile French
    ctx, pg, logs = page(b, 390, 844, mobile=True)
    pg.goto(BASE + '/'); pg.wait_for_timeout(6500)
    pg.screenshot(path=f'{out}/fr-mobile-hero.png')
    pg.click('.nav-toggle'); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{out}/fr-mobile-menu.png')
    pg.click('.nav-toggle'); pg.wait_for_timeout(400)
    goto_section(pg, '#join', -70); pg.screenshot(path=f'{out}/fr-mobile-join.png')
    goto_section(pg, '#partner', -70); pg.screenshot(path=f'{out}/fr-mobile-partner.png')
    report.append(('fr', 'mobile', logs[:]))
    ctx.close()

    # Language switch: FR page at Membership -> click EN -> should land on /en/#membership without the loader
    ctx, pg, logs = page(b, 1440, 900)
    pg.goto(BASE + '/'); pg.wait_for_timeout(6000)
    goto_section(pg, '#membership', -70)
    pg.click('.lang-opt[data-lang="en"]')
    pg.wait_for_load_state('load'); pg.wait_for_timeout(300)
    loader_visible = pg.evaluate("(() => { const l = document.querySelector('.loader'); return !!l && getComputedStyle(l).display !== 'none'; })()")
    pg.wait_for_timeout(1500)
    state = pg.evaluate("""() => ({ url: location.href, lang: document.documentElement.lang,
        cookie: document.cookie, membershipTop: Math.round(document.querySelector('#membership').getBoundingClientRect().top),
        current: document.querySelector('.lang-opt[aria-current]')?.dataset.lang })""")
    pg.screenshot(path=f'{out}/switch-en-membership.png')
    # and back to French from the partner section
    goto_section(pg, '#partner', -70)
    pg.click('.lang-opt[data-lang="fr"]')
    pg.wait_for_load_state('load'); pg.wait_for_timeout(1800)
    back = pg.evaluate("""() => ({ url: location.href, lang: document.documentElement.lang, cookie: document.cookie,
        partnerTop: Math.round(document.querySelector('#partner').getBoundingClientRect().top) })""")
    pg.screenshot(path=f'{out}/switch-fr-partner.png')
    report.append(('switch', f'loaderVisibleAfterSwitch={loader_visible} -> {state} | back -> {back}', logs[:]))
    ctx.close()

    # Form status strings in French (submit is intercepted so nothing is sent)
    ctx, pg, logs = page(b, 1440, 900)
    pg.route('**/*', lambda route: route.fulfill(status=200, body='ok') if route.request.method == 'POST' else route.continue_())
    pg.goto(BASE + '/'); pg.wait_for_timeout(5500)
    goto_section(pg, '#join', -90)
    pg.fill('form[name=membership] input[name=name]', 'Test Méridien')
    pg.fill('form[name=membership] input[name=email]', 'test@example.com')
    pg.check('form[name=membership] input[value="Full year (€25)"]', force=True)
    pg.check('form[name=membership] input[name=hoodie][value=Yes]', force=True)
    pg.wait_for_timeout(300)
    size_visible = pg.is_visible('.field-size')
    pg.select_option('form[name=membership] select[name=size]', 'M')
    posted = []
    pg.on('request', lambda r: posted.append(r.post_data) if r.method == 'POST' else None)
    pg.click('form[name=membership] button[type=submit]'); pg.wait_for_timeout(1200)
    status = pg.text_content('form[name=membership] .form-status')
    pg.screenshot(path=f'{out}/fr-form-success.png')
    report.append(('form', f'sizeVisible={size_visible} status={status!r} posted={posted}', logs[:]))
    ctx.close()

    b.close()
    for r in report:
        print(r[0], '|', r[1], '|', r[2] if r[2] else 'no console errors')
