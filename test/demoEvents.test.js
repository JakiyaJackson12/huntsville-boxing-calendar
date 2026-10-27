import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoEvents } from '../src/demoEvents.js';

test('demo schedule has unique IDs and required event fields', () => {
  const events = buildDemoEvents(new Date('2026-10-12T12:00:00-05:00'));
  assert.ok(events.length > 20);
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
});
