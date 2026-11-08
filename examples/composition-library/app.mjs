const $ = (selector) => document.querySelector(selector);
const make = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
};
const link = (text, href) => {
  const a = make('a', text);
  a.href = href;
  return a;
};
const list = (items, ordered = false) => {
  const el = make(ordered ? 'ol' : 'ul');
  items.forEach((item) => el.append(make('li', item)));
  return el;
};
let library;
let group = 'all';
const studyCases = {
  work: 'operational',
  commerce: 'commerce',
  reading: 'editorial',
  exploration: 'collection',
};

function entryCard(entry) {
  const card = make('article', '', 'composition');
  card.dataset.id = entry.id;
  card.setAttribute('aria-labelledby', entry.id);
  const preview = make('div', '', 'preview-column');
  const figure = make('figure');
  const diagram = make('div', '', `anatomy ${entry.family}`);
  diagram.setAttribute('role', 'group');
  diagram.setAttribute(
    'aria-label',
    `${entry.title}: schematic regions, not an interactive product`,
  );
  entry.anatomy.forEach((region) => diagram.append(make('div', region, 'zone')));
  figure.append(
    diagram,
    make(
      'figcaption',
      'Anatomy preview · original schematic · illustrative regions, no live task controls',
    ),
  );
  preview.append(figure);
  const content = make('div');
  content.append(
    make(
      'p',
      `${entry.group} / ${entry.tasks.join(', ')} · ${entry.density} · ${entry.complexity} complexity`,
      'entry-meta',
    ),
  );
  const heading = make('h3', entry.title);
  heading.id = entry.id;
  content.append(heading, make('p', entry.suitableFor.join(' '), 'fit'), list(entry.artDirection));
  content.lastChild.className = 'treatments';
  const details = make('details');
  details.append(make('summary', `Inspect fit, states & sources — ${entry.title}`));
  const body = make('div', '', 'detail-body');
  const section = (title, node) => body.append(make('h4', title), node);
  section('Avoid when', list(entry.avoid));
  section('Anatomy in reading order', list(entry.anatomy, true));
  section('At narrow widths', make('p', entry.narrow));
  section('States to design and verify', list(entry.states));
  section('Tradeoff & evidence boundary', make('p', entry.tradeoff));
  section(
    'Pinned observations',
    list(entry.sourceIds.map((id) => library.sources.find((s) => s.id === id).title)),
  );
  const sourceLinks = make('p', '', 'links');
  entry.sourceIds.forEach((id) => sourceLinks.append(link(id, `#source-${id}`)));
  body.append(sourceLinks);
  const related = make('p');
  related.append(
    'Related runnable teaching pair: ',
    link(
      'conventional',
      `../composition-studies/study.html?case=${studyCases[entry.group]}&condition=conventional`,
    ),
    ' · ',
    link(
      'adapted',
      `../composition-studies/study.html?case=${studyCases[entry.group]}&condition=adapted`,
    ),
    '. This is a related example, not validation of this card.',
  );
  body.append(related);
  details.append(body);
  content.append(details);
  card.append(preview, content);
  return card;
}

function renderEntries() {
  if (!library) return;
  const task = $('#task').value;
  const query = $('#query').value.trim().toLowerCase();
  const filtered = library.entries.filter(
    (entry) =>
      (group === 'all' || entry.group === group) &&
      (task === 'all' || entry.tasks.includes(task)) &&
      JSON.stringify(entry).toLowerCase().includes(query),
  );
  $('#entries').replaceChildren(...filtered.map(entryCard));
  $('#empty').hidden = filtered.length > 0;
  $('#result-count').textContent =
    `${filtered.length} of ${library.entries.length} compositions · filters combine`;
}
function resetFilters() {
  group = 'all';
  $('#task').value = 'all';
  $('#query').value = '';
  document
    .querySelectorAll('[data-group]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.group === 'all')),
    );
  renderEntries();
}
$('#filters').addEventListener('submit', (event) => event.preventDefault());
$('#filters').addEventListener('reset', (event) => {
  event.preventDefault();
  resetFilters();
});
$('#empty-reset').addEventListener('click', () => {
  resetFilters();
  $('[data-group="all"]').focus();
});
$('#task').addEventListener('change', renderEntries);
$('#query').addEventListener('input', renderEntries);
document.querySelectorAll('[data-group]').forEach((button) =>
  button.addEventListener('click', () => {
    group = button.dataset.group;
    document
      .querySelectorAll('[data-group]')
      .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderEntries();
  }),
);

