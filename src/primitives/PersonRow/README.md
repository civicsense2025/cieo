# PersonRow

A person beside their name and one detail line; compact is a roll-call entry.

## Use when

- Sponsors, members or authors are listed by name.

## Avoid when

- The row needs actions; wrap it in ListItem.

## Anatomy

Root `div.cieo-p-person-row`: Portrait then name and detail.

## Behavior

Names never wrap.

## Keyboard / accessibility

- The Portrait is hidden; the name speaks.

## Do / don't

- Do: `<PersonRow name="Sen. Capito" detail="R-W.Va. · Sponsor" ring="var(--party-r)" />`
- Don't: Don't abbreviate titles inconsistently.

## Apple twin

`CieoUI.PersonRow` with the same name and rules; see docs/apple-components.md.
