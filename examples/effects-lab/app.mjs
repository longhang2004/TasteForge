const marker = document.querySelector('#marker');
const works = document.querySelector('.works');
const items = [...works.children];
const staticPreview = document.querySelector('#static-preview');
const replay = document.querySelector('#replay');
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let manualStatic = false;
const animated = [marker, ...items];
const cancel = () =>
  animated.forEach((element) =>
    element.getAnimations?.().forEach((animation) => animation.cancel()),
  );
const motionAllowed = () => !preference.matches && !manualStatic;

function updateMotion() {
  const enabled = motionAllowed();
  document.documentElement.dataset.motion = enabled ? 'on' : 'off';
  staticPreview.checked = !enabled;
  staticPreview.disabled = preference.matches;
  replay.disabled = !enabled || typeof marker.animate !== 'function';
  document.querySelector('#motion-status').textContent = preference.matches
    ? 'Reduced motion follows your device setting. View and comparison controls remain available.'
    : enabled
      ? 'Motion previews play on request.'
      : 'Static previews. View and comparison controls remain available.';
  if (!enabled) cancel();
}

document.querySelectorAll('[data-control]').forEach((element) => {
  element.disabled = false;
});
staticPreview.addEventListener('change', () => {
  manualStatic = staticPreview.checked;
  updateMotion();
});
preference.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancel();
});
updateMotion();

replay.addEventListener('click', () => {
  if (!motionAllowed() || !marker.animate) return;
  marker.getAnimations().forEach((animation) => animation.cancel());
  marker.animate([{ backgroundSize: '0% 34%' }, { backgroundSize: '100% 34%' }], {
    duration: 420,
    easing: 'cubic-bezier(.2,.8,.2,1)',
  });
});

document.querySelectorAll('[data-view]').forEach((button) => {
  if (button.tagName !== 'BUTTON') return;
  button.addEventListener('click', () => {
    if (works.dataset.view === button.dataset.view) return;
    const before = items.map((element) => element.getBoundingClientRect());
    items.forEach((element) =>
      element.getAnimations?.().forEach((animation) => animation.cancel()),
    );
    works.dataset.view = button.dataset.view;
    document
      .querySelectorAll('button[data-view]')
      .forEach((element) => element.setAttribute('aria-pressed', String(element === button)));
    const after = items.map((element) => element.getBoundingClientRect());
    if (!motionAllowed()) return;
    items.forEach((element, index) => {
      if (!element.animate) return;
      const x = before[index].left - after[index].left;
      const y = before[index].top - after[index].top;
      if (Math.abs(x) + Math.abs(y) < 1) return;
      element.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }], {
        duration: 280,
        easing: 'cubic-bezier(.2,.8,.2,1)',
      });
    });
  });
});

const reveal = document.querySelector('#reveal');
reveal.addEventListener('input', () => {
  document.querySelector('.comparison').style.setProperty('--reveal', `${reveal.value}%`);
  document.querySelector('#reveal-value').value = `${reveal.value}%`;
  reveal.setAttribute('aria-valuetext', `${reveal.value}% colour`);
  document.querySelector('.comparison .base').alt =
    `Abstract print study: an orange circle, green hillside and fine contour lines. ${reveal.value}% is shown in colour from the left; the rest is greyscale.`;
});
