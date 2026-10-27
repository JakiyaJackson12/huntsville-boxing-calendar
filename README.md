# Huntsville Boxing Club Digital Calendar

A client-directed, touch-friendly digital scheduling dashboard for **Huntsville Boxing Club**. The interface was iterated from direct coach feedback and is designed for a large interactive gym display: premium dark navy/black styling, red accents, a compact seven-day agenda, left navigation, Today's Agenda / Upcoming Events, a live clock/date, and the approved anime boxer in the lower-left.

> **Public demo status:** this repository runs with realistic **sample data by default**. It does not contain the coach's private schedule or Google credentials. Production Google Calendar integration and final gym-board deployment are separate release milestones.

## What it does

- Week, Day, and Month schedule views
- Today's Agenda and Upcoming Events
- **LIVE NOW / UP NEXT** awareness based on current time
- Members, Classes, Events, and Announcements screens
- Automatic schedule refresh
- Demo-mode isolation for safe public presentation
- Last-known schedule fallback with stale-data warnings
- Production app-shell caching for temporary network outages
- Google Calendar adapter with server-side credentials and read-only access
- Health endpoint and bounded event-query validation
- Automated syntax checks and tests
- GitHub Actions CI on Node 20 and Node 24

## Stack

- **Frontend:** semantic HTML, CSS, vanilla JavaScript ES modules
- **Backend:** Node.js + Express
- **Calendar integration:** Google Calendar API
- **Data format:** REST/JSON
- **Security:** Helmet/CSP, server-only environment credentials, plain-text event normalization, bounded API inputs
- **Reliability:** automatic polling, local last-known schedule cache, stale-data warnings, compression, service-worker app-shell fallback
- **Testing:** Node's built-in test runner + syntax checks + GitHub Actions

### Motion detail

The lower-left anime boxer uses subtle CSS idle movement and an occasional JavaScript-triggered two-beat boxing feint. The motion automatically disables when the device requests reduced motion, keeping the kiosk accessible and non-distracting.

## Architecture

```text
Google Calendar (production)
          ↓
Node.js + Express API
          ↓
Normalized JSON events
          ↓
Vanilla JavaScript renderer
          ↓
Week / Day / Month + Agenda + Live Status
          ↓
Interactive gym display / kiosk browser
```

In public demo mode, `src/demoEvents.js` replaces Google Calendar as the event source while the rest of the application architecture stays the same.

## Code structure

```text
huntsville-boxing-calendar/
├── .github/workflows/ci.yml
├── docs/
│   ├── GITHUB_PUBLISHING.md
│   └── LINKEDIN_PORTFOLIO.md
├── public/
│   ├── assets/anime-boxer.png
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── renderer.js
│   │   ├── state.js
│   │   └── utils.js
│   ├── index.html
│   ├── styles.css
│   └── sw.js
├── src/
│   ├── calendarEvent.js
│   ├── config.js
│   ├── dateRange.js
│   ├── demoEvents.js
│   └── googleCalendar.js
├── test/
├── server.js
├── ARCHITECTURE.md
├── KIOSK_SETUP.md
└── RELEASE_CHECKLIST.md
```

## Run locally

Requires **Node.js 20+**.

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
```

Keep this setting for the public/demo version:

```env
DEMO_MODE=true
```

Do **not** use VS Code **Go Live**. This is a full-stack application and needs the Node/Express server.

## Quality checks

```bash
npm run check
npm test
# or both:
npm run ci
```

## Production Google Calendar design

The intended production setup uses a dedicated secondary Google Calendar named **Huntsville Boxing Club**, rather than the coach's personal primary calendar. The backend uses read-only event access and keeps credentials in server-side environment variables.

Production variables:

```env
DEMO_MODE=false
GOOGLE_CALENDAR_ID=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

Never commit `.env`, service-account keys, or Google credentials.

## Reliability decisions

- Browser refreshes schedule data automatically.
- Last successful events are cached locally for temporary API/network failures.
- Cached data displays its age and warns when it may be stale.
- The production service worker uses **network-first, cache-fallback** behavior so online users receive current CSS/JavaScript while the last working app shell remains available offline.
- Missing assets return real 404s instead of silently returning the HTML shell.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — technical architecture and data flow
- [`KIOSK_SETUP.md`](KIOSK_SETUP.md) — display/kiosk setup notes
- [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) — production acceptance checklist
- [`docs/LINKEDIN_PORTFOLIO.md`](docs/LINKEDIN_PORTFOLIO.md) — truthful LinkedIn/portfolio copy
- [`docs/GITHUB_PUBLISHING.md`](docs/GITHUB_PUBLISHING.md) — clean public-repo steps
- [`docs/DEMO_DEPLOYMENT.md`](docs/DEMO_DEPLOYMENT.md) — fake-data public deployment checklist

## Current status

The approved UI, sample-data demo, reliability layer, Calendar adapter, and automated tests are ready for public GitHub/portfolio presentation. The application should only be described as **deployed at the gym** after the live URL, real Calendar connection, and gym-board acceptance test are completed.
