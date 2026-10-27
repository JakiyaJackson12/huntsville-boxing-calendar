import { google } from 'googleapis';
import { config } from './config.js';
import { normalizeGoogleEvent } from './calendarEvent.js';

function createCalendarClient() {
  if (!config.googleClientEmail || !config.googlePrivateKey) {
    throw new Error('Google Calendar service-account credentials are not configured.');
  }

  const auth = new google.auth.JWT({
    email: config.googleClientEmail,
    key: config.googlePrivateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events.readonly'],
  });

  return google.calendar({ version: 'v3', auth });
}

export async function fetchGoogleEvents(from, to) {
  if (!config.calendarId) throw new Error('GOOGLE_CALENDAR_ID is not configured.');

  const calendar = createCalendarClient();
  const items = [];
  let pageToken;

  do {
    const response = await calendar.events.list({
      calendarId: config.calendarId,
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      pageToken,
      timeZone: config.timeZone,
      showDeleted: false,
    });

    items.push(...(response.data.items || []));
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return items.map(normalizeGoogleEvent).filter((event) => event.start && event.end);
}
