# HBC Calendar Architecture

## Request flow

```text
Coach updates dedicated HBC Google Calendar
        ↓
Google Calendar API (events read-only)
        ↓
src/googleCalendar.js
        ↓
GET /api/events (server.js)
        ↓
public/js/api.js
        ↓
state.events
        ↓
public/js/renderer.js
        ↓
Gym interactive display / kiosk browser
```

## Security boundary

The browser receives normalized public schedule data only. Google service-account credentials are read by Node from environment variables and are never rendered into HTML or returned by `/api/config` or `/api/events`.

Production should use a dedicated **Huntsville Boxing Club** secondary calendar owned by Coach, not his primary/personal calendar. The app receives reader access only and uses the `calendar.events.readonly` OAuth scope.

## API hardening

- Event requests are limited to a bounded date range.
- Unknown `/api/*` routes return JSON 404 responses.
- Missing static assets return real 404 responses instead of accidentally falling back to `index.html`.
- Production startup fails clearly if required Google Calendar environment values are missing.

## Failure behavior

1. Browser polls the server on the configured refresh interval.
2. Successful responses replace the in-memory schedule and update the last-known browser cache.
3. If a request fails, the last successful schedule remains visible with the cache age.
4. If cached schedule data is older than 24 hours, the display explicitly warns that it may be stale.
5. If there is no cache, the interface shows a schedule-unavailable state instead of failing silently.
6. On deployed origins, a service worker caches the application shell while deliberately leaving `/api/*` responses out of the service-worker cache.

## Demo / production isolation

`DEMO_MODE=true` uses `src/demoEvents.js`. `DEMO_MODE=false` switches the same API contract to Google Calendar. Sample events therefore never need to be placed in the real gym calendar.
