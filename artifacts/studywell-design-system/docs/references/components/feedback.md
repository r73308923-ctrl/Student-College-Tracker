# Loading and error feedback

## Source

- `artifacts/student-college-tracker/src/App.tsx:57-67`

## Extracted behavior

- Loading uses rounded muted skeleton bars with no noisy animation language.
- Errors use a soft coral tint, a clear sentence, and a single retry action.

## Design rules

- Preserve page structure while loading.
- Describe the user impact before mentioning a technical cause.
- Make recovery explicit with a retry action.