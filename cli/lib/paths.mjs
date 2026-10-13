import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const libDir = dirname(fileURLToPath(import.meta.url));
const packageRootDir = dirname(dirname(libDir));

export function packageRoot() {
  return packageRootDir;
}

export function projectRoot() {
  return process.cwd();
}
