import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
export function primitiveCustomizationInventory() {
  return readdirSync(path.join(root, 'src/primitives'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map(({ name }) => {
    const base=path.join(root,'src/primitives',name);
    const manifest=JSON.parse(readFileSync(path.join(base,'manifest.json'),'utf8'));
    const source=readFileSync(path.join(base,`${name}.tsx`),'utf8');
    const slotType=source.match(/slotProps\?:\s*\{([^}]+)\}/);
    const parts=slotType ? [...slotType[1].matchAll(/(\w+)\?:\s*(?:PrimitivePartProps|PartProps)/g)].map((match)=>match[1]) : manifest.extensions?.customization?.parts ?? manifest.extensions?.customization?.presentationSlots ?? manifest.styleParts.map((part)=>part.id);
    const delegated=!/slotProps\?/.test(source);
    const target=delegated ? source.match(/export\s*\{[\s\S]*?\}\s*from\s*['"]([^'"]+)['"]/)?.[1] ?? (name === 'VStack' ? '../Stack/Stack.js' : undefined) : undefined;
    if(delegated && !target) throw new Error(`${name} has neither typed slots nor an explicit delegated API`);
    if(!delegated && !(/className\?/.test(source) || /ComponentPropsWithRef<'button'>/.test(source)))throw new Error(`${name} is missing root className`);
    if(!delegated && !parts.includes('root'))throw new Error(`${name} does not expose a root presentation slot`);
    return {name,layer:manifest.layer,status:delegated?'delegated-api':'named-slots',parts,...(target?{target}:{}),contentSlots:manifest.slots.map((slot)=>slot.id)};
  }).sort((a,b)=>a.name.localeCompare(b.name));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries=primitiveCustomizationInventory();
  const output=path.join(root,'docs/generated/primitive-customization.json');
  const expected='{"schemaVersion":1,"entries":[\n'+entries.map((entry)=>JSON.stringify(entry)).join(',\n')+'\n]}\n';
  if(process.argv.includes('--write'))writeFileSync(output,expected);
  else if(readFileSync(output,'utf8')!==expected)throw new Error('Customization inventory drift; run node scripts/check-primitive-customization.mjs --write');
  console.log(`Primitive customization: ${entries.length} assessed, ${entries.filter((entry)=>entry.status==='named-slots').length} named-slot contracts, ${entries.filter((entry)=>entry.status==='delegated-api').length} delegated APIs`);
}
