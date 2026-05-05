# Codex Project Rules

## Scope

- Primary focus is the DelcoHelp main app at `/` and Philadelphia routes at `/philadelphia` and `/philly`.
- SJC at `/sjc` and all other sections are on hold.
- Do not modify SJC unless a shared component fix requires it.

## Change Policy

- Make minimal, targeted changes.
- Do not rewrite the app or redo completed work.
- Do not change app functionality unless the task explicitly requires it.
- Do not touch unrelated files.

## Verification

- Always run `npm run build` before committing.
- Fix build errors only when they are caused by the current changes.

## Deployment Notes

- This is a React single-page app.
- `vercel.json` should keep SPA direct-route support:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
