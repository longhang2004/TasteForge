const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

export function mount(root, fixture, condition) {
  let saved = null;
  root.className = `editorial ${condition}`;
  const figure = (section) =>
    section.asset
      ? `<figure class="ed-figure"><img src="${escape(section.asset)}" alt="${escape(section.artifact)}: rear rail joint schematic" width="560" height="320" /><figcaption>${escape(section.caption)}</figcaption></figure>`
      : '';
  const note = (section, index) =>
    `<aside class="ed-note" aria-label="${escape(section.artifact)}"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${escape(section.artifact)}</p><p>${escape(section.note)}</p></aside>`;
  root.innerHTML = `
    <header class="ed-header"><p class="eyebrow">${escape(fixture.brand)} / fictional field guide</p><h1>${escape(fixture.title)}</h1><p class="ed-deck">${escape(fixture.subtitle)}</p><p class="ed-scope">${escape(fixture.disclaimer)}</p></header>
    <div class="ed-tools">
      <nav aria-label="Guide sections"><p class="eyebrow">In this guide</p><ol>${fixture.sections.map((section) => `<li><a href="#${section.id}">${escape(section.title)}</a></li>`).join('')}</ol></nav>
      <section class="ed-reading" aria-labelledby="ed-reading-title"><h2 id="ed-reading-title">Your reading place</h2><p id="ed-status" role="status">No section saved. Reading place lasts while this page stays open.</p><div class="actions"><button id="ed-resume" disabled>Resume saved section</button><button id="ed-clear" disabled>Clear reading place</button></div></section>
    </div>
    <article aria-label="Chair-joint inspection guide" class="ed-article">${fixture.sections.map((section, index) => `<section class="ed-section" aria-labelledby="${section.id}"><div class="ed-prose"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / Field note</p><h2 id="${section.id}" tabindex="-1">${escape(section.title)}</h2><p>${escape(section.text)}</p><button class="ed-save" id="ed-save-${section.id}" data-save="${section.id}" aria-pressed="false">Save this section</button></div>${figure(section)}${condition === 'adapted' ? note(section, index) : ''}</section>`).join('')}</article>
    ${condition === 'conventional' ? `<section class="ed-summary" aria-labelledby="ed-summary-title"><h2 id="ed-summary-title">Field-note record</h2>${fixture.sections.map(note).join('')}</section>` : ''}
    <footer class="ed-footer"><p>${escape(fixture.disclaimer)}</p><a href="#observe">Return to first observation</a></footer>`;
  const move = (id) => {
    const heading = root.querySelector(`#${id}`);
    heading.focus();
    heading.scrollIntoView({ block: 'start' });
  };
  root
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => link.addEventListener('click', () => move(link.hash.slice(1))));
  root.querySelectorAll('[data-save]').forEach((button) =>
    button.addEventListener('click', () => {
      saved = button.dataset.save;
      const section = fixture.sections.find((entry) => entry.id === saved);
      root.querySelector('#ed-status').textContent =
        `Saved: ${section.title}. Reading place lasts while this page stays open.`;
      root.querySelector('#ed-resume').disabled = false;
      root.querySelector('#ed-clear').disabled = false;
      root.querySelectorAll('[data-save]').forEach((control) => {
        const active = control.dataset.save === saved;
        control.setAttribute('aria-pressed', String(active));
        control.textContent = active ? 'Reading place saved' : 'Save this section';
      });
    }),
  );
  root.querySelector('#ed-resume').addEventListener('click', () => {
    if (saved) move(saved);
  });
  root.querySelector('#ed-clear').addEventListener('click', () => {
    saved = null;
    root.querySelector('#ed-status').textContent =
      'No section saved. Reading place lasts while this page stays open.';
    root.querySelectorAll('[data-save]').forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'Save this section';
    });
    // Move to a persistent control before disabling the activated clear button.
    root.querySelector('nav a').focus();
    root.querySelector('#ed-resume').disabled = true;
    root.querySelector('#ed-clear').disabled = true;
  });
}
