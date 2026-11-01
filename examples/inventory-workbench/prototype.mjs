// Use the same content and interaction implementation for both layout studies.
const shell = new DOMParser().parseFromString(
  await (await fetch('index.html')).text(),
  'text/html',
);
document.body.replaceChildren(...shell.body.childNodes);
const layout = new URLSearchParams(window.location.search).get('layout');
document.documentElement.dataset.layout = layout === 'continuous' ? 'continuous' : 'focused';
document.documentElement.classList.add('neutral');
await import('./app.mjs');
