"""Run each original recipe once at a stable size; avoid a resize torture test of all canvases."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[2]
with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_PATH')
    browser = p.chromium.launch(**({'executable_path': executable} if executable else {}))
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.set_content((ROOT/'docs/library.html').read_text(), wait_until='domcontentloaded')
    report = page.evaluate('''() => {
      const errors=[];let count=0;
      for(const a of A) {
        try {
          if(!a.initialized) {
            a.initialized=true;
            const stage=a.el.querySelector('.stage');stage.innerHTML=a.html;
            a.render=a.init(stage);
          }
          if(a.render)a.render(clock.t+1);
          count++;
        } catch(e) {errors.push({id:a.id,message:String(e)})}
      }
      return {count,errors};
    }''')
    print(json.dumps(report,indent=2),flush=True)
    out=ROOT/'artifacts/catalogue-ui';out.mkdir(parents=True,exist_ok=True)
    (out/'integrity.json').write_text(json.dumps(report,indent=2))
    browser.close()
    assert report['count']==345 and not report['errors']
