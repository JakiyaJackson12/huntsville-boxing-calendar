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

const makeEvent = ({ base, day, hour, minute = 0, duration = 60, title, description, type = 'class', location = 'Huntsville Boxing Club' }) => {
  const start = addDays(base, day);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + duration * 60_000);

  return {
    id: `demo-${day}-${hour}-${minute}-${slugify(title)}`,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    location,
    description,
    type,
  };
};

export function buildDemoEvents(now = new Date()) {
  const monday = getMonday(now);

  const classes = [
    [0, 6, 0, 60, 'Morning Boxing', 'All Levels'],
    [0, 10, 0, 60, 'Boxing Fundamentals', 'Beginners'],
    [0, 12, 0, 60, 'Open Gym', 'Members Only'],
    [0, 17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [0, 18, 30, 90, 'Adult Boxing', 'All Levels'],

    [1, 6, 0, 60, 'Morning Boxing', 'All Levels'],
    [1, 10, 30, 60, 'Private Session', 'Coach Sarah'],
    [1, 12, 0, 60, 'Open Gym', 'Members Only'],
    [1, 17, 0, 60, 'Youth Skills Clinic', 'Ages 8–15'],
    [1, 18, 30, 90, 'Women’s Boxing', 'All Levels'],

    [2, 6, 0, 60, 'Morning Boxing', 'All Levels'],
    [2, 9, 30, 60, 'Conditioning', 'All Levels'],
    [2, 12, 0, 60, 'Open Gym', 'Members Only'],
    [2, 17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [2, 18, 30, 90, 'Sparring', 'Invite Only'],

    [3, 6, 0, 60, 'Morning Boxing', 'All Levels'],
    [3, 10, 0, 90, 'Private Session', 'Coach Mike'],
    [3, 12, 0, 60, 'Open Gym', 'Members Only'],
    [3, 17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [3, 18, 30, 90, 'Adult Boxing', 'All Levels'],

    [4, 6, 0, 60, 'Morning Boxing', 'All Levels'],
    [4, 10, 0, 60, 'Technique Drills', 'Intermediate'],
    [4, 12, 0, 60, 'Open Gym', 'Members Only'],
    [4, 17, 0, 60, 'Youth Boxing', 'Ages 8–15'],
    [4, 18, 30, 90, 'Sparring', 'All Levels'],

    [5, 8, 0, 60, 'Open Gym', 'All Members'],
    [5, 10, 0, 90, 'Coach Workshop', 'Footwork & Defense'],
    [5, 12, 0, 90, 'Sparring Day', 'All Levels'],
    [5, 15, 0, 60, 'Conditioning', 'All Levels'],

    [6, 9, 0, 60, 'Open Gym', 'All Members'],
    [6, 11, 0, 90, 'Community Boxing Clinic', 'All Welcome'],
  ].map(([day, hour, minute, duration, title, description]) => makeEvent({ base: monday, day, hour, minute, duration, title, description }));

  const featured = [
    makeEvent({ base: monday, day: 5, hour: 18, duration: 180, title: 'Fight Night', description: 'In-House Event', type: 'featured' }),
    makeEvent({ base: monday, day: 12, hour: 10, duration: 120, title: 'Coach Workshop', description: 'Technique & Training', type: 'featured' }),
    makeEvent({ base: monday, day: 19, hour: 10, duration: 120, title: 'Youth Skills Clinic', description: 'Ages 8–15', type: 'featured' }),
    makeEvent({ base: monday, day: 26, hour: 16, duration: 120, title: 'Members BBQ', description: 'All Members Welcome', type: 'featured' }),
  ];

  const announcements = [
    makeEvent({ base: monday, day: 0, hour: 6, duration: 15, title: 'Fight-team signup is open at the front desk.', description: '#announcement', type: 'announcement' }),
    makeEvent({ base: monday, day: 0, hour: 6, duration: 15, title: 'Bring gloves, wraps, water, and a towel.', description: '#announcement', type: 'announcement' }),
    makeEvent({ base: monday, day: 0, hour: 6, duration: 15, title: 'Youth athletes should arrive 10 minutes early.', description: '#announcement', type: 'announcement' }),
  ];

  return [...classes, ...featured, ...announcements];
}
