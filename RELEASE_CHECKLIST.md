# Huntsville Boxing Club — Production Release Checklist

## 1. Visual acceptance
- [ ] Open the dashboard at 1920x1080.
- [ ] Confirm Monday-Sunday are all visible in Week view.
- [ ] Confirm the anime boxer shows the approved hair/profile composition.
- [ ] Test Week, Day, Month, Members, Classes, Events, and Announcements.
- [ ] Verify touch targets are comfortable on the gym board.

## 2. Google Calendar production setup
- [ ] Coach creates a dedicated secondary Google Calendar named **Huntsville Boxing Club** under his Google account.
- [ ] Do not connect the app to Coach's personal primary calendar.
- [ ] Share the dedicated calendar with the service-account email using reader access only.
- [ ] Add only public gym schedule information to this calendar; no payment, medical, or sensitive member notes.
- [ ] Set `GOOGLE_CALENDAR_ID`, `GOOGLE_CLIENT_EMAIL`, and `GOOGLE_PRIVATE_KEY` in the deployment environment.
- [ ] Set `DEMO_MODE=false`.
- [ ] Verify a Coach edit appears on the dashboard after the refresh interval.

## 3. Reliability
- [ ] Confirm `/api/health` returns `ok: true`.
- [ ] Disconnect the network while the app is already open; last-known schedule remains visible with an offline warning.
- [ ] Restore the network; sync indicator returns to live.
- [ ] On the deployed URL, reload once online so the offline app shell is cached.
- [ ] Confirm the page can reopen from the cached shell during a temporary network outage after the first successful load.

## 4. Gym board / kiosk
- [ ] Confirm the exact board/browser can open the production URL.
- [ ] If using a kiosk PC, configure browser auto-launch and disable PC sleep while plugged in.
- [ ] Reboot the display setup and verify the dashboard returns without manual navigation.
- [ ] Verify touch input, if available, maps correctly to buttons.

## 5. Dependency / repository hygiene
- [ ] Run `npm install` locally and commit the generated `package-lock.json` before publishing the repository.
- [ ] Run `npm audit --omit=dev` and review any reported production dependency issues.
- [ ] Run `npm run check` and `npm test` before the release commit.
- [ ] Confirm `.env` and Google credentials are not tracked by Git.

## 6. Portfolio / LinkedIn
- [ ] Capture a clean Week-view screenshot from the actual running app.
- [ ] Capture a Day/Month or Live/Up Next screenshot.
- [ ] Record the final deployment URL and date.
- [ ] Update README status from "production milestone pending" to "deployed" only after Coach is actually using it.
- [ ] Add the project to LinkedIn only with claims that are true at that time.
