const query = new URLSearchParams(window.location.search);
const caseId = query.get('case') || 'operational';
const condition = query.get('condition') === 'adapted' ? 'adapted' : 'conventional';
const allowed = ['operational', 'commerce', 'editorial', 'collection'];
const root = document.querySelector('#task');
if (!allowed.includes(caseId)) {
  root.innerHTML =
    '<h1>Study unavailable</h1><p>Choose a task from <a href="index.html">the studies</a>.</p>';
} else {
  document.querySelector('#condition').textContent = `${caseId} / ${condition}`;
  const alternate = document.querySelector('#alternate');
  alternate.href = `study.html?case=${caseId}&condition=${condition === 'adapted' ? 'conventional' : 'adapted'}`;
  document.title = `${caseId} · ${condition} · TasteForge`;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = `${caseId}.css`;
  document.head.append(css);
  const fixtures = await fetch('fixtures.json').then((response) => {
    if (!response.ok) throw Error('Fixture unavailable');
    return response.json();
  });
  const { mount } = await import(`./${caseId}.mjs`);
  mount(root, fixtures[caseId], condition);
}
