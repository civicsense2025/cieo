#!/usr/bin/env node
// Both existing catalogue URLs now show the same real atom collection.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const output=args.find(a=>!a.startsWith('--'))||path.join(root,'docs/catalogue.html');
const result=spawnSync(process.execPath,[path.join(root,'scripts/build-library.mjs'),output,...args.filter(a=>a.startsWith('--'))],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
