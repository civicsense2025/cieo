# RunControls

A run's reported status and a Stop command while the run is live.

## Use when

- A header or toolbar lets a person stop a running agent.

## Avoid when

- You need pause or resume; those are host commands this does not model.

## Anatomy

`div.cieo.cieo-p-run-controls[role=group][aria-label][data-status]` → AgentStatus and, while live, a Stop Button.

## Behavior

- Stop renders only while the run is not settled (`isSettled` from `cieo/agent`) and `onStop` is passed.
- `busy` disables Stop and spins it. The status stays what the host last reported until the host reports the stop.

## Keyboard / accessibility

- The group is named "Run controls" by default.
- Stop stays focusable while busy; presses are ignored.

## Do / don't

- Do: set `busy` from your stop command's promise.
- Don't: set the run to `stopped` yourself after a click.

## Customization

`stopLabel`, `label`, `statusLabel` (translate the status words).

## Limitations

- Stop only; no restart.

## Related

AgentStatus, Button (`cieo/controls`).

## Evidence

`test/primitives-agent.test.mjs` (Stop hidden for every settled status, disabled while busy). No device acceptance yet.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
