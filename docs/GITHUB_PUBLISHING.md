# GitHub Publishing Checklist

## Before the first public push

1. Run `npm install` locally to install dependencies and generate `package-lock.json`; commit the lockfile with the public repository.
2. Run `npm run ci`.
3. Confirm `.env` does not appear in `git status`.
4. Confirm there are no Google keys, calendar IDs, passwords, or private client data in the repository.
5. Keep `DEMO_MODE=true` for the public demo deployment.
6. Capture screenshots from the running app for the README/portfolio.

## Suggested repository name

`huntsville-boxing-calendar`

## Suggested repository description

`Full-stack touch-friendly scheduling dashboard for Huntsville Boxing Club, built with vanilla JavaScript, Node.js, Express, and a Google Calendar integration layer.`

## First commit flow

```bash
git init
git add .
git commit -m "Initial public release of Huntsville Boxing Club calendar"
git branch -M main
git remote add origin <YOUR_NEW_REPOSITORY_URL>
git push -u origin main
```

## Demo deployment

For the first hosted version, keep fake schedule data enabled:

```env
DEMO_MODE=true
TIME_ZONE=America/Chicago
REFRESH_SECONDS=60
```

No Google credentials are required in demo mode.
