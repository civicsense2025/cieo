/* Agent run demo: a fixed event log replays into a real cieo/agent store, and the screen renders only what the store
   holds. The run pauses on an approval; Approve or Deny marks the request busy and the "host" (a timer on this page)
   answers 400ms later, so the decision appears only when the log reports it. Stop works the same way. Text is always
   set with textContent, never as HTML. The words and tones mirror the AgentStatus, ToolCallDisclosure and
   ApprovalRequest primitives, which are React components and cannot load here without a bundler. No network, ever. */
import { createAgentStore, isSettled, selectActivity, selectRunAgents } from '../../dist/agent/index.js';

const RUN = 'run-1';
const HOST_DELAY = 400;
const STEP = 450;
const TONES = { starting: 'info', running: 'info', waiting: 'warning', completed: 'success', stopped: 'default', failed: 'danger', interrupted: 'danger', disconnected: 'danger' };
const WORDS = { starting: 'Starting', running: 'Working', waiting: 'Needs you', completed: 'Done', stopped: 'Stopped', failed: 'Failed', interrupted: 'Interrupted', disconnected: 'Disconnected' };
const PHASES = { started: 'Running', finished: 'Done', failed: 'Failed' };
const PHASE_TONES = { started: 'info', finished: 'success', failed: 'danger' };
const DECISIONS = { pending: 'Waiting for your decision', approved: 'Approved', denied: 'Denied', expired: 'Expired' };
const PARENT = { lead: null, writer: 'lead' };

// The recorded part of the run, up to the approval it waits on.
const OPENING = [
  ['lead', 'run.status', { status: 'running' }],
  ['lead', 'agent.status', { status: 'running', name: 'Lead' }],
  ['lead', 'message.delta', { text: 'Plan: read the pricing pages, ' }],
  ['lead', 'message.delta', { text: 'then hand a short FAQ to Writer.\n' }],
  ['lead', 'message.complete', { text: 'Plan: read the pricing pages, then hand a short FAQ to Writer.\nWriter will ask before publishing.' }],
  ['writer', 'agent.status', { status: 'running', name: 'Writer' }],
  ['writer', 'tool.call', { callId: 'call-1', name: 'search_docs', phase: 'started' }],
  ['writer', 'tool.call', { callId: 'call-1', name: 'search_docs', phase: 'finished', summary: 'Found 3 pricing pages.' }],
  ['writer', 'draft.begin', { draftId: 'draft-1', text: 'Q: Which plan fits a small team?' }],
  ['writer', 'draft.update', { draftId: 'draft-1', text: 'Q: Which plan fits a small team?\nA: Team, up to 10 seats.' }],
  ['writer', 'approval.requested', { approvalId: 'approval-1', title: 'Publish the pricing FAQ?', detail: 'Writer wants to publish "Pricing FAQ" to the help centre.' }],
  ['writer', 'agent.status', { status: 'waiting' }],
];
const AFTER = {
  approved: [
    ['writer', 'approval.resolved', { approvalId: 'approval-1', decision: 'approved' }],
    ['writer', 'agent.status', { status: 'running' }],
    ['writer', 'draft.complete', { draftId: 'draft-1', artifactId: 'faq-1' }],
    ['writer', 'artifact.saved', { artifactId: 'faq-1', kind: 'faq', title: 'Pricing FAQ' }],
    ['writer', 'agent.status', { status: 'completed' }],
    ['lead', 'agent.status', { status: 'completed', runStatus: 'completed' }],
  ],
  denied: [
    ['writer', 'approval.resolved', { approvalId: 'approval-1', decision: 'denied' }],
    ['writer', 'draft.cancel', { draftId: 'draft-1' }],
    ['writer', 'agent.status', { status: 'stopped', reason: 'Publishing was denied.' }],
    ['lead', 'agent.status', { status: 'completed', runStatus: 'completed' }],
  ],
  stop: [
    ['lead', 'run.status', { status: 'stopped', reason: 'Stopped by you.' }],
    ['writer', 'agent.status', { status: 'stopped' }],
    ['lead', 'agent.status', { status: 'stopped' }],
  ],
};
const ACTIVITY = {
  'run.status': (e, s) => `Run ${WORDS[s.runs.get(e.runId)?.status]?.toLowerCase() ?? 'changed'}`,
  'agent.status': (e, s) => `${s.agents.get(e.agentId)?.name ?? e.agentId}: ${WORDS[s.agents.get(e.agentId)?.status] ?? 'changed'}`,
  'message.complete': () => 'Lead finished its plan',
  'tool.call': (e, s) => `Tool ${s.tools.get(e.ref)?.name ?? ''}: ${PHASES[s.tools.get(e.ref)?.phase] ?? ''}`,
  'draft.begin': () => 'Writer started a draft',
  'draft.complete': () => 'Draft finished',
  'draft.cancel': () => 'Draft discarded',
  'approval.requested': () => 'Asked for approval',
  'approval.resolved': (e, s) => `Approval: ${DECISIONS[s.approvals.get(e.ref)?.status] ?? ''}`,
  'artifact.saved': (e, s) => `Saved ${s.artifacts.get(e.ref)?.title ?? 'a file'}`,
};

