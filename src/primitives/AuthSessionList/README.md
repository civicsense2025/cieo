# AuthSessionList

Device session list with per-device revoke buttons and a text-marked current session.

See the component props in `manifest.json`. The current session reads "This device" in text (never colour alone) and carries no revoke button, so it cannot be revoked by mistake.

Removing a session is immediate. Rows that remain reflow on Cieo's base spring without a page-load entrance. Reduced motion and `data-motion="off"` keep the reflow instant.
