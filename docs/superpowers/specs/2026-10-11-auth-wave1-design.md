# Auth set, Wave 1: password and code flows — design

Date: 2026-10-11. Approach A (three waves by flow), Wave 1 scope: sign in, sign up, password reset, OTP, magic link, MFA enrolment, recovery codes. Location: primitives plus recipes.

## Background

The catalogue has auth fragments (`otp`, `password`, `signupform`, `signupfields`, `authshell`, `oauthgrant`) but no coherent set. Wave 1 covers password and code-based flows. Wave 2 covers passkeys, SSO buttons, and OAuth consent polish. Wave 3 covers org invites, sessions, and account screens.

## Architecture

New primitives under `src/primitives/`, one folder per component, each with the component file, `manifest.json`, and `README.md`, plus styles in `design/styles/primitives/` and wired exports (index, package deep exports, component pages) via the existing `wire-primitives` flow:

- Atoms: `AuthEmailField`, `AuthPasswordInput` (strength meter, show/hide), `AuthOtpInput` (digit boxes, paste split).
- Molecules: `AuthCredentialForm` (email plus password plus submit plus inline errors), `AuthMfaChallenge` (OTP plus recovery-code fallback toggle), `AuthResetForm` (request plus confirm).
- Organisms: `AuthSignInCard`, `AuthSignUpCard`, `AuthResetFlow`, `AuthMfaFlow` (full cards with headings, alternative routes, and status regions).

Recipe demos in `atoms/web/blocks/` extend the existing `otp`, `password`, and `authshell` recipes rather than replacing them.

## Components

- Atoms own a single field: labels, input edges, strength segments, OTP boxes, show/hide toggle. No flow knowledge.
- Molecules compose fields with a submit, inline per-field errors, and a form-level status. They accept an `onSubmit` and render pending, success, and error states.
- Organisms compose a full card: heading, molecule, alternative-route links (e.g. "Use a recovery code", "Resend code with countdown"), and a `role="status"` region for async results.

## Data flow

Primitives are presentational. Recipes own state with the existing `Track`/`Swap` spring helpers. Validation runs on input, not only on submit. Errors bind through `aria-describedby` on the field plus `role="alert"` on the message. No auth secrets in logs, screenshots of typed secrets, or commits.

## Error handling

Inline field errors (bad email, weak password, short code); wrong-code clear-and-retry after a beat; rate-limit note with resend countdown; recovery-code fallback path; show/hide toggle keeps focus on the input. Every error has text, never colour alone.

## Styling and accessibility constraints

Flat design: inputs use the `1.5px solid var(--muted)` edge required by WCAG 1.4.11; text buttons and cards use fills, not hairline borders. Text meets 4.5:1, control edges 3:1, focus visible with 2px accent outline. Touch targets 44px on phone and coarse pointers. Every control has an accessible name.

## Testing

`wire-primitives` check, new recipe blocks pass `check-recipes`, Playwright flows (bad email, weak password, wrong OTP, resend countdown, recovery-code switch) with screenshots, axe `label`/`button-name`/contrast scoped to the new atoms, `npm run check` and the composites gate stay green.

## Waves 2 and 3 (outline, not this spec)

- Wave 2: `AuthPasskeyButton`, `AuthSsoButtons`, OAuth consent polish, WebAuthn fallback notes.
- Wave 3: `AuthInviteAccept`, `AuthSessionList`, `AuthAccountCard`, sign-out confirmation.
