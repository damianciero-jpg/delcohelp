# DelcoHelp Platform Overview

## What It Is

DelcoHelp is a free, bilingual mobile web app that connects Delaware County residents to food pantries, government benefits, and emergency resources — instantly, on any phone. No app store download required. No account needed. No barriers.

Available at **delcohelp.org**, it works like a native app: add it to your home screen, use it offline, receive notifications.

---

## The Problem It Solves

Families in crisis don't know what's available, can't find real-time hours, and can't navigate complex benefit applications on their own. Pantries go unstaffed because volunteers don't know how to sign up. Case workers spend hours on calls that a well-designed app could handle in seconds.

DelcoHelp closes that gap.

---

## Who Uses It

- **Families** seeking food, housing help, or government benefits
- **Case workers and social workers** referring clients to resources
- **Volunteers** looking for service opportunities
- **Community organizations** sharing resources with members
- **People in crisis** who need immediate help and a phone number to call

---

## Core Capabilities

### Find Resources
A searchable, filterable directory of food pantries, family assistance programs, legal aid, and community services across Delaware County — sorted by distance, with real-time open/closed status.

- Distance-based sorting from the user's zip code
- Open now / Opens later / Closed today indicators, crowdsourced by the community
- Hours, phone number, address, and directions for every listing
- Dietary filters: halal, kosher, vegetarian, no-pork, and more
- Resource inventory widget showing what items are available today

### Benefits Navigator
Step-by-step guidance through the benefits application process — without a caseworker.

- **Quick Eligibility Quiz:** 5 questions that identify which programs a user likely qualifies for (SNAP, WIC, LIHEAP, Medicaid, CHIP, Emergency Food)
- **Document Checklists:** Exactly what to bring for each application, with a visual progress tracker
- **SNAP Application Assistant:** A guided 4-step walkthrough from "What is SNAP?" to completing the application on PA COMPASS
- Direct links to Pennsylvania's official benefits portal

### Emergency & Crisis Support
- One-tap access to 10+ crisis hotlines: 988 Suicide & Crisis, PA 211, Domestic Violence Hotline, Crisis Text Line, Poison Control, and more
- **Emergency Mode:** One button surfaces the 3 closest open resources and urgent crisis numbers immediately
- **Crisis Escape Plan:** A private, device-only safety plan for users in dangerous situations — first call, first location, safe contact with a tap-to-call button. Never uploaded. Never tracked.

### Ask AI
A Claude-powered AI assistant that answers questions in plain language: "I need food near me tonight," "How do I apply for SNAP?", "I'm facing eviction." Routes crisis questions to 988 and 911.

### SMS Text-Back
Users without smartphones can text keywords to **(877) 473-4752**:

| Text | Response |
|---|---|
| FOOD | Nearest food pantries with hours and phone |
| SNAP | Income limits and how to apply |
| CRISIS | Crisis hotlines and text lines |
| HOUSING | Housing assistance and legal aid |
| HELP | All options |

Works on any phone, including flip phones.

### Family Tools
- **Family Profile:** Household size, zip, and special needs — personalizes every recommendation
- **Save Resources:** Bookmark pantries for quick access later
- **"I'm Going Tonight":** One tap marks a visit; app sends a reminder before closing time
- **"I Found Help Here":** Users confirm they received assistance, generating real impact data
- **Shared Resource Plan:** Curate and share a personal list of resources via text or email

---

## Accessibility

| Feature | Detail |
|---|---|
| Languages | English, Spanish, Vietnamese, Chinese |
| SMS fallback | Works on any phone, no internet required |
| Offline access | Full app cached for offline use via PWA |
| No account required | Zero signup friction |
| Large touch targets | Designed for all ages and abilities |

---

## Impact Tracking

Every interaction — resource views, benefits applications, AI chats, donations, volunteer signups — is tracked anonymously for grant reporting. No personally identifiable information is collected or stored on any server.

Metrics available:
- Users reached
- Resources found
- Benefits applications started
- Families helped
- Donations processed
- Volunteer hours logged

---

## Technology

- Progressive Web App (PWA) — works on iOS and Android, installable to home screen
- Hosted on Vercel — 99.9% uptime, global CDN
- AI powered by Anthropic Claude
- SMS powered by Twilio
- No backend required for core features — offline-first architecture
- Built with React; deployed in minutes

---

## Pricing

**DelcoHelp.org is free for all residents of Delaware County, PA.**

For organizations interested in a branded version for their community, see the *White-Label Program* document.

---

*DelcoHelp is a product of CieroLink LLC. For partnership inquiries, contact damianciero@gmail.com.*
