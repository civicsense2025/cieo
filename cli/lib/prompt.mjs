const EOF = Symbol('eof');
const INVALID = Symbol('invalid');
const ATTEMPTS = 2;

/* One prompt object per command run. In TTY mode a single pair of stream
   listeners is attached lazily on the first question and kept for the whole
   run; typed lines are buffered so a line that arrives early is not lost.
   EOF, stream errors, and close() all resolve pending questions with their
   default instead of hanging. */
export function createPrompt({ input = process.stdin, output = process.stdout, yes = false } = {}) {
  const tty = Boolean(input.isTTY && output.isTTY && !process.env.CI && !yes);
  let buffer = '';
  let pending = null;
  let attached = false;
  let closed = false;
  let ended = false;

  function settle(value) {
    const resolve = pending;
    pending = null;
    if (resolve !== null) resolve(value);
  }

  function takeLine() {
    const newline = buffer.indexOf('\n');
    if (newline === -1) return null;
    const line = buffer.slice(0, newline).replace(/\r$/, '');
    buffer = buffer.slice(newline + 1);
    return line;
  }

  function onData(chunk) {
    buffer += chunk.toString('utf8');
    if (pending === null) return;
    const line = takeLine();
    if (line !== null) settle(line);
  }

  function onEnd() {
    ended = true;
    if (pending === null) return;
    const line = buffer.replace(/\r$/, '');
    buffer = '';
    settle(line === '' ? EOF : line);
  }

  function onError() {
    ended = true;
    settle(EOF);
  }

  function attach() {
    if (attached) return;
    attached = true;
    input.on('data', onData);
    input.on('end', onEnd);
    input.on('error', onError);
  }

  function readLine() {
    return new Promise((resolve) => {
      if (!tty || closed) {
        resolve(EOF);
        return;
      }
      attach();
      const line = takeLine();
      if (line !== null) {
        resolve(line);
        return;
      }
      if (ended || input.readableEnded) {
        resolve(EOF);
        return;
      }
      pending = resolve;
    });
  }

  async function exchange(render, interpret, fallback) {
    for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
      render();
      const line = await readLine();
      if (line === EOF) return fallback;
      const outcome = interpret(line);
      if (outcome !== INVALID) return outcome;
    }
    return fallback;
  }

  return {
    tty,
    ask(question, { default: fallback } = {}) {
      if (!tty || closed) return Promise.resolve(fallback);
      return exchange(
        () => output.write(`${question} `),
        (line) => {
          const value = line.trim();
          return value === '' ? fallback : value;
        },
        fallback,
      );
    },
    choose(question, options, { default: defaultIndex = 0 } = {}) {
      if (!tty || closed) return Promise.resolve(options[defaultIndex]);
      const fallback = options[defaultIndex];
      return exchange(
        () => {
          const lines = [question];
          options.forEach((option, index) => {
            lines.push(`${index + 1}) ${option}${index === defaultIndex ? ' (default)' : ''}`);
          });
          output.write(`${lines.join('\n')}\n`);
        },
        (line) => {
          const value = line.trim();
          if (value === '') return fallback;
          const index = Number(value);
          if (!Number.isInteger(index) || index < 1 || index > options.length) return INVALID;
          return options[index - 1];
        },
        fallback,
      );
    },
    confirm(question, { default: fallback = false } = {}) {
      if (!tty || closed) return Promise.resolve(fallback);
      return exchange(
        () => output.write(`${question} ${fallback ? '[Y/n]' : '[y/N]'} `),
        (line) => {
          const value = line.trim().toLowerCase();
          if (value === '') return fallback;
          if (value === 'y' || value === 'yes') return true;
          if (value === 'n' || value === 'no') return false;
          return INVALID;
        },
        fallback,
      );
    },
    close() {
      if (closed) return;
      closed = true;
      settle(EOF);
      if (attached) {
        input.off('data', onData);
        input.off('end', onEnd);
        input.off('error', onError);
        attached = false;
        if (typeof input.pause === 'function') input.pause();
      }
    },
  };
}