const $ = (sel, root = document) => root.querySelector(sel);
const runStatus = $('[data-run-status]');
const stopButton = $('[data-stop]');
const replay = $('[data-replay]');
const activity = $('[data-activity]');
const toolsHost = $('[data-tools]');
const approvalSlot = $('[data-approval-slot]');
const announce = $('[data-announce]');

let store;
let seq = 0;
let timers = [];
let busy = { approval: null, stop: false };
let shownActivity = 0;
const tools = new Map();
let approvalEl = null;

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function setStatus(node, status) {
  node.setAttribute('data-status', status);
  node.setAttribute('data-tone', TONES[status]);
  node.querySelector('.cieo-p-status-dot').setAttribute('data-status', TONES[status]);
  node.querySelector('[data-label]').textContent = WORDS[status];
}

function setBusy(button, on, pendingText) {
  if (on) {
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('data-state', 'pending');
    announce.textContent = pendingText;
  } else {
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
    button.removeAttribute('data-state');
  }
}

// The page's stand-in for the host: it appends events to the log in order.
function emit(steps, gap = STEP) {
  steps.forEach(([agentId, type, data], i) => {
    timers.push(setTimeout(() => {
      seq += 1;
      store.apply([{ v: 1, seq, at: new Date().toISOString(), runId: RUN, agentId, parentAgentId: PARENT[agentId], type, data }]);
    }, gap * (i + 1)));
  });
}

function renderTool(call) {
  let node = tools.get(call.id);
  if (!node) {
    node = el('details', { class: 'cieo cieo-p-tool-call-disclosure', 'data-parts': 'ToolCallDisclosure' });
    const summary = el('summary');
    summary.append(el('span', { 'aria-hidden': 'true', class: 'cieo cieo-p-status-dot' }), el('span', { 'data-name': '' }, call.name), el('span', { 'data-phase-text': '' }));
    node.append(summary, el('div', { 'data-body': '' }));
    tools.set(call.id, node);
    toolsHost.append(node);
  }
  node.setAttribute('data-phase', call.phase);
  node.querySelector('.cieo-p-status-dot').setAttribute('data-status', PHASE_TONES[call.phase]);
  node.querySelector('[data-phase-text]').textContent = PHASES[call.phase];
  const body = node.querySelector('[data-body]');
  body.replaceChildren();
  if (call.summary) body.append(el('p', { 'data-summary': '' }, call.summary));
  if (call.phase === 'failed' && call.error) body.append(el('p', { 'data-error': '' }, call.error));
}

function decide(decision) {
  if (busy.approval || busy.stop) return;
  const approval = store.getSnapshot().approvals.get('approval-1');
  if (!approval || approval.status !== 'pending') return;
  busy.approval = decision;
  render(store.getSnapshot());
  // The host answers later; the view changes only when its event lands.
  timers.push(setTimeout(() => emit(AFTER[decision === 'approve' ? 'approved' : 'denied'], STEP / 2), HOST_DELAY));
}

function renderApproval(approval) {
  if (!approval) {
    approvalEl?.remove();
    approvalEl = null;
    return;
  }
  if (!approvalEl) {
    approvalEl = el('section', { class: 'cieo cieo-p-approval-request', 'data-parts': 'ApprovalRequest', 'aria-labelledby': 'approval-title', 'data-approval': '' });
    const actions = el('div', { 'data-actions': '' });
    const approve = el('button', { type: 'button', class: 'cieo-ctl cieo-btn cieo-btn--primary cieo-btn--md', 'data-approve': '' }, 'Approve');
    const deny = el('button', { type: 'button', class: 'cieo-ctl cieo-btn cieo-btn--secondary cieo-btn--md', 'data-deny': '' }, 'Deny');
    approve.addEventListener('click', () => decide('approve'));
    deny.addEventListener('click', () => decide('deny'));
    actions.append(approve, deny);
    approvalEl.append(el('h3', { id: 'approval-title' }, approval.title ?? 'Approval needed'), el('p', { 'data-detail': '' }, approval.detail ?? ''), el('p', { 'data-status-text': '' }), actions);
    approvalSlot.append(approvalEl);
  }
  const pending = approval.status === 'pending';
  approvalEl.setAttribute('data-status', approval.status);
  approvalEl.querySelector('[data-status-text]').textContent = DECISIONS[approval.status];
  if (pending && busy.approval) approvalEl.setAttribute('aria-busy', 'true');
  else approvalEl.removeAttribute('aria-busy');
  const actions = approvalEl.querySelector('[data-actions]');
  if (!pending) {
    actions?.remove();
    if (busy.approval) {
      busy.approval = null;
      announce.textContent = DECISIONS[approval.status];
    }
    return;
  }
  const locked = busy.approval !== null || busy.stop;
  for (const [sel, key] of [['[data-approve]', 'approve'], ['[data-deny]', 'deny']]) {
    const button = actions.querySelector(sel);
    if (busy.approval === key) setBusy(button, true, key === 'approve' ? 'Sending approval' : 'Sending denial');
    else {
      setBusy(button, false);
      if (locked) button.setAttribute('aria-disabled', 'true');
    }
  }
}

