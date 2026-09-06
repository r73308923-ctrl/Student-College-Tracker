# Studywell component and pattern inventory

Source: `artifacts/student-college-tracker/src/App.tsx` and
`artifacts/student-college-tracker/src/index.css`.

The source app does not ship a standalone component package. Its reusable
visual language is expressed through a small set of local primitives and
composition patterns. The design-system preview keeps the scaffolded accessible
primitives, themed by the extracted tokens, and records the source patterns
below as the migration contract.

| Family | Reference | Source evidence | Status |
| --- | --- | --- | --- |
| Button | `components/button.md` | `App.tsx:75-77`; pill shape, primary/secondary/ghost/danger variants | documented |
| Field and input | `components/field.md` | `App.tsx:79-82`; uppercase micro-labels, rounded controls, marigold focus ring | documented |
| Surface and card | `components/surface-card.md` | repeated `rounded-2xl border bg-card` compositions across dashboard pages | documented |
| Empty state | `components/empty-state.md` | `App.tsx:69-73`; centered icon, editorial title, concise supporting copy, optional action | documented |
| Loading and error feedback | `components/feedback.md` | `App.tsx:57-67`; soft skeletons and calm retry panels | documented |
| Studywell motion | `components/motion.md` | `index.css:109-113`; staged `enter` animations with short upward reveal | documented |

## Pilot

The initial preview focuses on the extracted foundations and the five most
reusable source patterns above. Product-specific dashboard compositions remain
in the Student College Tracker app and should not be copied into the shared
library.