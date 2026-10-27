# Public Demo Deployment

The first public deployment should use **fake schedule data only**. This is the version to link from GitHub, LinkedIn, and the portfolio while the real gym Calendar connection is still being finalized.

## Environment

```env
DEMO_MODE=true
TIME_ZONE=America/Chicago
REFRESH_SECONDS=60
```

Do not add Google Calendar credentials to the public demo deployment.

## Deployment flow

```text
Local project
    ↓
GitHub repository
    ↓
Node-capable hosting platform
    ↓
Public HTTPS URL
    ↓
LinkedIn / portfolio / Coach demo
```

## Acceptance checks after deployment

- Week, Day, and Month views load.
- All seven days fit in Week view on a 16:9 desktop display.
- Anime boxer is fully visible in the lower-left.
- Today’s Agenda and Upcoming Events populate from sample data.
- LIVE NOW / UP NEXT behaves correctly for current sample events.
- Members, Classes, Events, and Announcements navigation works.
- Refreshing the URL does not produce a 404.
- `/api/health` returns `ok: true`.
- Browser developer console has no uncaught errors.

## When to connect the real gym calendar

Only after the public demo is accepted visually and the coach is ready for live scheduling. Then use a private deployment environment with a dedicated Huntsville Boxing Club Google Calendar and server-side credentials.
