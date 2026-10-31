import { chmod, cp, rm } from 'node:fs/promises';
await chmod(new URL('../dist/index.js', import.meta.url), 0o755);
await rm(new URL('../skills', import.meta.url), { recursive: true, force: true });
await cp(
  new URL('../../../skills/tasteforge', import.meta.url),
  new URL('../skills/tasteforge', import.meta.url),
  { recursive: true },
);
