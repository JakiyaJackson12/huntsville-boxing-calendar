import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWeekRange } from '../public/js/utils.js';

test('formatWeekRange produces a clean same-month label', () => {
  const start = new Date('2026-10-12T12:00:00-05:00');
  const end = new Date('2026-10-18T12:00:00-05:00');
  assert.equal(formatWeekRange(start, end), 'October 12 – 18, 2026');
});

test('formatWeekRange handles a cross-month week', () => {
  const start = new Date('2026-10-26T12:00:00-05:00');
  const end = new Date('2026-11-01T12:00:00-06:00');
  assert.equal(formatWeekRange(start, end), 'Oct 26 – Nov 1, 2026');
});
