export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

export function parseArgs(argv, spec) {
  const flags = {};
  const positionals = [];
  let parsingFlags = true;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (parsingFlags && arg === '--') {
      parsingFlags = false;
      continue;
    }
    if (!parsingFlags || !arg.startsWith('-') || arg === '-') {
      positionals.push(arg);
      continue;
    }
    if (!arg.startsWith('--')) throw new UsageError(`Unknown flag '${arg}'`);
    const equals = arg.indexOf('=');
    const name = equals === -1 ? arg.slice(2) : arg.slice(2, equals);
    const kind = Object.hasOwn(spec, name) ? spec[name] : undefined;
    if (!kind) throw new UsageError(`Unknown flag '--${name}'`);
    if (kind === 'boolean') {
      if (equals !== -1) throw new UsageError(`Flag '--${name}' does not take a value`);
      flags[name] = true;
      continue;
    }
    if (equals !== -1) {
      flags[name] = arg.slice(equals + 1);
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value === '--') throw new UsageError(`Flag '--${name}' requires a value`);
    flags[name] = value;
    index += 1;
  }
  return { flags, positionals };
}
