from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace('</style></head>', '@media(max-width:600px){.intro{padding-top:28px;padding-bottom:18px}h1{font-size:clamp(32px,9.75vw,38px);max-width:none}.intro p{margin-top:16px}.workflow{padding-bottom:16px}.caption a{display:inline-block;margin-top:5px}}\n</style></head>')
s=s.replace('The editor controls are not implemented in this landing-page slice.</figcaption>', 'The editor controls are not implemented in this landing-page slice. <a href="common/assets/relay-notes-editor.svg" target="_blank" rel="noopener">View full-size static illustration (new tab)</a></figcaption>')
s=s.replace('no email is sent and no measured outcome is implied.</figcaption>', 'no email is sent and no measured outcome is implied. <a href="common/assets/relay-notes-draft.svg" target="_blank" rel="noopener">View full-size static draft (new tab)</a></figcaption>')
p.write_text(s)
