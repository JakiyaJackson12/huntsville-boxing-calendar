const decodeCommonEntities = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'");

export function calendarDescriptionToText(value = '') {
  return decodeCommonEntities(String(value)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/#featured|#announcement/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeGoogleEvent(event = {}) {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;
  const rawDescription = event.description || '';
  const tags = rawDescription.toLowerCase();

  return {
    id: event.id || `google-${start || 'unknown'}-${event.summary || 'event'}`,
    title: event.summary || 'Untitled Event',
    start,
    end,
    allDay: Boolean(event.start?.date && !event.start?.dateTime),
    location: event.location || '',
    description: calendarDescriptionToText(rawDescription),
    type: tags.includes('#announcement') ? 'announcement' : tags.includes('#featured') ? 'featured' : 'class',
  };
}
