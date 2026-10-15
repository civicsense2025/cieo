import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { TextField } from '../../src/controls/TextField';
import { TextArea } from '../../src/controls/TextArea';
import { SearchField } from '../../src/controls/SearchField';
const events: Record<string, string[]> = {};
(window as any).events = events;
function Example({ kind, controlled }: { kind: string; controlled: boolean }) {
  const id = `${kind}-${controlled ? 'controlled' : 'uncontrolled'}`;
  const [value, setValue] = useState('');
  const [cancelReset, setCancelReset] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const record = (name: string, e: any) => (events[id] ??= []).push(`${name}:${e.currentTarget.value}`);
  const props: any = { onSearch: (v: string) => (events[id] ??= []).push('search:' + v), onClear: () => (events[id] ??= []).push('clear'), onKeyDown: (e: any) => { if (e.key === 'Enter') (events[id] ??= []).push('enter'); }, id, label: id, ref, required: true, description: 'Description',
    ...(controlled ? { value } : { defaultValue: '' }),
    onChange: (e: any) => { record('change', e); if (controlled) setValue(e.currentTarget.value); },
    onInput: (e: any) => record('input', e), onInputCapture: (e: any) => record('inputCapture', e),
    onBlur: (e: any) => record('blur', e), onBlurCapture: (e: any) => record('blurCapture', e),
    onStatusChange: (s: string) => (events[id] ??= []).push(`status:${s}`),
    validate: kind === 'search' ? undefined : (v: string) => v.length < 3 ? 'Use three characters' : true };
  const Component = kind === 'area' ? TextArea : kind === 'search' ? SearchField : TextField;
  return <form id={`${id}-form`} onReset={(e) => { if (cancelReset) e.preventDefault(); }} onSubmit={(e) => { e.preventDefault(); (events[id] ??= []).push('submit'); }}><Component {...props} {...(kind === 'area' ? { showCount: true } : {})} />
    <button type="button" id={`${id}-focus`} onClick={() => ref.current?.focus()}>Focus</button>
    <button type="reset">Reset</button>
    <button type="button" id={`${id}-update`} onClick={() => setValue('updated')}>Update</button>
    <label><input id={`${id}-cancel`} type="checkbox" checked={cancelReset} onChange={(e) => setCancelReset(e.currentTarget.checked)} />Cancel reset</label></form>;
}
createRoot(document.getElementById('root')!).render(<>{['field', 'area', 'search'].flatMap(kind => [true, false].map(controlled => <Example key={`${kind}-${controlled}`} kind={kind} controlled={controlled} />))}</>);
