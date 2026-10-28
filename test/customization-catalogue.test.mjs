import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { primitiveCustomizationInventory } from '../scripts/check-primitive-customization.mjs';
import { customizePart } from '../dist/primitives/customization.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const entries=primitiveCustomizationInventory();
test('every catalogue primitive has an explicit customization contract or delegated owning API',()=>{
  const saved=JSON.parse(readFileSync(new URL('../docs/generated/primitive-customization.json',import.meta.url),'utf8'));
  assert.deepEqual(saved.entries,entries);
  assert.equal(entries.length,222);
  assert.equal(entries.filter((entry)=>entry.status==='named-slots').length,215);
  assert.deepEqual(entries.filter((entry)=>entry.status==='delegated-api').map((entry)=>entry.name),['CheckboxInput','CheckboxListItem','PowerSearch','RadioListItem','Selector','Slider','VStack']);
});

test('runtime presentation props cannot replace any owned catalogue data attribute',()=>{
  const names=new Set();
  for(const entry of entries){
    const source=readFileSync(path.join(root,`src/primitives/${entry.name}/${entry.name}.tsx`),'utf8');
    const parsed=ts.createSourceFile(entry.name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const visit=(node)=>{if(ts.isJsxAttribute(node)&&node.name.getText(parsed).startsWith('data-'))names.add(node.name.getText(parsed));ts.forEachChild(node,visit);};
    visit(parsed);
  }
  for(const name of names)assert.equal(customizePart({[name]:'override'})[name],undefined,name);
  assert.deepEqual(customizePart({'data-testid':'host'}),{'data-testid':'host'});
});

test('every direct primitive accepts a typed root slot and rejects executable or semantic slot overrides',()=>{
  const directory=mkdtempSync(path.join(tmpdir(),'cieo-slot-types-'));
  try{
    const types=`import type { ComponentProps } from ${JSON.stringify(path.join(root,'node_modules/@types/react/index.js'))};\n`+entries.filter((entry)=>entry.status==='named-slots').map((entry,index)=>{
      const module=JSON.stringify(path.join(root,`src/primitives/${entry.name}/${entry.name}.js`));
      return `type P${index}=NonNullable<ComponentProps<typeof import(${module}).${entry.name}>>;\nconst part${index}: NonNullable<P${index}['slotProps']>={root:{className:'host',style:{padding:8},'data-testid':'root'}};\n// @ts-expect-error Slot customization cannot replace owned click behavior.\nconst bad${index}: NonNullable<P${index}['slotProps']>={root:{onClick(){}}};`;
    }).join('\n');
    const file=path.join(directory,'contracts.mts');writeFileSync(file,types);
    const program=ts.createProgram([file],{noEmit:true,strict:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,jsx:ts.JsxEmit.ReactJSX,lib:['lib.es2022.d.ts','lib.dom.d.ts','lib.dom.iterable.d.ts']});
    const diagnostics=ts.getPreEmitDiagnostics(program);
    assert.equal(diagnostics.length,0,ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:(f)=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
  }finally{rmSync(directory,{recursive:true,force:true});}
});
