import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

const dist = process.env.CIEO_SLOTS_DIST ? pathToFileURL(`${process.env.CIEO_SLOTS_DIST}/`) : new URL('../dist/', import.meta.url);
const names = ['ActionBar','ActivityItem','AgentActivity','ApprovalRequest','AudioPlayer','AudioTranscript','AuthCredentialForm','AuthInviteAccept','AuthMfaChallenge','AuthResetForm','AuthSessionList','AuthSsoButtons','AvatarGroup','Banner','BottomSheetSwitcher','Breadcrumbs','ButtonGroup','Calendar','ChatComposer','ChatMessage','CheckboxList','Collapsible','CollapsibleGroup','CommandPalette','CommandPaletteList','Comment','CommentComposer','ComplexSelector','ConversationListItem','DateRangeInput','DialogHeader','DropdownMenu','DropdownMenuSubMenu','EmptyState','FeedbackPopover','Field','FormLayout','Grid','HoverCard','InputGroup','Layout','LinkPreview','List','MetadataList','MoreMenu','MultiSelector','NavHeadingMenu','Outline','OverflowList','Pagination','Poll','RadioList','ReactionPicker','ReactionSummary','RunControls','ScrollableArea','Section','SeenBy','SegmentedControl','SideNavSection','SortableList','Stack','Stepper','StreamingMessage','TabMenu','TableBody','TableFooter','TableHeader','TableSelectionToolbar','ThumbsFeedback','ToggleButtonGroup','Tokenizer','ToolCallDisclosure','Toolbar','Tooltip','TopNavMegaMenu','TopNavMegaMenuFeaturedCard','TopNavMenu','TreeList','Typeahead','VoiceRecorder'];
const fixture = {
  id:'fixture', label:'Example', title:'Title', description:'Description', author:'Ava', actor:'Ava', text:'Text', question:'Question',
  src:'local-test.mp3', url:'https://example.com/item', href:'/item', year:2026, month:9, page:1, pageCount:3, selectedCount:1,
  value:'', items:[], entries:[], steps:[], people:[], options:[], reactions:[], words:[], sessions:[], providers:[], sections:[], values:[], order:[],
  approval:{status:'pending',title:'Approve'}, run:{status:'running'}, message:{text:'Plain <text>',complete:true}, call:{status:'running',name:'test',arguments:{}},
  onSubmit(){}, onAccept(){}, onDecline(){}, onRevoke(){}, onPress(){}, onSelect(){}, onChange(){}, onValueChange(){}, onOpenChange(){}, onRecorded(){}, onReorder(){},
  orgName:'Example', inviterName:'Ava', step:'request', open:true, defaultOpen:true, trigger:h('button',null,'Open'), children:h('span',null,'Body'),
};

for (const name of names) test(`${name} renders root customization without losing its owned markup`, async () => {
  const { [name]: Component } = await import(new URL(`primitives/${name}/${name}.js`,dist));
  const props = {...fixture};
  if(name==='DateRangeInput')props.value={start:'2026-10-01',end:'2026-10-09'};
  if(name==='SeenBy')props.people=[{name:'Ava',initials:'A'}];
  if(name==='AudioPlayer')props.duration=60;
  const baseline=render(h(Component,props));
  const customized=render(h(Component,{...props,className:'host-root',slotProps:{root:{className:'host-part','data-testid':'custom-root',onClick:'bad',role:'none','aria-hidden':true,'data-state':'bad'}}}));
  assert.ok(customized.includes('host-root'),`${name} root class reaches markup`);
  assert.ok(customized.includes('host-part'),`${name} named root slot reaches markup`);
  assert.ok(customized.includes('data-testid="custom-root"'));
  assert.ok(!customized.includes('data-state="bad"')&&!customized.includes('role="none"')&&!customized.includes('onClick="bad"'));
  const normalize=(value)=>value.replace(/ host-root host-part/g,'').replace(/ data-testid="custom-root"/g,'');
  assert.equal(normalize(customized),baseline,'customization does not change default children, state or semantics');
});

test('EmptyState content slots replace content while preserving heading and action containers',async()=>{
  const {EmptyState}=await import(new URL('primitives/EmptyState/EmptyState.js',dist));
  const html=render(h(EmptyState,{title:'Default',description:'Default description',slots:{title:h('em',null,'New title'),description:'New description',action:h('button',null,'Recover')}}));
  assert.match(html,/<h2[^>]*><em>New title<\/em><\/h2>/);assert.match(html,/New description/);assert.match(html,/>Recover<\/button>/);assert.doesNotMatch(html,/Default/);
});

test('named form parts preserve native date values, bounds and labels',async()=>{
  const {DateRangeInput}=await import(new URL('primitives/DateRangeInput/DateRangeInput.js',dist));
  const html=render(h(DateRangeInput,{label:'Stay',value:{start:'2026-10-01',end:'2026-10-09'},slotProps:{startInput:{className:'arrival',type:'text',value:'bad',disabled:false},endLabel:{className:'departure'}}}));
  assert.match(html,/arrival/);assert.match(html,/departure/);assert.match(html,/type="date"/);assert.match(html,/max="2026-10-09"/);assert.match(html,/min="2026-10-01"/);assert.doesNotMatch(html,/value="bad"/);
});

test('customization rejects executable props and protects owned motion geometry',async()=>{
  const {customizePart}=await import(new URL('primitives/customization.js',dist));
  const part=customizePart({className:'host',style:{transform:'none',padding:24},onClick(){},dangerouslySetInnerHTML:{__html:'bad'},role:'none','aria-hidden':true,'data-motion':'off','data-testid':'probe'},'library',{transform:'translateX(8px)'},'root');
  assert.deepEqual(part,{className:'library root host',style:{transform:'translateX(8px)',padding:24},'data-testid':'probe'});
  assert.deepEqual(customizePart(undefined,'library'),{});
});
