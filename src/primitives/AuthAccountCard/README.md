# AuthAccountCard

Profile row with sign out. When `signOutConfirm` is true, sign out opens an inline "Sign out of all devices?" step with Confirm and Cancel instead of signing out at once.

See the component props in `manifest.json`. The confirm question uses `role="status"` text, never colour alone.

The sign-out and confirm panes crossfade on the base motion token while the card height follows the soft spring. Focus moves to the next action immediately; reduced motion and `data-motion="off"` switch instantly.
