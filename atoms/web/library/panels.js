(() => {
  const L = window.CieoLibrary; let returnFocus=null, placeholder=null;
  L.announce = text => {
    const box=document.getElementById('lib-notice');box.textContent=text;box.hidden=false;
    clearTimeout(L.noticeTimer);L.noticeTimer=setTimeout(()=>box.hidden=true,3500);
  };
  L.openDialog = (dialog,opener) => {
    returnFocus=opener||document.activeElement;dialog.showModal();L.animatePanel(dialog);
  };
  L.closeDialog = dialog => {dialog.close();};
  L.copyText = async text => {
    try { if(!navigator.clipboard)throw Error('clipboard unavailable');await navigator.clipboard.writeText(text);L.announce('Copied to clipboard.'); }
    catch { const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','Select and copy this text');area.style.cssText='position:fixed;inset:16px;z-index:300;width:calc(100% - 32px);height:160px';
      const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;host.append(area);area.focus();area.select();
      let copied=false;try{copied=document.execCommand('copy');}catch{}
      if(copied){area.remove();L.announce('Copied to clipboard.');}
      else{L.announce('Clipboard is unavailable. The text is selected for manual copying.');area.addEventListener('blur',()=>area.remove(),{once:true});}
    }
  };
  L.codeMode='recipe';
  L.showCode = mode => {
    L.codeMode=mode; const a=L.inspected;if(!a)return;
    document.getElementById('lib-code').textContent=mode==='markup'?a.html:a.api;
    document.querySelectorAll('[data-code-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.codeMode===mode)));
  };
  L.inspect = (id,opener) => {
    const a=L.byId.get(id);if(!a)return;
    const dialog=document.getElementById('lib-inspector');
    if(dialog.open)return;
    L.mount(a);L.inspected=a;
    placeholder=document.createElement('div');placeholder.style.height=a.el.getBoundingClientRect().height+'px';
    placeholder.style.gridColumn=getComputedStyle(a.el).gridColumn;placeholder.className='lib-placeholder';
    a.el.before(placeholder);document.getElementById('lib-inspector-preview').append(a.el);
    document.getElementById('lib-inspector-title').textContent=a.name;
    document.getElementById('lib-inspector-description').textContent=a.desc;
    document.getElementById('lib-inspector-category').textContent=a.cat;
    document.getElementById('lib-inspector-families').textContent=a.fam.map(f=>L.families[f]).join(' · ');
    const source=window.CieoSources?.[id];const link=document.getElementById('lib-source-link');
    const sourceRef=window.CieoSourceRef||'design/catalogue-soft-workbench';
    link.href=source?'https://github.com/civicsense2025/cieo/blob/'+sourceRef+'/atoms/web/'+source:'https://github.com/civicsense2025/cieo/tree/'+sourceRef+'/atoms/web/blocks';
    document.getElementById('lib-inspector-save').dataset.save=id;
    L.showCode('recipe');L.syncSaved();L.openDialog(dialog,opener);L.wake();
  };
  L.wirePanels = () => {
    document.querySelectorAll('dialog').forEach(dialog=>{
      dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
      dialog.addEventListener('close',()=>{
        if(dialog.id==='lib-inspector'&&L.inspected){
          placeholder?.replaceWith(L.inspected.el);placeholder=null;L.inspected=null;L.wake();
        }
        if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
      });
    });
    document.addEventListener('click',e=>{
      const close=e.target.closest('[data-close-dialog]');if(close){close.closest('dialog').close();return;}
      const open=e.target.closest('[data-open-dialog]');if(open){L.openDialog(document.getElementById(open.dataset.openDialog),open);return;}
      const inspect=e.target.closest('[data-inspect]');if(inspect){L.inspect(inspect.dataset.inspect,inspect);return;}
      const save=e.target.closest('[data-save]');if(save){L.toggleSaved(save.dataset.save);return;}
      const mode=e.target.closest('[data-code-mode]');if(mode)L.showCode(mode.dataset.codeMode);
    });
    document.getElementById('lib-copy-code').onclick=()=>L.copyText(document.getElementById('lib-code').textContent);
    document.getElementById('lib-copy-link').onclick=()=>{
      const url=new URL(location.href);url.hash=new URLSearchParams({collection:L.inspected.cat,atom:L.inspected.id});L.copyText(url.href);
    };
  };
})();
