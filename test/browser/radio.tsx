import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Radio, RadioGroup } from '../../src/controls/Toggles';
const events: string[] = [];
(window as any).events = events;
function Example({ controlled }: { controlled: boolean }) {
  const id = controlled ? 'controlled' : 'uncontrolled';
  const [value, setValue] = useState('beta');
  const [, render] = useState(0);
  const [cancel, setCancel] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return <form id={id} onReset={e => { if (cancel) e.preventDefault(); }}>
    <RadioGroup label={id} description="Group description" name={id} {...(controlled ? {value} : {defaultValue:'beta'})} onValueChange={v => {events.push(id + ':group:' + v); if(controlled) setValue(v);}}>
      <Radio id={id+'-alpha'} ref={ref} value="alpha" label={id+' alpha'} description="Radio description" onChange={e => events.push(id+':radio:'+e.currentTarget.value)} />
      <Radio id={id+'-beta'} value="beta" label={id+' beta'} />
      <Radio id={id+'-disabled'} value="disabled" label="Unavailable" disabled />
    </RadioGroup>
    <button type="reset">Reset</button><button type="button" id={id+'-render'} onClick={()=>render(n=>n+1)}>Render</button>
    <button type="button" id={id+'-update'} onClick={()=>setValue('alpha')}>Update</button>
    <button type="button" id={id+'-focus'} onClick={()=>ref.current?.focus()}>Focus</button>
    <label><input type="checkbox" id={id+'-cancel'} checked={cancel} onChange={e=>setCancel(e.currentTarget.checked)}/>Cancel reset</label>
  </form>;
}
createRoot(document.getElementById('root')!).render(<>
  <Example controlled={false}/><Example controlled/>
  <form id="standalone"><Radio id="solo-a" name="solo" value="a" label="Solo a" defaultChecked/><Radio id="solo-b" name="solo" value="b" label="Solo b"/><Radio id="other" name="other" value="c" label="Other" defaultChecked/><button type="reset">Reset</button></form>
  <fieldset disabled><RadioGroup name="disabled" label="Disabled group" defaultValue="a"><Radio id="fieldset-radio" value="a" label="Disabled radio"/></RadioGroup></fieldset>
</>);
