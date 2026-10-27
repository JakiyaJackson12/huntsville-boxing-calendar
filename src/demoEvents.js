const DAY_MS = 24 * 60 * 60_000;

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const getMonday = (date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const localDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const makeEvent = ({ date, hour, minute = 0, duration = 60, title, description, type = 'class', location = 'Huntsville Boxing Club' }) => {
  const start = new Date(date);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + duration * 60_000);

  return {
    id: `demo-${localDateKey(start)}-${hour}-${minute}-${slugify(title)}`,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    location,
    description,
    type,
  };
};

const WEEKDAY_SCHEDULE = {
  1: [
    [6, 0, 60, 'Morning Boxing', 'All Levels'],
    [12, 0, 60, 'Open Gym', 'Members Only'],
    [17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [18, 30, 90, 'Adult Boxing', 'All Levels'],
  ],
  2: [
    [6, 0, 60, 'Morning Boxing', 'All Levels'],
    [10, 30, 60, 'Private Session', 'Coach-led training'],
    [17, 0, 60, 'Youth Skills Clinic', 'Ages 8–15'],
    [18, 30, 90, 'Women’s Boxing', 'All Levels'],
  ],
  3: [
    [6, 0, 60, 'Morning Boxing', 'All Levels'],
    [9, 30, 60, 'Conditioning', 'All Levels'],
    [17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [18, 30, 90, 'Sparring', 'Coach Approval'],
  ],
  4: [
    [6, 0, 60, 'Morning Boxing', 'All Levels'],
    [12, 0, 60, 'Open Gym', 'Members Only'],
    [17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [18, 30, 90, 'Adult Boxing', 'All Levels'],
  ],
  5: [
    [6, 0, 60, 'Morning Boxing', 'All Levels'],
    [10, 0, 60, 'Technique Drills', 'Intermediate'],
    [17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [18, 30, 90, 'Sparring', 'All Levels'],
  ],
  6: [
    [8, 0, 90, 'Open Gym', 'All Members'],
    [10, 0, 90, 'Coach Workshop', 'Footwork & Defense'],
    [12, 30, 90, 'Saturday Sparring', 'All Levels'],
  ],
  0: [
    [10, 0, 75, 'Community Boxing Clinic', 'All Welcome'],
  ],
};

const buildRecurringClasses = (rangeStart, rangeEnd) => {
  const events = [];
  const cursor = new Date(rangeStart);

  while (cursor <= rangeEnd) {
    const schedule = WEEKDAY_SCHEDULE[cursor.getDay()] || [];
    schedule.forEach(([hour, minute, duration, title, description]) => {
      events.push(makeEvent({ date: cursor, hour, minute, duration, title, description }));
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return events;
};

const buildFeaturedEvents = (rangeStart, rangeEnd) => {
  const events = [];
  const firstMonday = getMonday(rangeStart);
  const featuredTemplates = [
    ['Fight Night', 'In-House Event', 18, 180],
    ['Technique Workshop', 'Defense, counters & footwork', 10, 120],
    ['Youth Skills Clinic', 'Ages 8–15', 10, 120],
    ['Members Showcase', 'Community sparring & exhibitions', 16, 120],
    ['Weigh-In & Fight Prep', 'Competition Team', 17, 90],
    ['Community Open House', 'New members welcome', 11, 120],
  ];

  let weekIndex = 0;
  for (let weekStart = firstMonday; weekStart <= rangeEnd; weekStart = addDays(weekStart, 14)) {
    const template = featuredTemplates[weekIndex % featuredTemplates.length];
    const [title, description, hour, duration] = template;
    const eventDate = addDays(weekStart, weekIndex % 2 === 0 ? 5 : 6);

    if (eventDate >= rangeStart && eventDate <= rangeEnd) {
      events.push(makeEvent({
        date: eventDate,
        hour,
        duration,
        title,
        description,
        type: 'featured',
      }));
    }
    weekIndex += 1;
  }

  return events;
};

const buildClosures = (rangeStart, rangeEnd) => {
  const events = [];
  const firstMonday = getMonday(rangeStart);

  // One believable maintenance/holiday closure roughly every six weeks keeps
  // the demo realistic without overwhelming the normal class schedule.
  for (let weekStart = addDays(firstMonday, 24); weekStart <= rangeEnd; weekStart = addDays(weekStart, 42)) {
    const closureDate = addDays(weekStart, 3);
    if (closureDate < rangeStart || closureDate > rangeEnd) continue;

    events.push(makeEvent({
      date: closureDate,
      hour: 12,
      duration: 60,
      title: 'Gym Maintenance Window',
      description: 'Limited access • evening classes resume as scheduled',
      type: 'featured',
    }));
  }

  return events;
};

export function buildDemoEvents(now = new Date()) {
  const currentWeek = getMonday(now);
  const rangeStart = addDays(currentWeek, -56); // 8 weeks behind today.
  const rangeEnd = addDays(currentWeek, 112); // 16 weeks ahead.

  const classes = buildRecurringClasses(rangeStart, rangeEnd);
  const featured = [
    ...buildFeaturedEvents(rangeStart, rangeEnd),
    ...buildClosures(rangeStart, rangeEnd),
  ];

  const announcements = [
    makeEvent({ date: currentWeek, hour: 6, duration: 15, title: 'Fight-team signup is open at the front desk.', description: '#announcement', type: 'announcement' }),
    makeEvent({ date: currentWeek, hour: 6, minute: 15, duration: 15, title: 'Bring gloves, wraps, water, and a towel.', description: '#announcement', type: 'announcement' }),
    makeEvent({ date: currentWeek, hour: 6, minute: 30, duration: 15, title: 'Youth athletes should arrive 10 minutes early.', description: '#announcement', type: 'announcement' }),
    makeEvent({ date: currentWeek, hour: 6, minute: 45, duration: 15, title: 'Saturday sparring requires coach approval.', description: '#announcement', type: 'announcement' }),
  ];

  return [...classes, ...featured, ...announcements];
}
