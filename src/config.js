const parsePositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const config = Object.freeze({
  port: parsePositiveNumber(process.env.PORT, 3000),
  timeZone: process.env.TIME_ZONE || 'America/Chicago',
  demoMode: String(process.env.DEMO_MODE || 'true').toLowerCase() === 'true',
  calendarId: process.env.GOOGLE_CALENDAR_ID || '',
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  refreshSeconds: Math.max(30, parsePositiveNumber(process.env.REFRESH_SECONDS, 60)),
});

process.env.TZ = config.timeZone;

export function validateProductionConfig() {
  if (config.demoMode) return;

  const missing = [
    ['GOOGLE_CALENDAR_ID', config.calendarId],
    ['GOOGLE_CLIENT_EMAIL', config.googleClientEmail],
    ['GOOGLE_PRIVATE_KEY', config.googlePrivateKey],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Production calendar configuration is incomplete. Missing: ${missing.join(', ')}`);
  }
}
