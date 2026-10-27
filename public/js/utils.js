import { state } from './state.js';

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const formatDate = (date, options) => new Intl.DateTimeFormat('en-US', {
  timeZone: state.config.timeZone,
  ...options,
}).format(date);

export const formatTime = (date) => formatDate(date, { hour: 'numeric', minute: '2-digit' });

export function formatWeekRange(start, end) {
  const startMonth = formatDate(start, { month: 'long' });
  const startMonthShort = formatDate(start, { month: 'short' });
  const startDay = formatDate(start, { day: 'numeric' });
  const endMonthShort = formatDate(end, { month: 'short' });
  const endDay = formatDate(end, { day: 'numeric' });
  const endYear = formatDate(end, { year: 'numeric' });

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay} – ${endDay}, ${endYear}`;
  }

  return `${startMonthShort} ${startDay} – ${endMonthShort} ${endDay}, ${endYear}`;
}

export const localDateKey = (date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: state.config.timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date);

export const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

export const getWeekStart = (date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + mondayOffset);
  copy.setHours(12, 0, 0, 0);
  return copy;
};

export const eventStart = (event) => new Date(event.start);
export const eventEnd = (event) => new Date(event.end || event.start);
export const isSameLocalDay = (a, b) => localDateKey(a) === localDateKey(b);

export function eventTone(event) {
  const title = event.title.toLowerCase();
  if (title.includes('private')) return 'gold';
  if (title.includes('open gym') || title.includes('conditioning') || title.includes('fundamentals') || title.includes('technique')) return 'neutral';
  if (event.type === 'featured' || title.includes('fight')) return 'special';
  return 'red';
}

export function getLocalHourMinute(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: state.config.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { hour: Number(map.hour), minute: Number(map.minute) };
}

export function currentStatus(event, now = new Date()) {
  if (event.allDay) return '';
  if (now >= eventStart(event) && now < eventEnd(event)) return 'LIVE NOW';
  if (now < eventStart(event) && eventStart(event) - now <= 90 * 60_000) return 'UP NEXT';
  return '';
}

export function countdownLabel(target, now = new Date()) {
  const minutes = Math.max(0, Math.ceil((target - now) / 60_000));
  if (minutes < 1) return 'starting now';
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `in ${hours}h ${remaining}m` : `in ${hours}h`;
}
