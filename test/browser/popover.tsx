import { createRoot } from 'react-dom/client';
import { Popover } from '../../src/primitives/Popover/Popover';
import { TabList } from '../../src/primitives/TabList/TabList';
import { Tab } from '../../src/primitives/Tab/Tab';
import { useState } from 'react';

function Fixture() {
  const [tab, setTab] = useState('first');
  const [showTabs, setShowTabs] = useState(false);
  return <>
    <div style={{ position:'fixed', right:8, bottom:8, width:64, height:44, overflow:'hidden', transform:'translateZ(0)' }}>
      <Popover label="Edge panel" trigger={<button>Edge</button>} slotProps={{content:{className:'custom-panel',style:{width:280,padding:20,background:'white'}}}}
        slots={{header:<h2>Actions</h2>,footer:<button>Last action</button>}}>
        <button>First action</button><p>Content from the host.</p>
      </Popover>
    </div>
    <Popover label="Prevented" trigger={<button onClick={(event) => event.preventDefault()}>Prevent open</button>}>Must stay closed</Popover>
    <Popover label="Disabled" trigger={<button disabled>Disabled trigger</button>}>Must stay closed</Popover>
    <button>Outside</button>
    <button onClick={() => setShowTabs((value) => !value)}>Toggle tabs</button>
    <div hidden={!showTabs}>
    <TabList label="Fixture tabs" value={tab} onValueChange={setTab} slotProps={{root:{className:'tabs'},indicator:{className:'marker'}}}>
      <Tab value="first" id="first-tab" controls="first-panel">First</Tab>
      <Tab value="second" id="second-tab" controls="second-panel">Second</Tab>
    </TabList>
    </div>
    <div role="tabpanel" id="first-panel" aria-labelledby="first-tab" hidden={tab !== 'first'}>First panel</div>
    <div role="tabpanel" id="second-panel" aria-labelledby="second-tab" hidden={tab !== 'second'}>Second panel</div>
  </>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
