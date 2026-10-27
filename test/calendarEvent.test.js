import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDescriptionToText, normalizeGoogleEvent } from '../src/calendarEvent.js';

test('calendar descriptions become safe readable plain text', () => {
  assert.equal(
    calendarDescriptionToText('<b>Team Event</b><br>#featured Bring wraps &amp; water'),
    'Team Event Bring wraps & water',
  );
});

test('normalizeGoogleEvent preserves schedule fields and tags event type', () => {
  const event = normalizeGoogleEvent({
    id: 'abc123',
    summary: 'Fight Night',
    description: '<b>In-House Event</b> #featured',
    location: 'Huntsville Boxing Club',
    start: { dateTime: '2026-10-30T19:00:00-05:00' },
    end: { dateTime: '2026-10-30T21:00:00-05:00' },
  });

  assert.equal(event.type, 'featured');
  assert.equal(event.description, 'In-House Event');
  assert.equal(event.allDay, false);
  assert.equal(event.title, 'Fight Night');
});

test('normalizeGoogleEvent recognizes all-day announcements', () => {
  const event = normalizeGoogleEvent({
    id: 'closed',
    summary: 'Gym Closed',
    description: '#announcement Holiday closure',
    start: { date: '2026-12-25' },
    end: { date: '2026-12-26' },
  });

  assert.equal(event.type, 'announcement');
  assert.equal(event.allDay, true);
  assert.equal(event.description, 'Holiday closure');
});
