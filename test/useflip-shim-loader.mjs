// Node module loader: redirect 'react' and 'react/jsx-runtime' to the stub.
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const stubURL = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'useflip-react-stub.mjs')).href;

export async function resolve(specifier, context, next) {
  if (specifier === 'react' || specifier === 'react/jsx-runtime' || specifier === 'react/jsx-dev-runtime') {
    return { url: stubURL, shortCircuit: true };
  }
  return next(specifier, context);
}