async function loadLibrary() {
  $('#retry').disabled = true;
  try {
    const response = await fetch('../../packages/knowledge/src/data/compositions.json');
    if (!response.ok) throw new Error('Library unavailable');
    library = await response.json();
    $('#version').textContent =
      `${library.version} · ${library.sources.length} inspected inputs / 3 source families`;
    const tasks = [...new Set(library.entries.flatMap((entry) => entry.tasks))].sort();
    $('#task').replaceChildren(
      new Option('Every indexed task', 'all'),
      ...tasks.map((task) => new Option(task, task)),
    );
    $('#sources').replaceChildren(
      ...library.sources.map((source) => {
        const details = make('details', '', 'source');
        details.id = `source-${source.id}`;
        details.append(
          make('summary', source.title),
          make('p', `Source ${source.id} · ${source.license} · revision ${source.revision}`),
        );
        const links = make('p', '', 'links');
        links.append(
          link('Pinned input', source.pinnedUrl),
          ' · ',
          link('Exact license', source.licenseUrl),
        );
        details.append(
          links,
          make('p', 'Observed in source text:'),
          list(source.observed),
          make('p', 'Not established:'),
          list(source.notObserved),
          make('p', source.rights),
        );
        const hash = make('p');
        hash.append('Input SHA-256: ', make('code', source.inputSha256));
        details.append(hash);
        return details;
      }),
    );
    $('#load-error').hidden = true;
    renderEntries();
  } catch {
    $('#version').textContent = 'Library unavailable';
    $('#result-count').textContent = '';
    $('#load-error').hidden = false;
  } finally {
    $('#retry').disabled = false;
  }
}
$('#retry').addEventListener('click', loadLibrary);

async function loadSpecimens() {
  try {
    const response = await fetch('fonts/specimens.json');
    if (!response.ok) throw new Error('Specimens unavailable');
    const { specimens } = await response.json();
    const results = await Promise.all(
      specimens.map(async (specimen) => {
        const row = make('article', '', 'specimen');
        row.dataset.font = specimen.id;
        const info = make('div');
        info.append(make('h3', specimen.family));
        const status = make('p', 'Loading local font…', 'specimen-meta');
        info.append(status);
        const license = make('p', '', 'specimen-meta');
        license.append(link(specimen.license || 'Font license', `fonts/${specimen.licenseFile}`));
        info.append(license);
        const sample = make('p', specimen.sample, 'sample');
        sample.lang = specimen.languages?.includes('vi') ? 'vi' : 'en';
        row.append(info, sample);
        $('#specimens').append(row);
        try {
          const family = `Specimen ${specimen.id}`;
          const face = new FontFace(family, `url("fonts/${encodeURI(specimen.file)}")`, {
            weight: String(specimen.weight),
            style: specimen.style,
          });
          document.fonts.add(face);
          await face.load();
          await document.fonts.load(`400 24px "${family}"`, specimen.sample);
          sample.style.fontFamily = `"${family}", ${specimen.id === 'newsreader' || specimen.id === 'fraunces' || specimen.id === 'bitter' ? 'serif' : 'sans-serif'}`;
          status.textContent = `Local file loaded · ${specimen.languages?.join(' / ') || 'language scope unknown'} sample · weight ${specimen.weight}`;
          row.dataset.loaded = 'true';
          return true;
        } catch {
          status.textContent = 'Local font unavailable · sample uses browser fallback';
          row.dataset.loaded = 'false';
          return false;
        }
      }),
    );
    $('#font-status').textContent =
      `${results.filter(Boolean).length} of ${results.length} local specimen files loaded. Figtree is scoped to English. Fraunces lacks two sampled decomposed Vietnamese marks in cmap; full shaping remains unverified.`;
  } catch {
    $('#font-status').textContent =
      'Font specimens unavailable. The guide remains readable in fallback fonts; retry by reloading after serving the fonts directory.';
  }
}
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#source-"]');
  if (anchor) document.querySelector(anchor.getAttribute('href')).open = true;
});
await Promise.all([loadLibrary(), loadSpecimens()]);
