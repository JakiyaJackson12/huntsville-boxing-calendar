import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_EVENT_RANGE_DAYS, parseEventRange } from '../src/dateRange.js';

test('parseEventRange accepts a valid bounded range', () => {
  const result = parseEventRange({
    from: '2026-10-01T00:00:00-05:00',
    to: '2026-10-31T23:59:59-05:00',
  });
  assert.equal(result.ok, true);
  assert.ok(result.from instanceof Date);
  assert.ok(result.to instanceof Date);
});

test('parseEventRange rejects invalid and oversized ranges', () => {
  assert.equal(parseEventRange({ from: 'bad', to: '2026-10-31T00:00:00Z' }).ok, false);

  const from = new Date('2026-01-01T00:00:00Z');
  const to = new Date(from.getTime() + (MAX_EVENT_RANGE_DAYS + 1) * 86_400_000);
  const result = parseEventRange({ from: from.toISOString(), to: to.toISOString() });
  assert.equal(result.ok, false);
});
