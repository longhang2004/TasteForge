import path from 'node:path';
import postcss from 'postcss';
import valueParser, { type Node as ValueNode } from 'postcss-value-parser';
import { auditSourceWithContext, findingSchema, type AuditOptions } from './audit-source.js';
import type {
  AuditSourceContext,
  ProjectFinding,
  TokenProvenance,
  ValueResolution,
} from './audit-context.js';
import { tokenMapSchema } from './schemas.js';

export const AUDIT_RESOLUTION_VERSION = '1.0';
export const AUDIT_IMPORT_LIMITS = Object.freeze({
  files: 256,
  imports: 1024,
  importDepth: 16,
  aliasDepth: 16,
  fileBytes: 2_000_000,
  totalBytes: 16_000_000,
  definitions: 5000,
  declarations: 20_000,
  findings: 2000,
  valueLength: 4096,
  provenance: 32,
  contexts: 512,
});
export type SourceInput = { file: string; source: string };
export type CssImport = {
  file: string;
  line: number;
  column: number;
  specifier: string;
  target?: string;
  reason?: string;
};
export type AuditProjectOptions = AuditOptions & {
  roots?: readonly string[];
  unavailable?: Readonly<Record<string, string>>;
};
export type AuditProjectResult = {
  version: typeof AUDIT_RESOLUTION_VERSION;
  status: 'complete' | 'partial';
  roots: string[];
  files: string[];
  contexts: { entry: string; files: string[]; complete: boolean }[];
  imports: (CssImport & { status: 'resolved' | 'unresolved' })[];
  findings: ProjectFinding[];
  limits: typeof AUDIT_IMPORT_LIMITS;
  limitations: string[];
};
type Definition = {
  name: string;
  value?: string;
  supported: boolean;
  origin: TokenProvenance;
  reason?: string;
};
type Analysis = {
  imports: CssImport[];
  definitions: Definition[];
  declarations: number;
  parseFailed: boolean;
  opaque: boolean;
};
const simpleName = /^--[\w-]+$/;
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
function fileName(file: string): string {
  if (
    file.length > 1024 ||
    /[\\:]/.test(file) ||
    [...file].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) ||
    path.posix.isAbsolute(file) ||
    path.posix.normalize(file) !== file ||
    file.startsWith('../') ||
    !file.endsWith('.css')
  )
    throw new Error(`Expected a normalized project-relative .css path: ${file}`);
  return file;
}
function checkSource(source: string): void {
  if (Buffer.byteLength(source, 'utf8') > AUDIT_IMPORT_LIMITS.fileBytes)
    throw new Error('Audit CSS file exceeds 2000000 UTF-8 bytes');
}
function importRequest(
  file: string,
  params: string,
  line: number,
  column: number,
  leading: boolean,
): CssImport {
  const result: CssImport = { file, line, column, specifier: params.slice(0, 1024) };
  const unsupported = (reason: string) => ({ ...result, reason });
  if (!leading) return unsupported('Only leading top-level unconditional CSS imports are followed');
  if (params.length > 2048) return unsupported('Import parameters exceed the supported length');
  const nodes = valueParser(params).nodes.filter((n) => n.type !== 'space' && n.type !== 'comment');
  let specifier: string | undefined;
  const node = nodes[0];
  if (node && 'unclosed' in node && node.unclosed) return unsupported('Unclosed import URL/string');
  if (nodes.length === 1 && node?.type === 'string') specifier = node.value;
  if (nodes.length === 1 && node?.type === 'function' && node.value.toLowerCase() === 'url') {
    const inner = node.nodes.filter((n) => n.type !== 'space' && n.type !== 'comment');
    if (inner.length === 1 && (inner[0]?.type === 'string' || inner[0]?.type === 'word'))
      specifier = inner[0].value;
  }
  if (!specifier)
    return unsupported('Conditional, layered or nonliteral import syntax is not resolved');
  result.specifier = specifier;
  if (specifier.length > 1024 || /[\\%?#\0\r\n]/.test(specifier))
    return unsupported(
      'Escaped, encoded, query/fragment or overlong import paths are not resolved',
    );
  if (/^[a-z][\w+.-]*:/i.test(specifier) || specifier.startsWith('/'))
    return unsupported('External and absolute stylesheet imports are not followed');
  if (!specifier.endsWith('.css') || specifier.endsWith('.module.css'))
    return unsupported('Only plain .css files are supported; CSS Modules are not resolved');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  if (target.startsWith('../') || path.posix.isAbsolute(target))
    return unsupported('Import escapes the project boundary');
  try {
    result.target = fileName(target);
  } catch {
    return unsupported('Unsupported project-relative import path');
  }
  return result;
}
function analyze(file: string, source: string): Analysis {
  fileName(file);
  checkSource(source);
  const result: Analysis = {
    imports: [],
    definitions: [],
    declarations: 0,
    parseFailed: false,
    opaque: file.endsWith('.module.css'),
  };
  let root;
  try {
    root = postcss.parse(source, { from: file });
  } catch {
    result.parseFailed = true;
    return result;
  }
  const seen = new Set<object>();
  let leading = true;
  for (const node of root.nodes) {
    if (node.type === 'comment') continue;
    if (node.type === 'atrule' && node.name.toLowerCase() === 'charset' && leading) continue;
    if (node.type === 'atrule' && node.name.toLowerCase() === 'import') {
      seen.add(node);
      result.imports.push(
        importRequest(
          file,
          node.params,
          node.source?.start?.line ?? 1,
          node.source?.start?.column ?? 1,
          leading,
        ),
      );
    } else leading = false;
  }
  root.walkAtRules((rule) => {
    // PostCSS can split an escaped at-keyword into name + params.
    if (rule.name.includes('\\') || rule.params.includes('\\')) result.opaque = true;
    if (rule.name.toLowerCase() === 'import' && !seen.has(rule))
      result.imports.push(
        importRequest(
          file,
          rule.params,
          rule.source?.start?.line ?? 1,
          rule.source?.start?.column ?? 1,
          false,
        ),
      );
    if (rule.name.toLowerCase() === 'property') {
      const name = rule.params.trim();
      if (simpleName.test(name))
        result.definitions.push({
          name,
          supported: false,
          reason: '@property registration is not resolved',
          origin: {
            kind: 'definition',
            token: name,
            file,
            line: rule.source?.start?.line ?? 1,
            column: rule.source?.start?.column ?? 1,
          },
        });
      else result.opaque = true;
    }
    if (result.imports.length > AUDIT_IMPORT_LIMITS.imports)
      throw new Error('Audit import edge limit reached');
    if (result.definitions.length > AUDIT_IMPORT_LIMITS.definitions)
      throw new Error('Audit custom-property definition limit reached');
  });
  root.walkDecls((decl) => {
    if (++result.declarations > AUDIT_IMPORT_LIMITS.declarations)
      throw new Error('Audit declaration limit reached');
    // Escaped spellings may decode to another binding, including a custom-property prefix.
    if (decl.prop.includes('\\')) result.opaque = true;
    if (!decl.prop.startsWith('--')) return;
    const global =
      decl.parent?.type === 'rule' &&
      decl.parent.selector === ':root' &&
      decl.parent.parent?.type === 'root';
    const supported =
      global && simpleName.test(decl.prop) && decl.prop.length <= 256 && decl.value.length <= 1000;
    result.definitions.push({
      name: decl.prop,
      value: decl.value,
      supported,
      reason: !global
        ? 'Scoped or conditional custom-property definition'
        : 'Unsupported token name/value length',
      origin: {
        kind: 'definition',
        token: decl.prop,
        file,
        line: decl.source?.start?.line ?? 1,
        column: decl.source?.start?.column ?? 1,
        ...(decl.value.length <= 128 ? { value: decl.value } : {}),
      },
    });
    if (result.definitions.length > AUDIT_IMPORT_LIMITS.definitions)
      throw new Error('Audit custom-property definition limit reached');
  });
  result.imports.sort((a, b) => a.line - b.line || a.column - b.column);
  return result;
}
/** Parse local CSS import requests only; no file/network access and no source execution. */
export function inspectCssImports(file: string, source: string): CssImport[] {
  return analyze(file, source).imports;
}
function origins(input: TokenProvenance[]): TokenProvenance[] {
  const unique = new Map(input.map((p) => [JSON.stringify(p), p]));
  return [...unique.values()];
}
function variableReferences(input: string): { names: string[]; valid: boolean } {
  const names: string[] = [];
  let valid = !input.includes('\\');
  valueParser(input).walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
    const comma = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',');
    const name = valueParser.stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma)).trim();
    if (node.unclosed || !simpleName.test(name) || name.length > 256) valid = false;
    else names.push(name);
  });
  return { names, valid };
}
function contextFor(
  file: string,
  definitions: Definition[],
  complete: boolean,
  supplied: Record<string, string>,
): AuditSourceContext {
  const names = new Map<string, Definition[]>();
  for (const d of definitions) names.set(d.name, [...(names.get(d.name) ?? []), d]);
  // CSS dependency cycles include references inside unused definition fallbacks.
  // Remove acyclic sinks iteratively; remaining nodes reach a cycle and stay review.
  const bindings = new Map(
    [...names].map(([name, defs]) => [name, defs.map((d) => d.value ?? '')]),
  );
  for (const [name, value] of Object.entries(supplied))
    if (!bindings.has(name)) bindings.set(name, [value]);
  const dependencies = new Map(
    [...bindings].map(([name, values]) => [
      name,
      new Set(values.flatMap((v) => variableReferences(v).names).filter((n) => bindings.has(n))),
    ]),
  );
  const parents = new Map<string, Set<string>>();
  for (const [name, refs] of dependencies)
    for (const ref of refs) {
      const values = parents.get(ref) ?? new Set<string>();
      values.add(name);
      parents.set(ref, values);
    }
  const sinks = [...dependencies].filter(([, refs]) => !refs.size).map(([name]) => name);
  const cyclic = new Set(dependencies.keys());
  for (let i = 0; i < sinks.length; i++) {
    const name = sinks[i]!;
    cyclic.delete(name);
    for (const parent of parents.get(name) ?? []) {
      const refs = dependencies.get(parent)!;
      refs.delete(name);
      if (!refs.size) sinks.push(parent);
    }
  }
  const cache = new Map<string, ValueResolution>();
  const missing = (name: string) => complete && !names.has(name) && !Object.hasOwn(supplied, name);
  const blocked = (reason: string, provenance: TokenProvenance[] = []): ValueResolution => ({
    reason,
    provenance: origins(provenance).slice(0, AUDIT_IMPORT_LIMITS.provenance),
  });
  const bound = (value: string, provenance: TokenProvenance[]): ValueResolution => {
    const proof = origins(provenance);
    if (
      value.length > AUDIT_IMPORT_LIMITS.valueLength ||
      proof.length > AUDIT_IMPORT_LIMITS.provenance
    )
      return blocked('Resolved value/provenance budget reached', proof);
    return { value, provenance: proof };
  };
  const token = (name: string, depth: number, chain: Set<string>): ValueResolution => {
    if (!complete) return blocked('Import context is incomplete');
    if (cyclic.has(name))
      return blocked(
        'CSS definition dependency cycle',
        names.get(name)?.map((d) => d.origin),
      );
    if (depth > AUDIT_IMPORT_LIMITS.aliasDepth || chain.has(name))
      return blocked(
        'Alias cycle/depth limit reached',
        names.get(name)?.map((d) => d.origin),
      );
    const cacheKey = `${depth}:${name}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const defs: Definition[] | undefined =
      names.get(name) ??
      (Object.hasOwn(supplied, name)
        ? [
            {
              name,
              value: supplied[name]!,
              supported: true,
              origin: {
                kind: 'provided',
                token: name,
                ...(supplied[name]!.length <= 128 ? { value: supplied[name] } : {}),
              },
            },
          ]
        : undefined);
    if (!defs) return blocked('No definition in the complete supplied context');
    const proof = defs.map((d) => d.origin);
    if (defs.some((d) => !d.supported))
      return blocked(defs.find((d) => !d.supported)!.reason ?? 'Unsupported definition', proof);
    if (new Set(defs.map((d) => d.value)).size !== 1)
      return blocked('Conflicting source definitions', proof);
    const next = new Set(chain);
    next.add(name);
    const definition = defs[0]!;
    const resolved = value(definition.value!, depth + 1, next, definition.origin);
    const result =
      resolved.value === undefined
        ? blocked(resolved.reason!, [...proof, ...resolved.provenance])
        : bound(resolved.value, [...proof, ...resolved.provenance]);
    // Depth is part of the key; branch-specific cycle failures are never reused.
    if (result.value !== undefined || !result.reason?.includes('cycle'))
      cache.set(cacheKey, result);
    return result;
  };
  const value = (
    input: string,
    depth: number,
    chain: Set<string>,
    at?: { file?: string; line?: number; column?: number },
  ): ValueResolution => {
    if (input.includes('\\')) return blocked('Escaped CSS values are not resolved');
    if (!variableReferences(input).valid)
      return blocked('Unsupported variable grammar, including fallback references');
    if (depth > AUDIT_IMPORT_LIMITS.aliasDepth || input.length > AUDIT_IMPORT_LIMITS.valueLength)
      return blocked('Value/alias budget reached');
    const parsed = valueParser(input);
    let failure: string | undefined;
    const proof: TokenProvenance[] = [];
    let substitutions = 0;
    parsed.walk((node, index, nodes) => {
      if (node.type !== 'function' || node.value.toLowerCase() !== 'var') return;
      const separated = (neighbor: ValueNode | undefined) =>
        !neighbor ||
        neighbor.type === 'space' ||
        neighbor.type === 'comment' ||
        (neighbor.type === 'div' && neighbor.value === ',');
      if (!separated(nodes[index - 1]) || !separated(nodes[index + 1])) {
        failure = 'Adjacent variable tokens require runtime grammar validation';
        return false;
      }
      if (++substitutions > 256) {
        failure = 'Value substitution budget reached';
        return false;
      }
      const comma = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',');
      const name = valueParser
        .stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma))
        .trim();
      if (!simpleName.test(name) || name.length > 256) {
        failure = 'Unsupported custom-property name';
        return false;
      }
      let result = token(name, depth, chain);
      if (result.value === undefined && missing(name) && comma >= 0) {
        const fallback = valueParser.stringify(node.nodes.slice(comma + 1)).trim();
        result = value(fallback, depth + 1, new Set(chain), at);
        if (result.value !== undefined)
          result = bound(result.value, [
            {
              kind: 'fallback',
              token: name,
              ...(at?.file ? { file: at.file } : {}),
              ...(at?.line ? { line: at.line, column: at.column } : {}),
              ...(fallback.length <= 128 ? { value: fallback } : {}),
            },
            ...result.provenance,
          ]);
      }
      proof.push(...result.provenance);
      if (result.value === undefined) failure = result.reason ?? 'Unresolved variable';
      else Object.assign(node, { type: 'word', value: result.value });
      return false;
    });
    return failure ? blocked(failure, proof) : bound(parsed.toString(), proof);
  };
  const tokens: Record<string, string> = {};
  for (const name of [...new Set([...names.keys(), ...Object.keys(supplied)])].sort(compare)) {
    if (!/^--tf-[a-z0-9-]+$/.test(name)) continue;
    const result = token(name, 0, new Set());
    if (result.value !== undefined && result.value.length <= 1000) tokens[name] = result.value;
  }
  return {
    tokens,
    resolve: (input, at) => value(input, 0, new Set(), { file, ...at }),
    tokenState: (name) =>
      missing(name)
        ? 'missing'
        : token(name, 0, new Set()).value !== undefined
          ? 'known'
          : 'unresolved',
    origins: (name) => token(name, 0, new Set()).provenance,
  };
}
/** Audit only explicit supplied stylesheet closures; no concatenation, filesystem or runtime cascade. */
export function auditProject(
  input: readonly SourceInput[],
  options: AuditProjectOptions = {},
): AuditProjectResult {
  if (!input.length || input.length > AUDIT_IMPORT_LIMITS.files)
    throw new Error('Audit requires 1..256 supplied CSS files');
  const sources = new Map<string, string>();
  let bytes = 0;
  for (const item of input) {
    const file = fileName(item.file);
    checkSource(item.source);
    if (sources.has(file)) throw new Error(`Duplicate audit source: ${file}`);
    sources.set(file, item.source);
    bytes += Buffer.byteLength(item.source, 'utf8');
  }
  if (bytes > AUDIT_IMPORT_LIMITS.totalBytes)
    throw new Error('Audit aggregate UTF-8 byte limit reached');
  const roots = [...new Set(options.roots ?? sources.keys())].sort(compare);
  if (!roots.length || roots.some((f) => !sources.has(fileName(f))))
    throw new Error('Every audit root must have supplied CSS source');
  const analyses = new Map<string, Analysis>();
  const imports: AuditProjectResult['imports'] = [];
  const pending = [...roots];
  let definitions = 0,
    declarations = 0;
  while (pending.length) {
    const file = pending.shift()!;
    if (analyses.has(file)) continue;
    const analysis = analyze(file, sources.get(file)!);
    analyses.set(file, analysis);
    definitions += analysis.definitions.length;
    declarations += analysis.declarations;
    if (
      definitions > AUDIT_IMPORT_LIMITS.definitions ||
      declarations > AUDIT_IMPORT_LIMITS.declarations
    )
      throw new Error('Audit definition/declaration budget reached');
    for (const request of analysis.imports) {
      const available = request.target && sources.has(request.target);
      imports.push({
        ...request,
        status: available ? 'resolved' : 'unresolved',
        ...(!available && !request.reason
          ? {
              reason:
                request.target && Object.hasOwn(options.unavailable ?? {}, request.target)
                  ? options.unavailable![request.target]
                  : 'Imported stylesheet source is unavailable',
            }
          : {}),
      });
      if (available) pending.push(request.target!);
      if (imports.length > AUDIT_IMPORT_LIMITS.imports)
        throw new Error('Audit import edge limit reached');
    }
  }
  const files = [...analyses.keys()].sort(compare);
  const outgoing = new Map(files.map((f) => [f, imports.filter((e) => e.file === f)]));
  const findings: ProjectFinding[] = [];
  const issueKeys = new Set<string>();
  const review = (edge: CssImport, reason: string) => {
    const key = JSON.stringify([edge.file, edge.line, edge.column, reason]);
    if (issueKeys.has(key)) return;
    issueKeys.add(key);
    findings.push(
      findingSchema.parse({
        ruleId: 'import-resolution-review',
        severity: 'info',
        confidence: 'low',
        category: 'review',
        file: edge.file,
        line: edge.line,
        column: edge.column,
        explanation: `Stylesheet import ${JSON.stringify(edge.specifier)} was not resolved: ${reason}.`,
        remediation:
          'Supply a supported local stylesheet or inspect the build/runtime stylesheet context.',
      }),
    );
  };
  for (const edge of imports) if (edge.status === 'unresolved') review(edge, edge.reason!);
  // A DFS back edge makes that import unresolved. Every dependent closure then remains incomplete.
  const done = new Set<string>(),
    active = new Set<string>();
  const visit = (file: string) => {
    if (done.has(file)) return;
    active.add(file);
    for (const edge of outgoing.get(file) ?? []) {
      if (edge.status !== 'resolved') continue;
      if (active.has(edge.target!)) {
        edge.status = 'unresolved';
        edge.reason = 'Import cycle';
        review(edge, edge.reason);
      } else visit(edge.target!);
    }
    active.delete(file);
    done.add(file);
  };
  for (const file of files) visit(file);
  const supplied = tokenMapSchema.parse(options.tokens ?? {});
  for (const file of files)
    if (analyses.get(file)!.opaque)
      findings.push(
        findingSchema.parse({
          ruleId: 'stylesheet-context-review',
          severity: 'info',
          confidence: 'low',
          category: 'review',
          file,
          line: 1,
          column: 1,
          explanation:
            'Escaped names, unsupported registrations or CSS Modules make this stylesheet context incomplete.',
          remediation:
            'Inspect the build/runtime context; this resolver does not decode escaped bindings or CSS Modules.',
        }),
      );
  const contexts: AuditProjectResult['contexts'] = [];
  const audited = new Map<string, ProjectFinding[]>();
  const merged = new Map<string, ProjectFinding>();
  for (const entry of roots) {
    const closure = new Set<string>();
    const queue: [string, number][] = [[entry, 0]];
    const discovered = new Set<string>([entry]);
    let complete = true;
    while (queue.length) {
      const [current, depth] = queue.shift()!;
      if (closure.has(current)) continue;
      closure.add(current);
      if (analyses.get(current)!.parseFailed || analyses.get(current)!.opaque) complete = false;
      for (const edge of outgoing.get(current) ?? []) {
        if (edge.status === 'unresolved') {
          complete = false;
          continue;
        }
        if (discovered.has(edge.target!)) continue;
        if (depth >= AUDIT_IMPORT_LIMITS.importDepth) {
          complete = false;
          review(edge, `Import hop limit ${AUDIT_IMPORT_LIMITS.importDepth} reached from ${entry}`);
          continue;
        }
        discovered.add(edge.target!);
        queue.push([edge.target!, depth + 1]);
      }
    }
    const closureFiles = [...closure].sort(compare);
    contexts.push({ entry, files: closureFiles, complete });
    const definitionFiles = closureFiles.filter((f) => analyses.get(f)!.definitions.length);
    const defs = definitionFiles.flatMap((f) => analyses.get(f)!.definitions);
    for (const file of closureFiles) {
      const key = JSON.stringify([file, complete, complete ? definitionFiles : []]);
      let result = audited.get(key);
      if (!result) {
        if (audited.size >= AUDIT_IMPORT_LIMITS.contexts)
          throw new Error(
            'Audit file/context limit reached; select a stylesheet entry with --path',
          );
        result = auditSourceWithContext(
          file,
          sources.get(file)!,
          options,
          contextFor(file, defs, complete, supplied),
        );
        audited.set(key, result);
      }
      for (const finding of result) {
        const findingKey = JSON.stringify(finding);
        const existing = merged.get(findingKey);
        if (existing) existing.entries!.push(entry);
        else merged.set(findingKey, { ...finding, entries: [entry] });
      }
      if (findings.length + merged.size > AUDIT_IMPORT_LIMITS.findings)
        throw new Error('Audit finding limit reached; use a narrower path');
    }
  }
  findings.push(...merged.values());
  findings.sort(
    (a, b) =>
      compare(a.file, b.file) ||
      (a.line ?? 0) - (b.line ?? 0) ||
      (a.column ?? 0) - (b.column ?? 0) ||
      compare(a.ruleId, b.ruleId),
  );
  return {
    version: AUDIT_RESOLUTION_VERSION,
    status:
      [...analyses.values()].some((a) => a.parseFailed) ||
      findings.some((f) => f.category === 'review')
        ? 'partial'
        : 'complete',
    roots,
    files,
    contexts,
    imports,
    findings,
    limits: AUDIT_IMPORT_LIMITS,
    limitations: [
      'Static stylesheet relationships only; no screenshots or computed browser styles.',
      'Only explicit local unconditional CSS imports and unambiguous top-level :root candidates are resolved.',
      'Each selected stylesheet is a separate entry context; application-entry ordering, selectors, inheritance, CSS Modules, JS/TS imports and runtime styling are not resolved.',
      'Provenance locations identify definition/import/use declarations, not token-substring offsets.',
      'A clean report does not establish accessibility conformance or visual quality.',
    ],
  };
}
