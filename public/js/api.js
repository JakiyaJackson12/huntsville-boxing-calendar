import { addDays } from './utils.js';

const CACHE_KEY = 'hbc-events-cache-v4';

export async function fetchAppConfig() {
  const response = await fetch('/api/config', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load application configuration.');
  return response.json();
}

export async function fetchCalendarEvents() {
  const from = addDays(new Date(), -45);
  const to = addDays(new Date(), 100);
  const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  const response = await fetch(`/api/events?${params}`, { cache: 'no-store' });

  if (!response.ok) throw new Error('Unable to load calendar events.');
  return response.json();
}

export function saveEventCache({ events, syncedAt }) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      syncedAt: syncedAt || null,
      events,
    }));
  } catch {
    // Kiosk storage can be disabled; the live app should still work without cache.
  }
}

export function readEventCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.events) || !Number.isFinite(parsed.savedAt)) return null;
    return parsed;
  } catch {
    return null;
  }
}
