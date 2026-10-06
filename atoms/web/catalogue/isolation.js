/* Recipe styles previously leaked across tiles (pricing .ps broke the color picker).
   Parse with the browser CSS parser, then scope selectors to the stable live stage.
   Scoped nodes can move into the inspector without changing their CSS identity. */
(() => {
  const c=window.CieoCatalogue;
  function selectors(text){
    const parts=[];let start=0,depth=0,quote='';
    for(let i=0;i<text.length;i++){
      const ch=text[i];if(quote){if(ch===quote&&text[i-1]!=='\\')quote='';continue}
      if(ch==='"'||ch==="'"){quote=ch;continue}
      if(ch==='('||ch==='[')depth++;if(ch===')'||ch===']')depth--;
      if(ch===','&&!depth){parts.push(text.slice(start,i));start=i+1}
    }return [...parts,text.slice(start)].map(s=>s.trim());
  }
  c.isolateStyles=(stage,id)=>{
    stage.dataset.atom=id;const prefix=`:where([data-atom="${CSS.escape(id)}"])`;
    const scopeRules=rules=>[...rules].map(rule=>{
      if(rule.type===CSSRule.STYLE_RULE){
        const selected=selectors(rule.selectorText).map(s=>s.startsWith(':root')?s.replace(':root',prefix):`${prefix} ${s}`).join(',');
        return `${selected}{${rule.style.cssText}}`;
      }
      if(rule.type===CSSRule.KEYFRAMES_RULE||!rule.cssRules)return rule.cssText;
      return `${rule.cssText.slice(0,rule.cssText.indexOf('{'))}{${scopeRules(rule.cssRules)}}`;
    }).join('\n');
    for(const style of stage.querySelectorAll('style')){
      const sheet=new CSSStyleSheet();sheet.replaceSync(style.textContent);style.textContent=scopeRules(sheet.cssRules);
    }
  };
})();
