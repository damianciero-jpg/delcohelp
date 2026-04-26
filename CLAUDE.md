# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build (CI must be unset — see Deploy)
npm test           # Jest/React Testing Library (watch mode)
```

**Deploy (Windows):**
```bash
set "CI=" && npm run build
set CI=false && vercel --prod --force
```
Never set `CI=true` — it causes the build to fail on warnings.

## Architecture

**DelcoHelp** is a bilingual (EN/ES/VI/ZH) Progressive Web App serving food pantries, government benefits, and emergency resources in Delaware County, PA.

### Multi-tenant Design
The same codebase serves three apps:
- **DelcoHelp** (main) — `src/App.js`
- **SJC white-label** (St. John Chrysostom Parish) — `src/SJC.js`, mounted at `/sjc` route
- **RPPC** (Ridley Park Presbyterian Church) — separate repo at `C:\Users\dciel\rppc-community`

All three must remain in **feature parity**. When adding a feature to any one, mirror it to the others.

### Source Layout
- `src/App.js` — entire main app UI (~919 lines): tab navigation, all screens, `RESOURCES`/`BENEFITS`/`HOTLINES` data arrays, `T` translation object, inline CSS
- `src/SJC.js` — white-label variant with custom `BRAND` config (navy/gold/burgundy) and SJC-specific copy
- `src/features.js` — reusable components: `InstallPrompt`, `PantryStatusWidget`, `EligibilityQuiz`, `TransitHelper`, `StoriesSection`, `DietaryFilters`, `LanguageSelector`, `SMSAccessCard`, `trackEvent`
- `api/chat.js` — Vercel serverless: proxies chat to Anthropic Claude API (`claude-sonnet-4-6`)
- `api/sms.js` — Vercel serverless: Twilio SMS webhook (keywords: FOOD, HELP, SNAP, CRISIS, HOUSING)
- `api/youtube.js` — Vercel serverless: YouTube Data API v3 proxy (whitelisted channels)

### Key Patterns
- **No routing library** — tab state is `useState`, `/sjc` path check is a string match on `window.location.pathname`
- **All data hardcoded** — `RESOURCES`, `BENEFITS`, `HOTLINES` arrays live in `App.js`; `localStorage` backs crowdsourced pantry status and analytics
- **CSS-in-JS** — styles injected via a `<style>` tag in `App.js`; base styles in `src/index.css`
- **AI model string** — always `"claude-sonnet-4-6"` in `api/chat.js`

### Environment Variables (Vercel)
| Variable | Used by |
|---|---|
| `ANTHROPIC_API_KEY` | `api/chat.js` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | `api/sms.js` |
| `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID` | `api/youtube.js` |

## Rules

- **No TypeScript** — plain JavaScript only, always.
- **ESLint unused vars** — add `// eslint-disable-next-line no-unused-vars` when needed rather than removing intentionally kept variables.
- **AI model** — use `"claude-sonnet-4-6"` as the model string in API calls.
