import { state } from './state.js';
import {
  addDays,
  countdownLabel,
  currentStatus,
  escapeHtml,
  eventEnd,
  eventStart,
  eventTone,
  formatDate,
  formatTime,
  formatWeekRange,
  getWeekStart,
  isSameLocalDay,
  localDateKey,
} from './utils.js';

export function createRenderer(els) {
  function getEventsForDay(date) {
    return state.events
      .filter((event) => event.type !== 'announcement' && isSameLocalDay(eventStart(event), date))
      .sort((a, b) => eventStart(a) - eventStart(b));
  }

  function getFeaturedEvents() {
    const now = new Date();
    const featured = state.events.filter((event) => event.type === 'featured' && eventStart(event) >= now);
    if (featured.length) return featured.sort((a, b) => eventStart(a) - eventStart(b));
    return state.events
      .filter((event) => eventStart(event) > now && event.type !== 'announcement')
      .sort((a, b) => eventStart(a) - eventStart(b));
  }

  function getAnnouncements() {
    const tagged = state.events
      .filter((event) => event.type === 'announcement')
      .sort((a, b) => eventStart(a) - eventStart(b));

    if (tagged.length) return tagged.slice(0, 8).map((event) => event.title);

    return [
      'Bring gloves, wraps, water, and a towel.',
      'Check the schedule before arriving for class.',
      'Ask Coach about fight-team and sparring opportunities.',
      'Youth athletes should arrive 10 minutes early.',
    ];
  }

  function getLiveOrNextEvent() {
    const now = new Date();
    const todayEvents = getEventsForDay(now).filter((event) => !event.allDay);
    const live = todayEvents.find((event) => now >= eventStart(event) && now < eventEnd(event));
    if (live) return { kind: 'live', event: live, detail: `Ends ${formatTime(eventEnd(live))}` };

    const next = todayEvents.find((event) => eventStart(event) > now);
    if (next) return { kind: 'next', event: next, detail: countdownLabel(eventStart(next), now) };

    return null;
  }

  function setSyncState(kind, text) {
    els.syncState.className = `sync-state ${kind}`;
    els.syncState.innerHTML = `<span class="sync-dot"></span><span>${escapeHtml(text)}</span>`;
  }

  function updateClock() {
    const now = new Date();
    els.clockDate.textContent = formatDate(now, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    els.clockTime.textContent = formatDate(now, { hour: 'numeric', minute: '2-digit' });
    els.todayLabel.textContent = formatDate(now, { weekday: 'short', month: 'short', day: 'numeric' });
    renderLiveStatus();
  }

  function renderLiveStatus() {
    const status = getLiveOrNextEvent();
    if (!status) {
      els.liveStatus.hidden = true;
      return;
    }

    els.liveStatus.hidden = false;
    els.liveStatus.className = `live-status ${status.kind}`;
    els.liveStatus.innerHTML = `
      <span class="live-status-dot" aria-hidden="true"></span>
      <div class="live-status-copy">
        <span class="live-status-kicker">${status.kind === 'live' ? 'LIVE NOW' : 'UP NEXT'}</span>
        <strong>${escapeHtml(status.event.title)}</strong>
      </div>
      <span class="live-status-time">${escapeHtml(status.detail)}</span>
    `;
  }

  function renderTodayRail() {
    const events = getEventsForDay(new Date()).slice(0, 6);
    els.todaySchedule.innerHTML = events.length
      ? events.map((event) => {
          const tone = eventTone(event);
          const status = currentStatus(event);
          return `<article class="agenda-item ${tone === 'gold' ? 'gold' : tone === 'neutral' ? 'neutral' : ''} ${status === 'LIVE NOW' ? 'is-live' : ''}">
            <div class="agenda-marker"></div>
            <div>
              <div class="agenda-time">${event.allDay ? 'ALL DAY' : `${escapeHtml(formatTime(eventStart(event)))} – ${escapeHtml(formatTime(eventEnd(event)))}`}</div>
              <div class="agenda-title">${escapeHtml(event.title)}</div>
              <div class="agenda-sub">${escapeHtml(event.description || event.location || 'Huntsville Boxing Club')}</div>
              ${status ? `<div class="agenda-status">${status}</div>` : ''}
            </div>
          </article>`;
        }).join('')
      : '<div class="empty-state">No classes scheduled today.</div>';

    const featured = getFeaturedEvents().slice(0, 4);
    els.upcomingEvents.innerHTML = featured.length
      ? featured.map((event, index) => {
          const start = eventStart(event);
          return `<article class="upcoming-item">
            <div class="event-date ${index === 0 ? 'featured' : ''}">
              <b>${escapeHtml(formatDate(start, { month: 'short' }).toUpperCase())}</b>
              <span>${escapeHtml(formatDate(start, { day: 'numeric' }))}</span>
            </div>
            <div class="event-copy">
              <strong>${escapeHtml(event.title)}</strong>
              <span>${escapeHtml(event.description || event.location || 'Huntsville Boxing Club')}<br>${escapeHtml(formatDate(start, { weekday: 'short', month: 'short', day: 'numeric' }))} • ${escapeHtml(formatTime(start))}</span>
            </div>
          </article>`;
        }).join('')
      : '<div class="empty-state">No upcoming events.</div>';

    renderLiveStatus();
  }

  function renderPeriodLabel() {
    if (state.view === 'week') {
      const start = getWeekStart(state.anchorDate);
      const end = addDays(start, 6);
      els.periodLabel.textContent = formatWeekRange(start, end);
      return;
    }

    if (state.view === 'day') {
      els.periodLabel.textContent = formatDate(state.anchorDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return;
    }

    els.periodLabel.textContent = formatDate(state.anchorDate, { month: 'long', year: 'numeric' });
  }

  function renderWeekView() {
    const weekStart = getWeekStart(state.anchorDate);
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    const todayKey = localDateKey(new Date());

    const dayCards = days.map((day) => {
      const events = getEventsForDay(day);
      const isToday = localDateKey(day) === todayKey;

      const eventCards = events.length
        ? events.map((event) => {
            const tone = eventTone(event);
            const toneClass = tone === 'red' ? '' : tone;
            const status = currentStatus(event);
            const timeLabel = event.allDay
              ? 'ALL DAY'
              : `${formatTime(eventStart(event))} – ${formatTime(eventEnd(event))}`;

            return `<article class="week-agenda-event ${toneClass} ${status === 'LIVE NOW' ? 'is-live' : ''}">
              <div class="week-agenda-time">${escapeHtml(timeLabel)}</div>
              <div class="week-agenda-title">${escapeHtml(event.title)}</div>
              <div class="week-agenda-sub">${escapeHtml(event.description || event.location || 'Huntsville Boxing Club')}</div>
              ${status ? `<div class="week-agenda-status">${escapeHtml(status)}</div>` : ''}
            </article>`;
          }).join('')
        : '<div class="week-no-events">No scheduled sessions</div>';

      return `<section class="week-agenda-day ${isToday ? 'today' : ''}">
        <header class="week-agenda-header">
          <span class="week-agenda-name">${escapeHtml(formatDate(day, { weekday: 'short' }).toUpperCase())}</span>
          <span class="week-agenda-date">${escapeHtml(formatDate(day, { day: 'numeric' }))}</span>
          ${isToday ? '<span class="week-today-badge">TODAY</span>' : ''}
        </header>
        <div class="week-agenda-events">${eventCards}</div>
      </section>`;
    }).join('');

    els.calendarContent.innerHTML = `<div class="week-agenda-board">${dayCards}</div>`;
  }

  function renderDayView() {
    const events = getEventsForDay(state.anchorDate);
    els.calendarContent.innerHTML = `<div class="day-view">
      <div class="day-date-card">
        <div class="weekday">${escapeHtml(formatDate(state.anchorDate, { weekday: 'long' }).toUpperCase())}</div>
        <div class="number">${escapeHtml(formatDate(state.anchorDate, { day: 'numeric' }))}</div>
        <div class="month">${escapeHtml(formatDate(state.anchorDate, { month: 'long', year: 'numeric' }))}</div>
      </div>
      <div class="day-agenda-large">
        ${events.length ? events.map((event) => {
          const tone = eventTone(event);
          const status = currentStatus(event);
          return `<article class="day-event-card ${tone === 'gold' ? 'gold' : tone === 'neutral' ? 'neutral' : ''} ${status === 'LIVE NOW' ? 'current' : ''}">
            <div class="time">${event.allDay ? 'All day' : escapeHtml(formatTime(eventStart(event)))}</div>
            <div class="stripe"></div>
            <div><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.description || event.location || 'Huntsville Boxing Club')}</span></div>
            <div class="status">${escapeHtml(status || 'SCHEDULED')}</div>
          </article>`;
        }).join('') : '<div class="empty-state">No events scheduled for this day.</div>'}
      </div>
    </div>`;
  }

  function renderMonthView() {
    const year = state.anchorDate.getFullYear();
    const month = state.anchorDate.getMonth();
    const first = new Date(year, month, 1, 12);
    const firstDay = first.getDay();
    const mondayOffset = firstDay === 0 ? -6 : 1 - firstDay;
    const gridStart = addDays(first, mondayOffset);
    const cells = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => `<div class="month-weekday">${day}</div>`).join('');
    const todayKey = localDateKey(new Date());

    const days = cells.map((day) => {
      const allEvents = getEventsForDay(day);
      const events = allEvents.slice(0, 3);
      const hiddenCount = Math.max(0, allEvents.length - events.length);
      return `<div class="month-day ${day.getMonth() !== month ? 'outside' : ''} ${localDateKey(day) === todayKey ? 'today' : ''}">
        <div class="month-day-number">${day.getDate()}</div>
        ${events.map((event) => {
          const tone = eventTone(event);
          return `<div class="month-event-chip ${tone === 'gold' ? 'gold' : tone === 'neutral' ? 'neutral' : ''}">${escapeHtml(event.title)}</div>`;
        }).join('')}
        ${hiddenCount ? `<div class="month-more">+${hiddenCount} more</div>` : ''}
      </div>`;
    }).join('');

    els.calendarContent.innerHTML = `<div class="month-view"><div class="month-grid">${weekdays}${days}</div></div>`;
  }

  function renderCalendar() {
    renderPeriodLabel();
    els.viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === state.view));
    if (state.view === 'week') renderWeekView();
    if (state.view === 'day') renderDayView();
    if (state.view === 'month') renderMonthView();
  }

  function renderSecondary(section) {
    const sectionLabels = {
      members: ['MEMBERS', 'Member Information'],
      classes: ['CLASSES', 'Class Directory'],
      events: ['EVENTS', 'Upcoming Events'],
      announcements: ['ANNOUNCEMENTS', 'Gym Announcements'],
    };

    const [eyebrow, title] = sectionLabels[section] || ['HUNTSVILLE BOXING CLUB', 'Information'];
    els.secondaryEyebrow.textContent = eyebrow;
    els.secondaryTitle.textContent = title;

    if (section === 'members') {
      const cards = [
        ['Youth Program', 'Ages 8–15 • skill development, conditioning, and fundamentals.'],
        ['Adult Program', 'All levels • boxing fundamentals, technique, conditioning, and bag work.'],
        ['Competitive Team', 'Invite-based sparring, fight preparation, and competition scheduling.'],
        ['Open Gym', 'Member training time for approved athletes during posted hours.'],
        ['Private Training', 'One-on-one coaching sessions scheduled directly with Coach.'],
        ['Community', 'Clinics, showcases, camps, and Huntsville Boxing Club events.'],
      ];
      els.secondaryContent.innerHTML = `<div class="secondary-grid">${cards.map(([name, detail]) => `<div class="secondary-card"><strong>${name}</strong><span>${detail}</span></div>`).join('')}</div>`;
      return;
    }

    if (section === 'classes') {
      const cards = [
        ['Morning Boxing', 'Early skill work and conditioning • All levels'],
        ['Boxing Fundamentals', 'Stance, movement, defense, and basic combinations • Beginners welcome'],
        ['Youth Boxing', 'Technique, fitness, and discipline • Ages 8–15'],
        ['Adult Boxing', 'Technique, bag work, partner drills, and conditioning • All levels'],
        ['Sparring', 'Controlled competition rounds • Coach approval / invite only'],
        ['Open Gym', 'Independent member training during posted hours'],
      ];
      els.secondaryContent.innerHTML = `<div class="secondary-grid">${cards.map(([name, detail]) => `<div class="secondary-card"><strong>${name}</strong><span>${detail}</span></div>`).join('')}</div>`;
      return;
    }

    if (section === 'events') {
      const events = getFeaturedEvents().slice(0, 12);
      els.secondaryContent.innerHTML = `<div class="secondary-grid">${events.map((event) => `<div class="secondary-card"><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(formatDate(eventStart(event), { weekday: 'long', month: 'long', day: 'numeric' }))} • ${escapeHtml(formatTime(eventStart(event)))}<br>${escapeHtml(event.description || event.location || 'Huntsville Boxing Club')}</span></div>`).join('')}</div>`;
      return;
    }

    if (section === 'announcements') {
      els.secondaryContent.innerHTML = `<div class="announcement-board">${getAnnouncements().map((item) => `<div class="announcement-row"><span class="announcement-bullet"></span><span>${escapeHtml(item)}</span></div>`).join('')}</div>`;
    }
  }

  function setSection(section) {
    state.section = section;
    const isSchedule = section === 'schedule';
    els.scheduleSection.hidden = !isSchedule;
    els.secondarySection.hidden = isSchedule;
    els.navButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === section));
    if (isSchedule) renderCalendar();
    else renderSecondary(section);
  }

  function renderAll() {
    renderTodayRail();
    if (state.section === 'schedule') renderCalendar();
    else renderSecondary(state.section);
  }

  function shiftPeriod(amount) {
    if (state.view === 'week') state.anchorDate = addDays(state.anchorDate, amount * 7);
    if (state.view === 'day') state.anchorDate = addDays(state.anchorDate, amount);
    if (state.view === 'month') state.anchorDate = new Date(state.anchorDate.getFullYear(), state.anchorDate.getMonth() + amount, 1, 12);
    renderCalendar();
  }

  return {
    renderAll,
    renderCalendar,
    renderTodayRail,
    setSection,
    setSyncState,
    shiftPeriod,
    updateClock,
  };
}
