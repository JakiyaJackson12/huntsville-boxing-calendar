const DAY_MS = 86_400_000;
export const MAX_EVENT_RANGE_DAYS = 180;

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

export function parseEventRange(query = {}, now = new Date()) {
  const from = query.from ? new Date(String(query.from)) : addDays(now, -30);
  const to = query.to ? new Date(String(query.to)) : addDays(now, 90);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    return { ok: false, error: 'Invalid date range.' };
  }

  if ((to - from) / DAY_MS > MAX_EVENT_RANGE_DAYS) {
    return { ok: false, error: `Date range cannot exceed ${MAX_EVENT_RANGE_DAYS} days.` };
  }

  return { ok: true, from, to };
}
