import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoEvents } from '../src/demoEvents.js';

test('demo schedule has unique IDs and required event fields', () => {
  const events = buildDemoEvents(new Date('2026-10-12T12:00:00-05:00'));
  assert.ok(events.length > 300);
  assert.equal(new Set(events.map((event) => event.id)).size, events.length);

  for (const event of events) {
    assert.ok(event.id);
    assert.ok(event.title);
    assert.ok(event.start);
    assert.ok(event.end);
    assert.ok(['class', 'featured', 'announcement'].includes(event.type));
    assert.ok(new Date(event.end) >= new Date(event.start));
  }
});

test('demo schedule includes production-relevant event categories', () => {
  const events = buildDemoEvents(new Date('2026-10-12T12:00:00-05:00'));
  assert.ok(events.some((event) => event.type === 'featured'));
  assert.ok(events.some((event) => event.type === 'announcement'));
  assert.ok(events.some((event) => event.title === 'Youth Boxing'));
  assert.ok(events.some((event) => event.title === 'Open Gym'));
  assert.ok(events.some((event) => event.title === 'Fight Night'));
});

test('demo schedule stays populated across multiple months', () => {
  const events = buildDemoEvents(new Date('2026-10-27T12:00:00-05:00'))
    .filter((event) => event.type !== 'announcement');

  const starts = events.map((event) => new Date(event.start)).sort((a, b) => a - b);
  const spanDays = (starts.at(-1) - starts[0]) / (24 * 60 * 60_000);
  const youthBoxingCount = events.filter((event) => event.title === 'Youth Boxing').length;
  const saturdaySparringCount = events.filter((event) => event.title === 'Saturday Sparring').length;

  assert.ok(spanDays >= 160);
  assert.ok(youthBoxingCount >= 40);
  assert.ok(saturdaySparringCount >= 20);
});
