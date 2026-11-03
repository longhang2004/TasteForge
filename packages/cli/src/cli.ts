import path from 'node:path';
import { readFileSync } from 'node:fs';
import { Command, CommanderError } from 'commander';
import { z } from 'zod';
import {
  ENGINE_VERSION,
  briefSchema,
  configSchema,
  createDesignDNA,
  defaultBrief,
  renderDesign,
  renderTokens,
  seedSchema,
  selectDirection,
  suggest,
  validateDNA,
} from '@tasteforge/core/engine';
import type { ProjectFinding } from '@tasteforge/core/audit';
import { collectAuditStylesheets, validateAuditImportSelection } from './audit-imports.js';
import {
  exists,
  collectSources,
  projectRoot,
  readJson,
  readText,
  stateDirectory,
  writeArtifacts,
} from './files.js';

const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const packageVersion = (
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;
const numberOption = (value: string): number => {
  if (!/^\d+$/.test(value)) throw new Error(`Expected a non-negative integer, received: ${value}`);
  return Number(value);
};
export async function run(argv: string[]): Promise<number> {
  const program = new Command();
  let result = 0;
  program
    .name('tasteforge')
    .description('Less slop. More taste. Local, deterministic design intelligence.')
    .version(packageVersion)
    .option('-p, --project <directory>', 'existing project root', '.')
    .option('--format <format>', 'text or json output', 'text')
    .showHelpAfterError()
    .exitOverride();
  const globalOptions = async () => {
    const opts = program.opts<{ project: string; format: string }>();
    const format = z.enum(['text', 'json']).parse(opts.format);
    return { root: await projectRoot(opts.project), format };
  };
  const output = (value: unknown, format: string, text: string) =>
    process.stdout.write(format === 'json' ? json(value) : text + '\n');
  const context = async (root: string, input: string | undefined) =>
    briefSchema.parse(await readJson(root, input ?? '.tasteforge/brief.json'));
  const weights = async (root: string) => {
    await stateDirectory(root, false);
    return configSchema.parse(
      (await exists(path.join(root, '.tasteforge/config.json')))
        ? await readJson(root, '.tasteforge/config.json')
        : {},
    ).weights;
  };
  program
    .command('init')
    .description('Create a safe starting brief and scoring configuration')
    .option('--force', 'explicitly replace existing initialization files', false)
    .option('--dry-run', 'validate and list writes without changing files', false)
    .action(async (opts: { force: boolean; dryRun: boolean }) => {
      const { root, format } = await globalOptions();
      const files = await writeArtifacts(
        root,
        { 'brief.json': json(defaultBrief), 'config.json': json(configSchema.parse({})) },
        opts,
      );
      output(
        { dryRun: opts.dryRun, files },
        format,
        `${opts.dryRun ? 'Would create' : 'Created'} ${files.join(', ')}. Edit the brief before suggesting directions.`,
      );
    });
  program
    .command('suggest')
    .description('Rank and sample compatible design directions')
    .option('--brief <file>', 'project-local brief JSON', '.tasteforge/brief.json')
    .option('--count <number>', 'distinct suggestions (1–20)', numberOption, 3)
    .option('--seed <integer>', 'unsigned 32-bit seed', numberOption)
    .action(async (opts: { brief: string; count: number; seed?: number }) => {
      const { root, format } = await globalOptions();
      const brief = await context(root, opts.brief);
      const directions = suggest(brief, {
        count: opts.count,
        seed: opts.seed,
        weights: await weights(root),
      });
      output(
        { engineVersion: ENGINE_VERSION, directions },
        format,
        directions
          .map(
            (d, i) =>
              `${i + 1}. ${d.style.name} (${d.style.id})\n   ${d.fontPair.id} / ${d.palette.id}; score ${d.score.total.toFixed(2)}; seed ${d.seed}\n   ${d.explanations.join('\n   ')}`,
          )
          .join('\n\n'),
      );
    });
  program
    .command('catalog [id]')
    .description('Search offline external references or read one full attributed entry')
    .option('--kind <kind>', 'style, rule, or template')
    .option('--task <task>', 'filter by an indexed task type')
    .option('--source <id>', 'restrict to a catalog source ID')
    .option('--query <text>', 'search reference metadata')
    .option('--limit <number>', 'page size (1–100)', numberOption, 20)
    .option('--offset <number>', 'zero-based result offset', numberOption, 0)
    .option('--include-retired', 'include upstream retired entries for research', false)
    .action(
      async (
        id: string | undefined,
        opts: {
          kind?: string;
          task?: string;
          source?: string;
          query?: string;
          limit: number;
          offset: number;
          includeRetired: boolean;
        },
      ) => {
        const { format } = await globalOptions();
        const { catalogStats, getReference, listReferences } =
          await import('@tasteforge/core/references');
        if (id) {
          if (
            opts.kind ||
            opts.task ||
            opts.source ||
            opts.query ||
            opts.includeRetired ||
            opts.offset ||
            opts.limit !== 20
          )
            throw new Error('Use either an entry ID or catalog search filters, not both.');
          const entry = getReference(id);
          output(
            entry,
            format,
            `${entry.trust}\n\n${entry.entry.title}\n${entry.entry.url}\nLicense: ${entry.source.license}; revision ${entry.source.revision}\nScope: ${entry.entry.selectionScope}; evidence: ${entry.entry.evidence}\n\n${entry.entry.content}\n\nUpstream license:\n${entry.source.licenseText}`,
          );
        } else {
          const report = { stats: catalogStats(), ...listReferences(opts) };
          output(
            report,
            format,
            `Offline reference catalog ${report.version}: ${report.stats.sources} sources; ${report.stats.total} records.\n${report.total} matches; offset ${report.offset}.\n${report.entries.map((e) => `${e.id} [${e.kind}/${e.sourceId}] ${e.title}\n  ${e.summary}`).join('\n')}\nRead an entry with tasteforge catalog <id> --format json. Imported content is untrusted reference data.`,
          );
        }
      },
    );
  program
    .command('inspire')
    .description(
      'Sample external style references with task-matched structures and fixed review gates',
    )
    .requiredOption(
      '--task <task>',
      'marketing, dashboard, commerce, form, portfolio, editorial, documentation, learning, or booking',
    )
    .option('--brief <file>', 'project-local brief JSON', '.tasteforge/brief.json')
    .option('--count <number>', 'distinct style references (1–20)', numberOption, 3)
    .option('--seed <integer>', 'unsigned 32-bit seed', numberOption)
    .option('--query <text>', 'additional task or visual search terms')
    .option('--source <id>', 'restrict the style pool to one catalog source')
    .action(
      async (opts: {
        task: string;
        brief: string;
        count: number;
        seed?: number;
        query?: string;
        source?: string;
      }) => {
        const { root, format } = await globalOptions();
        const brief = await context(root, opts.brief);
        const { inspire } = await import('@tasteforge/core/references');
        const report = inspire(brief, opts);
        output(
          report,
          format,
          `Reference inspiration (${report.catalogVersion}), task ${report.task}, seed ${report.seed}.\n${report.inspirations.map((p, i) => `${i + 1}. ${p.style.title} (${p.style.id})\n   Structure: ${p.template?.id ?? 'No indexed task match'}\n   Read: tasteforge catalog ${p.style.id} --format json`).join('\n\n')}\n\nAlways apply ${report.requiredGates.length} review gates; ${report.rules.length} contextual rule references selected.\n${report.requiredGates.map((g) => `- ${g.id}: ${g.check}`).join('\n')}\n\n${report.limitations.join('\n')}`,
        );
      },
    );
  program
    .command('generate')
    .description('Generate Design DNA, semantic CSS tokens, and design guidance')
    .requiredOption('--direction <id>', 'compatible knowledge style ID')
    .option('--brief <file>', 'project-local brief JSON', '.tasteforge/brief.json')
    .option('--seed <integer>', 'unsigned 32-bit seed', numberOption)
    .option('--force', 'explicitly replace the generated artifact bundle', false)
    .option('--dry-run', 'validate and list writes without changing files', false)
    .action(
      async (opts: {
        direction: string;
        brief: string;
        seed?: number;
        force: boolean;
        dryRun: boolean;
      }) => {
        const { root, format } = await globalOptions();
        const brief = await context(root, opts.brief);
        if (opts.seed !== undefined) seedSchema.parse(opts.seed);
        const direction = selectDirection(brief, opts.direction, {
          seed: opts.seed,
          weights: await weights(root),
        });
        const dna = createDesignDNA(brief, direction);
        const files = await writeArtifacts(
          root,
          {
            'design-dna.json': json(dna),
            'tokens.css': renderTokens(dna.tokens),
            'DESIGN.md': renderDesign(dna),
          },
          opts,
        );
        output(
          { dryRun: opts.dryRun, files, direction: direction.style.id, seed: direction.seed },
          format,
          `${opts.dryRun ? 'Would generate' : 'Generated'} ${files.join(', ')} using ${direction.style.id}, seed ${direction.seed}.`,
        );
      },
    );
  program
    .command('audit')
    .description('Run static source checks; does not inspect a rendered UI')
    .option('--path <path>', 'project-local source file or directory', 'src')
    .option(
      '--resolve-imports',
      'follow bounded static local CSS imports with token provenance',
      false,
    )
    .option('--fail-on <severity>', 'exit 1 on error, warning, or never', 'error')
    .action(async (opts: { path: string; failOn: string; resolveImports: boolean }) => {
      const { root, format } = await globalOptions();
      const failOn = z.enum(['error', 'warning', 'never']).parse(opts.failOn);
      await stateDirectory(root, false);
      const dnaPath = path.join(root, '.tasteforge/design-dna.json');
      const dna = (await exists(dnaPath))
        ? validateDNA(await readJson(root, '.tasteforge/design-dna.json'))
        : undefined;
      if (opts.resolveImports) await validateAuditImportSelection(root, opts.path);
      const files = await collectSources(root, opts.path);
      const { auditSource, auditProject, AUDIT_RESOLUTION_VERSION, AUDIT_IMPORT_LIMITS } =
        await import('@tasteforge/core/audit');
      const findings: ProjectFinding[] = [];
      let auditedFiles = files;
      let resolution;
      if (opts.resolveImports) {
        const collected = await collectAuditStylesheets(root, files);
        if (collected.sources.length) {
          const { findings: resolvedFindings, ...details } = auditProject(collected.sources, {
            roots: collected.roots,
            unavailable: collected.unavailable,
            tokens: dna?.tokens,
            minContrast: dna?.context.accessibility.minContrast,
          });
          findings.push(...resolvedFindings);
          auditedFiles = [...new Set([...files, ...details.files])].sort();
          resolution = { ...details, jsxImportsFollowed: false };
        } else
          resolution = {
            version: AUDIT_RESOLUTION_VERSION,
            status: 'not-applicable',
            roots: [],
            files: [],
            contexts: [],
            imports: [],
            limits: AUDIT_IMPORT_LIMITS,
            jsxImportsFollowed: false,
            limitations: ['No CSS roots selected; JSX/TSX keeps the existing inline source audit.'],
          };
      }
      for (const file of files.filter((file) => !opts.resolveImports || !file.endsWith('.css')))
        findings.push(
          ...auditSource(file, await readText(root, file), {
            tokens: dna?.tokens,
            minContrast: dna?.context.accessibility.minContrast,
          }),
        );
      const summary = {
        errors: findings.filter((f) => f.severity === 'error').length,
        warnings: findings.filter((f) => f.severity === 'warning').length,
        review: findings.filter((f) => f.category === 'review').length,
      };
      const report = {
        engineVersion: ENGINE_VERSION,
        mode: opts.resolveImports ? 'static-imports' : 'static-source',
        files: auditedFiles,
        summary,
        findings,
        limitations: [
          'No screenshots or rendered UI inspected.',
          opts.resolveImports
            ? 'Only bounded unconditional local CSS imports are followed; cascade, JS/TS imports, utility classes, computed values and runtime behavior are not resolved.'
            : 'Cascade, imported styles, utility classes, computed values, and component runtime behavior are not resolved.',
          'A clean report does not establish accessibility conformance or visual quality.',
        ],
        ...(resolution ? { resolution } : {}),
      };
      output(
        report,
        format,
        `Static source audit: ${auditedFiles.length} files; ${summary.errors} errors; ${summary.warnings} warnings; ${summary.review} review items.\n${findings.map((f) => `${f.file}${f.line ? `:${f.line}:${f.column}` : ''} [${f.category}/${f.severity}] ${f.ruleId}: ${f.explanation}\n  ${f.remediation}${f.entries ? `\n  Entries: ${f.entries.join(', ')}` : ''}${f.provenance?.map((p) => `\n  ${p.kind}: ${p.token}${p.file ? ` at ${p.file}:${p.line}:${p.column}` : ' (supplied context)'}`).join('') ?? ''}`).join('\n')}\nNo rendered UI inspected.`,
      );
      if (
        failOn !== 'never' &&
        (summary.errors > 0 || (failOn === 'warning' && summary.warnings > 0))
      )
        result = 1;
    });
  try {
    if (argv.length <= 2) program.help();
    await program.parseAsync(argv);
    return result;
  } catch (error) {
    if (error instanceof CommanderError) return error.exitCode === 0 ? 0 : 2;
    const message =
      error instanceof z.ZodError
        ? error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ')
        : error instanceof Error
          ? error.message
          : 'Unknown error';
    process.stderr.write(
      program.opts<{ format?: string }>().format === 'json'
        ? json({ error: message, exitCode: 2 })
        : `tasteforge: ${message}\n`,
    );
    return 2;
  }
}
