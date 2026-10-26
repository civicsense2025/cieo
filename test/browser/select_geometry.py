"""Select distribution regression; synthetic data, loopback only, one browser at a time.
Build first. CIEO_ESBUILD must point to an existing esbuild installation.
Run: python3 test/browser/select_geometry.py --output /absolute/evidence [--headed]
"""
import argparse, functools, http.server, json, os, pathlib, subprocess, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=pathlib.Path)
parser.add_argument('--headed', action='store_true')
parser.add_argument('--dist', type=pathlib.Path, default=ROOT/'dist')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
esbuild = os.environ['CIEO_ESBUILD']
fixture = '''import React from 'react';
import { createRoot } from 'react-dom/client';
import { Select } from 'cieo/controls';
const rtl = document.documentElement.dir === 'rtl';
const options = rtl ? [
 {value:'private',label:'لا يمكن إلا لأعضاء المجموعة الذين وافقت عليهم صراحةً الاطلاع على إجابتك بعد إرسالها ومراجعتها'},
 {value:'disabled',label:'خيار غير متاح',disabled:true},
 {value:'shared',label:'شارك إجابتك مع جميع الأعضاء المسجلين حاليًا في المجموعة، بما في ذلك المشاركون المستقبليون'},
 {value:'token',label:'معرف'.repeat(18)}
] : [
 {value:'private',label:'Only group members that you have explicitly approved may read this response after you submit it for review'},
 {value:'disabled',label:'Unavailable option',disabled:true},
 {value:'shared',label:'Share this response with every person currently enrolled in the group, including participants who join later'},
 {value:'token',label:'UnbrokenIdentifier'.repeat(4)}
];
createRoot(document.getElementById('root')).render(<form><Select className="fixture-select" label="Privacy" name="privacy" options={options}/><Select className="fixture-select" label="Disabled" disabled options={options}/><button type="button" id="after">After</button></form>);
'''
geometry = '''() => {
 const t=document.querySelector('[role=combobox]'), icon=t.querySelector('.cieo-chevron'), value=t.querySelector('.cieo-select-value');
 const tr=t.getBoundingClientRect(), ir=icon.getBoundingClientRect(), vr=value.getBoundingClientRect();
 const range=document.createRange(); range.selectNodeContents(value); const rr=range.getBoundingClientRect();
 const left=Math.max(vr.left,rr.left),right=Math.min(vr.right,rr.right),rtl=document.documentElement.dir==='rtl';
 const list=document.querySelector('.cieo-select-list'),pop=document.querySelector('.cieo-select-pop');
 return {inset:rtl?ir.left-tr.left:tr.right-ir.right,gap:Math.max(left-ir.right,ir.left-right),
 height:tr.height,triggerWidth:tr.width,listWidth:list.clientWidth,scrollWidth:list.scrollWidth,
 opacity:getComputedStyle(pop).opacity,visibility:getComputedStyle(pop).visibility,filter:getComputedStyle(pop).filter,style:pop.style.cssText,optionOpacity:[...list.querySelectorAll('[role=option]:not([aria-disabled])')].map(e=>getComputedStyle(e).opacity),
 visible:document.visibilityState,hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
 font:getComputedStyle(t).fontSize};
}'''
with tempfile.TemporaryDirectory(prefix='cieo-select-') as tmp:
    out = pathlib.Path(tmp)
    (out/'fixture.tsx').write_text(fixture)
    subprocess.run(['node','-e', "require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:'automatic',nodePaths:[process.argv[4]],alias:{'cieo/controls':process.argv[5]}})", esbuild,str(out/'fixture.tsx'),str(out/'fixture.js'),str(ROOT/'node_modules'),str(args.dist/'controls/index.js')],check=True)
    (out/'controls.css').write_bytes((args.dist/'controls/controls.css').read_bytes())
    (out/'tokens.css').write_bytes((ROOT/'tokens/tokens.css').read_bytes())
    native_markup = ''
    if args.dist.is_relative_to(ROOT):
        native_script = "import React from 'react';import {renderToString} from 'react-dom/server';import {Select} from " + json.dumps((args.dist/'controls/index.js').as_uri()) + ";console.log(renderToString(React.createElement('form',null,...['md','sm'].map(size=>React.createElement(Select,{key:size,size,label:size,name:size,options:['Private','Shared'],className:'fixture-select'})),React.createElement(Select,{label:'Disabled',disabled:true,options:['Private'],className:'fixture-select'}))))"
        native_markup = subprocess.check_output(['node', '--input-type=module', '-e', native_script], cwd=ROOT, text=True)
    for direction in ('ltr','rtl'):
        (out/f'native-{direction}.html').write_text(f'<!doctype html><html dir="{direction}" style="font-size:32px"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="controls.css"><style>body{{margin:16px}}form{{display:grid;gap:12px}}.fixture-select{{inline-size:100%;min-inline-size:0}}</style>{native_markup}</html>')
    # Layout only: no control/popup style overrides.
    (out/'index.html').write_text('''<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="controls.css"><style>body{margin:16px;font-family:Arial,sans-serif}form{display:grid;gap:12px;min-width:0}.fixture-select{inline-size:100%;min-inline-size:0}</style><div id="root"></div><script>const p=new URLSearchParams(location.search);document.documentElement.dir=p.get('dir');document.documentElement.style.fontSize=p.get('scale')+'px';</script><script src="fixture.js"></script></html>''')
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*args): pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=tmp))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    results=[]; errors=[]
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=not args.headed)
            for width in (320,390):
                for direction in ('ltr','rtl'):
                    for scale in (16,32):
                        for motion in ('reduce','no-preference'):
                            context=browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,device_scale_factor=1,reduced_motion=motion)
                            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
                            origin=f'http://127.0.0.1:{server.server_port}'
                            page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(origin+'/') else route.abort())
                            page.goto(f'{origin}/?dir={direction}&scale={scale}');page.bring_to_front()
                            trigger=page.get_by_role('combobox').first
                            trigger.wait_for();trigger.click();page.wait_for_timeout(1100)
                            m=page.evaluate(geometry)
                            checks={'logical-end-inset':abs(m['inset']-13)<1,'value-icon-gap':m['gap']>=7.9,'touch-height':m['height']>=44,'readable-list':m['scrollWidth']<=m['listWidth']+1,'popup-visible':m['opacity']=='1' and m['visibility']=='visible','settled-options':all(float(o)==1 for o in m['optionOpacity']),'settled-filter':m['filter']=='none','foreground':m['visible']=='visible' and not m['hidden']}
                            stem=f'{width}-{direction}-{scale//16*100}-{motion}'
                            page.screenshot(path=str(args.output/(stem+'-open.png')))
                            rows=page.get_by_role('option')
                            # Every option may exceed the vertical viewport; scrolling must reveal its entire text and both row edges remain hit targets.
                            details=[]
                            for i in (0,2,3):
                                row=rows.nth(i);row.scroll_into_view_if_needed()
                                details.append(row.evaluate('''el=>{const r=el.getBoundingClientRect(),box=el.closest('.cieo-select-list').getBoundingClientRect(),l=el.querySelector('.cieo-select-option-label'),lr=l.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(l);const rects=[...range.getClientRects()];return {height:r.height,lines:rects.length,within:rects.every(x=>x.left>=lr.left-1&&x.right<=lr.right+1),hit:[r.left+2,r.right-2].every(x=>el.contains(document.elementFromPoint(x,(Math.max(r.top,box.top+5)+Math.min(r.bottom,box.bottom-5))/2)))};}'''))
                            checks['complete-labels']=all(d['within'] for d in details)
                            checks['full-row-hit']=all(d['hit'] for d in details)
                            checks['option-touch-height']=all(d['height']>=44 for d in details)
                            page.screenshot(path=str(args.output/(stem+'-scrolled.png')))
                            rows.nth(1).click(force=True)
                            checks['disabled-option-no-change']=page.locator('select').first.input_value()=='private' and trigger.get_attribute('aria-expanded')=='true'
                            trigger.press('Home');trigger.press('ArrowDown');trigger.press('Enter')
                            checks['keyboard-skip-disabled-select']=page.locator('select').first.input_value()=='shared'
                            checks['closed-and-focused']=trigger.get_attribute('aria-expanded')=='false' and trigger.evaluate('e=>e===document.activeElement')
                            trigger.press('Enter');trigger.press('Home');trigger.press('Escape')
                            checks['escape-retains-value']=page.locator('select').first.input_value()=='shared' and trigger.get_attribute('aria-expanded')=='false'
                            trigger.press('Enter');page.mouse.click(5,800)
                            checks['outside-close']=trigger.get_attribute('aria-expanded')=='false'
                            checks['disabled']=page.get_by_role('combobox').nth(1).is_disabled()
                            trigger.click();rows.nth(0).click()
                            checks['pointer-selection']=page.locator('select').first.input_value()=='private' and trigger.get_attribute('aria-expanded')=='false'
                            checks['native-form-value']=page.evaluate("new FormData(document.querySelector('form')).get('privacy')")=='private'
                            results.append({'case':stem,'geometry':m,'rows':details,'checks':checks})
                            context.close()
            native_results=[]
            if native_markup:
                for width in (320,390):
                    for direction in ('ltr','rtl'):
                        context=browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,java_script_enabled=False)
                        page=context.new_page();page.goto(f'{origin}/native-{direction}.html')
                        checks={}
                        for size in ('md','sm'):
                            select=page.get_by_label(size,exact=True)
                            select.select_option('Shared')
                            checks[size+'-native-selection']=select.input_value()=='Shared'
                            checks[size+'-native-visible']=select.is_visible()
                            # Layout queries via automation still work while application scripts are disabled.
                            m=select.evaluate("e=>{const r=e.getBoundingClientRect(),i=e.parentElement.querySelector('.cieo-chevron').getBoundingClientRect(),s=getComputedStyle(e);return {inset:document.dir==='rtl'?i.left-r.left:r.right-i.right,height:r.height,start:s.paddingInlineStart,end:s.paddingInlineEnd}}")
                            checks[size+'-logical-inset']=abs(m['inset']-12)<1
                            checks[size+'-touch-height']=m['height']>=44
                            checks[size+'-padding']=m['start']==('10px' if size=='sm' else '12px') and m['end']=='36px'
                        checks['disabled-native']=page.get_by_label('Disabled',exact=True).is_disabled()
                        page.screenshot(path=str(args.output/f'native-{width}-{direction}-200.png'))
                        native_results.append({'case':f'native-{width}-{direction}','checks':checks})
                        context.close()
            browser.close()
        report={'browser':browser.version,'headed':args.headed,'results':results,'native':native_results,'errors':errors}
        (args.output/'results.json').write_text(json.dumps(report,indent=2))
        failed=[(r['case'],k) for r in results+native_results for k,v in r['checks'].items() if not v]
        print(json.dumps({'cases':len(results),'failed':failed,'errors':errors,'evidence':str(args.output)},indent=2))
        assert not failed and not errors,'Select regression failed; inspect results.json'
    finally:
        server.shutdown();server.server_close()
