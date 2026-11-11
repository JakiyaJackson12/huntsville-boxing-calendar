const FRAME_PATHS = Object.freeze({
  idle: '/assets/boxer/idle.webp',
  blink: '/assets/boxer/blink.webp',
  guard: '/assets/boxer/guard.webp',
  jabReady: '/assets/boxer/jab-ready.webp',
  jab: '/assets/boxer/jab.webp',
  crossReady: '/assets/boxer/cross-ready.webp',
  cross: '/assets/boxer/cross.webp',
  reset: '/assets/boxer/reset.webp',
});

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const randomBetween = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

async function preloadFrames() {
  await Promise.all(Object.values(FRAME_PATHS).map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => image.decode?.().catch(() => {}).finally(resolve) ?? resolve();
    image.onerror = resolve;
    image.src = src;
  })));
}

export function createBoxerAnimator({ stage, sprite }) {
  if (!stage || !sprite) {
    return { start() {}, stop() {}, jab() {}, cross() {}, jabCross() {} };
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let stopped = true;
  let busy = false;
  let generation = 0;
  let comboTimer = null;
  let blinkTimer = null;

  const clearTimers = () => {
    window.clearTimeout(comboTimer);
    window.clearTimeout(blinkTimer);
    comboTimer = null;
    blinkTimer = null;
  };

  const setFrame = async (frame) => {
    const src = FRAME_PATHS[frame];
    if (!src) return;
    if (sprite.getAttribute('src') !== src) {
      sprite.src = src;
      try { await sprite.decode?.(); } catch { /* already painted or unsupported */ }
    }
    stage.dataset.boxerFrame = frame;
    stage.dataset.boxerState = frame;
  };

  const runSequence = async (name, steps) => {
    if (busy || stopped || reducedMotion?.matches || document.visibilityState !== 'visible') return false;

    const run = ++generation;
    busy = true;
    stage.classList.add('is-combo');
    stage.dataset.combo = name;

    for (const [frame, duration] of steps) {
      if (stopped || run !== generation || document.visibilityState !== 'visible') break;
      await setFrame(frame);
      if (duration) await sleep(duration);
    }

    if (run === generation && !stopped) {
      await setFrame('idle');
      stage.classList.remove('is-combo');
      delete stage.dataset.combo;
      busy = false;
    }

    return true;
  };

  const jab = () => runSequence('jab', [
    ['guard', 145],
    ['jabReady', 85],
    ['jab', 115],
    ['jabReady', 90],
    ['guard', 185],
    ['reset', 170],
  ]);

  const cross = () => runSequence('cross', [
    ['guard', 260],
    ['crossReady', 105],
    ['cross', 135],
    ['crossReady', 100],
    ['guard', 190],
    ['reset', 180],
  ]);

  const jabCross = () => runSequence('jab-cross', [
    ['guard', 145],
    ['jabReady', 82],
    ['jab', 110],
    ['jabReady', 82],
    ['guard', 145],
    ['crossReady', 105],
    ['cross', 138],
    ['crossReady', 98],
    ['guard', 190],
    ['reset', 210],
  ]);

  const scheduleBlink = () => {
    if (stopped || reducedMotion?.matches) return;
    blinkTimer = window.setTimeout(async () => {
      if (!busy && !stopped && document.visibilityState === 'visible') {
        await setFrame('blink');
        await sleep(105);
        if (!busy && !stopped) await setFrame('idle');
      }
      scheduleBlink();
    }, randomBetween(4300, 8800));
  };

  const scheduleCombo = (first = false) => {
    if (stopped || reducedMotion?.matches) return;
    const delay = first ? randomBetween(450, 800) : randomBetween(6000, 9500);
    comboTimer = window.setTimeout(async () => {
      if (!busy && !stopped && document.visibilityState === 'visible') {
        const roll = Math.random();
        if (roll < .18) await jab();
        else if (roll < .27) await cross();
        else await jabCross();
      }
      scheduleCombo(false);
    }, delay);
  };

  const start = async () => {
    clearTimers();
    stopped = false;
    busy = false;
    stage.dataset.boxerState = 'loading';
    await preloadFrames();
    if (stopped) return;
    await setFrame('idle');
    if (reducedMotion?.matches) return;
    scheduleBlink();
    scheduleCombo(true);
  };

  const stop = async () => {
    stopped = true;
    generation += 1;
    busy = false;
    clearTimers();
    stage.classList.remove('is-combo');
    delete stage.dataset.combo;
    await setFrame('idle');
  };

  reducedMotion?.addEventListener?.('change', (event) => {
    if (event.matches) stop();
    else start();
  });

  document.addEventListener('visibilitychange', () => {
    clearTimers();
    generation += 1;
    busy = false;
    stage.classList.remove('is-combo');
    if (document.visibilityState === 'visible' && !stopped && !reducedMotion?.matches) {
      setFrame('idle').then(() => {
        scheduleBlink();
        scheduleCombo(true);
      });
    }
  });

  return {
    start,
    stop,
    jab,
    cross,
    jabCross,
    get busy() { return busy; },
  };
}