function render(state) {
  const run = state.runs.get(RUN);
  const status = run?.status ?? 'starting';
  setStatus(runStatus, status);
  $('[data-run-controls]').setAttribute('data-status', status);
  const live = !isSettled(status);
  stopButton.hidden = !live;
  if (!live) busy.stop = false;
  setBusy(stopButton, live && busy.stop, 'Sending stop');

  for (const agent of selectRunAgents(state, RUN)) {
    const node = $(`[data-agent-status="${agent.id}"]`);
    if (node) setStatus(node, agent.status);
    $(`[data-agent-id="${agent.id}"]`)?.setAttribute('data-status', agent.status);
  }

  const lead = [...state.messages.values()].filter((m) => m.agentId === 'lead').at(-1);
  if (lead) {
    const box = $('[data-message="lead"]');
    box.querySelector('[data-text]').textContent = lead.text;
    box.setAttribute('data-complete', String(lead.complete));
    if (lead.complete) box.removeAttribute('aria-busy');
    else box.setAttribute('aria-busy', 'true');
  }

  for (const call of state.tools.values()) renderTool(call);

  const draft = state.drafts.get('draft-1');
  const draftBox = $('[data-draft]');
  draftBox.hidden = !draft;
  if (draft) {
    $('[data-draft-text]').textContent = draft.text;
    $('[data-draft-status]').textContent = draft.status === 'open' ? 'Still writing' : draft.status === 'complete' ? 'Finished' : 'Discarded';
    draftBox.setAttribute('data-status', draft.status);
  }

  renderApproval(state.approvals.get('approval-1'));

  const saved = [...state.artifacts.values()];
  $('[data-artifacts]').textContent = saved.length ? saved.map((a) => `${a.title ?? a.id} (${a.kind})`).join(', ') : 'Nothing saved yet.';

  const entries = selectActivity(state);
  if (entries.length && shownActivity === 0) activity.replaceChildren();
  for (const entry of entries.slice(shownActivity)) {
    const describe = ACTIVITY[entry.type];
    activity.append(el('li', { 'data-type': entry.type, 'data-seq': String(entry.seq) }, describe ? describe(entry, state) : entry.type));
  }
  shownActivity = entries.length;
}

function start() {
  timers.forEach(clearTimeout);
  timers = [];
  seq = 0;
  busy = { approval: null, stop: false };
  shownActivity = 0;
  tools.clear();
  toolsHost.replaceChildren();
  approvalEl?.remove();
  approvalEl = null;
  activity.replaceChildren(el('li', { 'data-empty': '' }, 'No events yet.'));
  $('[data-message="lead"] [data-text]').textContent = 'Waiting for the run to start.';
  store = createAgentStore();
  store.subscribe(() => render(store.getSnapshot()));
  render(store.getSnapshot());
  emit(OPENING);
}

stopButton.addEventListener('click', () => {
  const run = store.getSnapshot().runs.get(RUN);
  if (busy.stop || !run || isSettled(run.status)) return;
  busy.stop = true;
  timers.forEach(clearTimeout);
  timers = [];
  render(store.getSnapshot());
  // A stopped run can no longer act on an open request, so the host expires it in the same answer.
  const open = store.getSnapshot().approvals.get('approval-1')?.status === 'pending';
  const steps = open ? [['writer', 'approval.resolved', { approvalId: 'approval-1', decision: 'expired' }], ...AFTER.stop] : AFTER.stop;
  timers.push(setTimeout(() => emit(steps, STEP / 3), HOST_DELAY));
});
replay.addEventListener('click', start);
start();
