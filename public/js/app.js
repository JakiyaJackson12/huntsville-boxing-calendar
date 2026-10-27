import { fetchAppConfig, fetchCalendarEvents, readEventCache, saveEventCache } from './api.js';
import { createRenderer } from './renderer.js';
import { state } from './state.js';
import { formatDate } from './utils.js';

const els = {
  navButtons: [...document.querySelectorAll('.nav-button')],
  viewButtons: [...document.querySelectorAll('.view-button')],
  scheduleSection: document.getElementById('scheduleSection'),
  secondarySection: document.getElementById('secondarySection'),
  secondaryTitle: document.getElementById('secondaryTitle'),
  secondaryEyebrow: document.getElementById('secondaryEyebrow'),
  secondaryContent: document.getElementById('secondaryContent'),
  backToSchedule: document.getElementById('backToSchedule'),
  calendarContent: document.getElementById('calendarContent'),
  periodLabel: document.getElementById('periodLabel'),
  previousButton: document.getElementById('previousButton'),
  nextButton: document.getElementById('nextButton'),
  clockDate: document.getElementById('clockDate'),
  clockTime: document.getElementById('clockTime'),
  todayLabel: document.getElementById('todayLabel'),
  todaySchedule: document.getElementById('todaySchedule'),
  upcomingEvents: document.getElementById('upcomingEvents'),
  liveStatus: document.getElementById('liveStatus'),
  syncState: document.getElementById('syncState'),
  sectionJumps: [...document.querySelectorAll('[data-section-jump]')],
  animeWrap: document.querySelector('.anime-wrap'),
};

const renderer = createRenderer(els);

function cacheAgeLabel(savedAt) {
  const ageMinutes = Math.max(0, Math.floor((Date.now() - savedAt) / 60_000));
  if (ageMinutes < 1) return 'just now';
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  const hours = Math.floor(ageMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function loadConfig() {
  try {
    state.config = { ...state.config, ...(await fetchAppConfig()) };
  } catch (error) {
    console.warn('[config] using local defaults:', error);
  }
}

async function loadEvents({ quiet = false } = {}) {
  if (!quiet) renderer.setSyncState('', 'Loading schedule…');

  try {
    const payload = await fetchCalendarEvents();
    state.events = payload.events || [];
    state.source = payload.source || 'unknown';
    state.syncedAt = payload.syncedAt || new Date().toISOString();
    saveEventCache({ events: state.events, syncedAt: state.syncedAt });

    const syncLabel = state.source === 'google'
      ? `Calendar synced • ${formatDate(new Date(state.syncedAt), { hour: 'numeric', minute: '2-digit' })}`
      : 'Demo mode';

    renderer.setSyncState('live', syncLabel);
    renderer.renderAll();
  } catch (error) {
    console.error('[events] calendar load failed:', error);
    const cached = readEventCache();

    if (cached?.events?.length) {
      state.events = cached.events;
      const age = cacheAgeLabel(cached.savedAt);
      const stale = Date.now() - cached.savedAt > 24 * 60 * 60_000;
      renderer.setSyncState('error', stale ? `Offline • cached schedule may be stale (${age})` : `Offline • cached ${age}`);
      renderer.renderAll();
      return;
    }

    renderer.setSyncState('error', 'Schedule unavailable');
    els.calendarContent.innerHTML = '<div class="empty-state">Unable to load the schedule.</div>';
  }
}

function bindInteractions() {
  els.navButtons.forEach((button) => button.addEventListener('click', () => renderer.setSection(button.dataset.section)));
  els.sectionJumps.forEach((button) => button.addEventListener('click', () => renderer.setSection(button.dataset.sectionJump)));
  els.backToSchedule.addEventListener('click', () => renderer.setSection('schedule'));

  els.viewButtons.forEach((button) => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    state.anchorDate = new Date();
    renderer.renderCalendar();
  }));

  els.previousButton.addEventListener('click', () => renderer.shiftPeriod(-1));
  els.nextButton.addEventListener('click', () => renderer.shiftPeriod(1));
}

function startBoxerMotion() {
  if (!els.animeWrap) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (reducedMotion?.matches) return;

  let timerId;
  const scheduleNextCombo = (firstRun = false) => {
    const delay = firstRun ? 5_000 : 12_000 + Math.floor(Math.random() * 7_000);
    timerId = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        els.animeWrap.classList.add('is-jabbing');
        window.setTimeout(() => els.animeWrap?.classList.remove('is-jabbing'), 900);
      }
      scheduleNextCombo();
    }, delay);
  };

  const stopMotion = () => {
    if (timerId) window.clearTimeout(timerId);
    els.animeWrap?.classList.remove('is-jabbing');
  };

  reducedMotion?.addEventListener?.('change', (event) => {
    stopMotion();
    if (!event.matches) scheduleNextCombo(true);
  });

  scheduleNextCombo(true);
}

function registerOfflineShell() {
  const localHosts = new Set(['localhost', '127.0.0.1']);
  if (!('serviceWorker' in navigator) || localHosts.has(window.location.hostname)) return;

  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.warn('[offline] service worker registration failed:', error);
  });
}

async function start() {
  bindInteractions();
  registerOfflineShell();
  startBoxerMotion();
  await loadConfig();
  renderer.updateClock();
  await loadEvents();

  setInterval(renderer.updateClock, 30_000);
  setInterval(() => loadEvents({ quiet: true }), Math.max(30, Number(state.config.refreshSeconds || 60)) * 1000);
}

start().catch((error) => {
  console.error('[app] failed to start:', error);
  renderer.setSyncState('error', 'App startup error');
});
