export const state = {
  section: 'schedule',
  view: 'week',
  anchorDate: new Date(),
  events: [],
  config: {
    clubName: 'Huntsville Boxing Club',
    city: 'Huntsville, TX',
    timeZone: 'America/Chicago',
    refreshSeconds: 60,
    demoMode: true,
  },
  source: 'demo',
  syncedAt: null,
};
