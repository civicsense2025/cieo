import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressBar } from '../dist/primitives/ProgressBar/ProgressBar.js';
import { AuthEmailField } from '../dist/primitives/AuthEmailField/AuthEmailField.js';
import { TableHeaderCell } from '../dist/primitives/TableHeaderCell/TableHeaderCell.js';

test('progress presentation slots cannot replace value, label or semantics', () => {
  const html = renderToStaticMarkup(h(ProgressBar, {value:25,max:100,label:'Tracing',className:'forma-progress',slotProps:{root:{className:'custom-track',style:{width:180},role:'button',value:99,'aria-label':'Wrong','data-owner':'forma'}}}));
  assert.match(html,/class="cieo cieo-progress forma-progress custom-track"/);
  assert.match(html,/value="25"/);assert.match(html,/aria-label="Tracing"/);assert.doesNotMatch(html,/Wrong|role="button"/);
  assert.match(html,/data-owner="forma"/);
});

test('email input slots retain native label, error relationship and controlled value', () => {
  const html = renderToStaticMarkup(h(AuthEmailField,{id:'email',value:'a@example.test',error:'Check your email',slotProps:{root:{className:'host-field'},input:{className:'host-input',type:'text',value:'bad'},label:{style:{fontWeight:600}}}}));
  assert.match(html,/host-field/);assert.match(html,/host-input/);assert.match(html,/type="email"/);assert.match(html,/value="a@example.test"/);assert.match(html,/aria-describedby="email-error"/);assert.match(html,/for="email"/);
});

test('table headers accept host presentation without losing table semantics',()=>{
 const html=renderToStaticMarkup(h('table',null,h('thead',null,h('tr',null,h(TableHeaderCell,{slotProps:{root:{className:'host-column',role:'button'}}},'Name')))));
 assert.match(html,/<th[^>]*host-column/);assert.doesNotMatch(html,/role="button"/);
});

test('waveform slots preserve the playhead geometry and scrubber contract', async () => {
  const { AudioWaveform } = await import('../dist/primitives/AudioWaveform/AudioWaveform.js');
  const html=renderToStaticMarkup(h(AudioWaveform,{peaks:[.2,.8],duration:100,current:25,label:'Voice note',onSeek(){},bars:2,
    slotProps:{root:{className:'host-wave',style:{'--progress':99,padding:4},'data-seekable':'wrong',tabIndex:-1},bar:{className:'host-bar',style:{'--h':99}}}}));
  assert.match(html,/role="slider"/);assert.match(html,/aria-valuenow="25"/);assert.match(html,/tabindex="0"/);
  assert.match(html,/--progress:0.25/);assert.doesNotMatch(html,/--progress:99|--h:99|data-seekable="wrong"/);
  assert.match(html,/padding:4px/);assert.match(html,/host-wave/);assert.match(html,/host-bar/);
});

test('rich text customization cannot replace sanitized destinations', async () => {
  const { RichText } = await import('../dist/primitives/RichText/RichText.js');
  const html=renderToStaticMarkup(h(RichText,{text:'Read https://example.test/docs',slotProps:{root:{className:'host-prose'},link:{className:'host-link',href:'javascript:alert(1)',dangerouslySetInnerHTML:{__html:'unsafe'}}}}));
  assert.match(html,/host-prose/);assert.match(html,/host-link/);assert.match(html,/href="https:\/\/example.test\/docs"/);
  assert.doesNotMatch(html,/javascript:|unsafe/);assert.match(html,/noopener noreferrer ugc nofollow/);
});

test('no customization retains the default native progress markup exactly', () => {
  assert.equal(renderToStaticMarkup(h(ProgressBar,{value:25,max:100,label:'Tracing'})), '<progress value="25" max="100" aria-label="Tracing" class="cieo cieo-progress"></progress>');
});
