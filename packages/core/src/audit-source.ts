import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import ts from 'typescript';
import { z } from 'zod';
import { contrast } from './color.js';
import { tokenMapSchema } from './schemas.js';
import type { AuditSourceContext, ProjectFinding, TokenProvenance } from './audit-context.js';

export const findingSchema = z
  .object({
    ruleId: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    confidence: z.enum(['high', 'medium', 'low']),
    category: z.enum(['verified', 'heuristic', 'review']),
    file: z.string(),
    line: z.number().int().positive().optional(),
    column: z.number().int().positive().optional(),
    explanation: z.string(),
    remediation: z.string(),
  })
  .strict();
export type Finding = z.infer<typeof findingSchema>;
type Declaration = {
  prop: string;
  value: string;
  line: number;
  column: number;
  scope: string;
  root?: boolean;
};
export type AuditOptions = { tokens?: Record<string, string>; minContrast?: number };
const generics = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'system-ui',
  'cursive',
  'fantasy',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
]);
function literalColor(value: string): string | undefined {
  if (/^#[a-f\d]{6}$/i.test(value)) return value;
  if (/^#[a-f\d]{3}$/i.test(value))
    return (
      '#' +
      value
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
    );
  return { white: '#ffffff', black: '#000000' }[value.toLowerCase()];
}
/** No filesystem access or code execution; only literal CSS and JSX object properties. */
export function auditSource(file: string, source: string, options: AuditOptions = {}): Finding[] {
  return auditSourceWithContext(file, source, options);
}

/** Internal adapter for an explicitly supplied static stylesheet context. */
export function auditSourceWithContext(
  file: string,
  source: string,
  options: AuditOptions = {},
  context?: AuditSourceContext,
): ProjectFinding[] {
  z.string().max(2_000_000).parse(source);
  const known = tokenMapSchema.parse(context?.tokens ?? options.tokens ?? {});
  const minimum = z
    .number()
    .min(1)
    .max(21)
    .parse(options.minContrast ?? 4.5);
  const findings: ProjectFinding[] = [];
  const declarations: Declaration[] = [];
  const add = (
    ruleId: string,
    severity: Finding['severity'],
    confidence: Finding['confidence'],
    category: Finding['category'],
    explanation: string,
    remediation: string,
    at?: { line: number; column: number; value?: string },
    explicitProvenance?: TokenProvenance[],
  ) => {
    if (context && findings.length >= 2000)
      throw new Error('Audit finding limit reached; use a narrower path');
    const provenance =
      explicitProvenance ?? (context && at?.value ? context.resolve(at.value, at).provenance : []);
    findings.push({
      ruleId,
      severity,
      confidence,
      category,
      file,
      ...(at ? { line: at.line, column: at.column } : {}),
      explanation,
      remediation,
      ...(provenance.length ? { provenance } : {}),
    });
  };
  if (file.endsWith('.css')) {
    try {
      const root = postcss.parse(source, { from: file });
      let scopeIndex = 0;
      const scopes = new Map<object, string>();
      root.walkDecls((decl) => {
        if (!decl.parent || !decl.source?.start) return;
        if (!scopes.has(decl.parent)) scopes.set(decl.parent, String(scopeIndex++));
        const rootToken =
          decl.parent.type === 'rule' &&
          decl.parent.selector === ':root' &&
          decl.parent.parent?.type === 'root';
        declarations.push({
          prop: decl.prop,
          value: decl.value,
          ...decl.source.start,
          scope: scopes.get(decl.parent)!,
          root: rootToken,
        });
      });
    } catch (error) {
      const parsed = error as { reason?: string; line?: number; column?: number };
      add(
        'parse-error',
        'error',
        'high',
        'verified',
        parsed.reason ?? 'Malformed CSS',
        'Fix the syntax before auditing this file.',
        { line: parsed.line ?? 1, column: parsed.column ?? 1 },
      );
      return findings;
    }
  } else if (/\.[jt]sx$/.test(file)) {
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const diagnostics =
      ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ESNext },
        fileName: file,
        reportDiagnostics: true,
      }).diagnostics ?? [];
    for (const d of diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error)) {
      const at = ast.getLineAndCharacterOfPosition(d.start ?? 0);
      add(
        'parse-error',
        'error',
        'high',
        'verified',
        ts.flattenDiagnosticMessageText(d.messageText, ' '),
        'Fix JSX/TSX syntax before reviewing this file.',
        { line: at.line + 1, column: at.character + 1 },
      );
    }
    if (findings.length) return findings;
    let dynamicStyle = false;
    const location = (node: ts.Node) => {
      const at = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      return { line: at.line + 1, column: at.character + 1 };
    };
    const visit = (node: ts.Node, cardDepth: number) => {
      let nextDepth = cardDepth;
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const attrs = opening.attributes.properties;
        const classAttr = attrs.find(
          (a) => ts.isJsxAttribute(a) && a.name.getText(ast) === 'className',
        );
        const classText =
          classAttr &&
          ts.isJsxAttribute(classAttr) &&
          classAttr.initializer &&
          ts.isStringLiteral(classAttr.initializer)
            ? classAttr.initializer.text
            : '';
        if (
          /(^|[\s_-])card($|[\s_-])/i.test(classText) ||
          /(^|\.)Card$/.test(opening.tagName.getText(ast))
        ) {
          nextDepth++;
          if (nextDepth === 3)
            add(
              'nested-cards',
              'warning',
              'medium',
              'heuristic',
              'Three card-like JSX ancestors may create redundant visual containment.',
              'Inspect grouping; use spacing, headings, or separators when another container adds no meaning.',
              location(opening),
            );
        }
      }
      if (ts.isJsxAttribute(node) && node.name.getText(ast) === 'style' && node.initializer) {
        if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isObjectLiteralExpression(node.initializer.expression)
        ) {
          for (const prop of node.initializer.expression.properties) {
            if (
              ts.isPropertyAssignment(prop) &&
              !ts.isComputedPropertyName(prop.name) &&
              (ts.isStringLiteral(prop.initializer) || ts.isNumericLiteral(prop.initializer))
            ) {
              const key = ts.isStringLiteral(prop.name) ? prop.name.text : prop.name.getText(ast);
              const name = key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
              const numeric = ts.isNumericLiteral(prop.initializer);
              const unitless =
                /^(opacity|z-index|font-weight|line-height|flex|order|flex-grow|flex-shrink)$/;
              const value =
                prop.initializer.text +
                (numeric && !unitless.test(name) && prop.initializer.text !== '0' ? 'px' : '');
              declarations.push({ prop: name, value, ...location(prop), scope: `jsx:${node.pos}` });
            } else dynamicStyle = true;
          }
        } else dynamicStyle = true;
      }
      ts.forEachChild(node, (child) => visit(child, nextDepth));
    };
    visit(ast, 0);
    if (dynamicStyle)
      add(
        'dynamic-style-review',
        'info',
        'low',
        'review',
        'Some JSX styles are computed or spread; their final values were not resolved.',
        'Inspect rendered states or review the referenced style definitions.',
      );
  } else {
    throw new Error(`Unsupported audit file: ${file}. Supported: .css, .tsx, .jsx`);
  }
  const tokens: Record<string, string> = { ...known };
  if (!context)
    for (const d of declarations) if (d.root && d.prop.startsWith('--')) tokens[d.prop] = d.value;
  const resolve = (value: string, depth = 0): string | undefined => {
    if (context) return context.resolve(value).value;
    if (depth > 10) return undefined;
    const parsed = valueParser(value);
    let unresolved = false;
    parsed.walk((node) => {
      if (node.type === 'function' && node.value === 'var') {
        const comma = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',');
        const name = valueParser
          .stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma))
          .trim();
        const fallback =
          comma < 0 ? undefined : valueParser.stringify(node.nodes.slice(comma + 1)).trim();
        const replacement = resolve(
          (Object.hasOwn(tokens, name) ? tokens[name] : fallback) ?? '',
          depth + 1,
        );
        if (!replacement) unresolved = true;
        else {
          Object.assign(node, { type: 'word', value: replacement });
        }
        return false;
      }
    });
    return unresolved ? undefined : parsed.toString();
  };
  let gradientCount = 0;
  let firstGradient: Declaration | undefined;
  const families = new Set<string>();
  for (const d of declarations) {
    const containsVar = context ? /var\(/i.test(d.value) : d.value.includes('var(');
    const parsed = valueParser(d.value);
    parsed.walk((node) => {
      if (
        node.type === 'function' &&
        /^(repeating-)?(linear|radial|conic)-gradient$/.test(node.value)
      ) {
        gradientCount++;
        firstGradient ??= d;
      }
      if (node.type === 'function' && (context ? node.value.toLowerCase() : node.value) === 'var') {
        const comma = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',');
        const name = valueParser
          .stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma))
          .trim();
        if (!/^--[\w-]+$/.test(name) && !(context && name.includes('\\')))
          add(
            'malformed-token',
            'error',
            'high',
            'verified',
            `Malformed custom property reference: ${name}`,
            'Use var(--token-name) with an optional fallback.',
            d,
          );
        else if (
          name.startsWith('--tf-') &&
          (context ? context.tokenState(name) === 'missing' : !(name in tokens))
        )
          add(
            'unknown-token',
            'warning',
            'medium',
            'heuristic',
            `No available definition for ${name}${comma >= 0 ? '; a fallback is present' : ''}.`,
            'Define the token, import the matching tokens.css, or correct the name.',
            d,
          );
      }
    });
    if (d.prop.startsWith('--tf-') && /[;{}]|url\s*\(/i.test(d.value))
      add(
        'malformed-token',
        'error',
        'high',
        'verified',
        `Unsupported TasteForge token value for ${d.prop}.`,
        'Use a scalar color, length, duration, number, or font stack.',
        d,
      );
    if (d.prop.startsWith('--tf-') && !containsVar) {
      const invalid = d.prop.startsWith('--tf-color-')
        ? !literalColor(d.value)
        : /^--tf-(space|radius)-/.test(d.prop)
          ? !/^(0|\d*\.?\d+(px|rem))$/.test(d.value)
          : d.prop === '--tf-motion-duration'
            ? !/^\d*\.?\d+m?s$/.test(d.value)
            : d.prop === '--tf-line-height-body'
              ? !/^\d*\.?\d+$/.test(d.value)
              : false;
      if (invalid)
        add(
          'malformed-token',
          'error',
          'high',
          'verified',
          `Unsupported value '${d.value}' for ${d.prop} in the TasteForge token contract.`,
          'Use an opaque hex color, nonnegative length, duration, or number appropriate to the token role.',
          d,
        );
    }
    const resolved = resolve(d.value);
    if (context && containsVar && !resolved) {
      const unresolved = context.resolve(d.value, d);
      add(
        'token-resolution-review',
        'info',
        'low',
        'review',
        `The static token value remains unresolved: ${unresolved.reason ?? 'unsupported value'}.`,
        'Review the token definitions/import context or inspect computed values in a browser.',
        d,
        unresolved.provenance,
      );
    }
    if (
      d.prop === 'font-family' &&
      resolved &&
      !['inherit', 'initial', 'unset', 'revert', 'revert-layer'].includes(
        resolved.trim().toLowerCase(),
      )
    ) {
      families.add(resolved.toLowerCase());
      const pieces = valueParser(resolved).nodes;
      const last = pieces.filter((n) => n.type === 'word' || n.type === 'string').at(-1);
      if (last?.type !== 'word' || !generics.has(last.value.toLowerCase()))
        add(
          'font-fallback',
          'warning',
          'high',
          'verified',
          `font-family ends without a generic fallback: ${d.value}`,
          'End the stack with serif, sans-serif, monospace, or another CSS generic family.',
          d,
        );
    }
    const color = literalColor(d.value);
    const colorRole = /^(color|background-color|border-color)$/;
    const spaceRole = /^(margin|padding|gap|row-gap|column-gap)(-|$)/;
    const radiusRole = /^border(-[a-z]+)*-radius$/;
    const role = colorRole.test(d.prop)
      ? '--tf-color-'
      : spaceRole.test(d.prop)
        ? '--tf-space-'
        : radiusRole.test(d.prop)
          ? '--tf-radius-'
          : d.prop === 'font-size'
            ? '--tf-font-size-'
            : undefined;
    const available = role ? Object.entries(known).filter(([key]) => key.startsWith(role)) : [];
    const length = /^\d*\.?\d+(px|rem)$/.test(d.value) ? d.value : undefined;
    if (
      !d.prop.startsWith('--') &&
      !d.value.includes('var(') &&
      available.length &&
      (color || length)
    ) {
      const equivalent = (value: string) =>
        /^\d*\.?\d+(px|rem)$/.test(value)
          ? parseFloat(value) * (value.endsWith('rem') ? 16 : 1)
          : literalColor(value)?.toLowerCase();
      const matching = available.find(([, value]) => equivalent(value) === equivalent(d.value));
      add(
        matching ? 'hardcoded-token' : 'off-scale-value',
        'warning',
        'medium',
        'heuristic',
        matching
          ? `${d.prop}: ${d.value} duplicates ${matching[0]}.`
          : `${d.prop}: ${d.value} is outside the available token values (length comparison assumes a 16px root).`,
        matching
          ? `Use var(${matching[0]}) to keep the value linked to the design system.`
          : 'Use the appropriate token or document why this value is an intentional exception.',
        d,
        matching && context ? context.origins(matching[0]) : undefined,
      );
    }
  }
  if (gradientCount >= 3)
    add(
      'repeated-gradients',
      'warning',
      'medium',
      'heuristic',
      `${gradientCount} gradient functions occur in this file; simultaneous decoration may compete with content.`,
      'Inspect the rendered view and keep gradients that serve hierarchy, brand, or data.',
      firstGradient,
    );
  if (families.size > 3)
    add(
      'typography-drift',
      'warning',
      'low',
      'heuristic',
      `${families.size} font-family stacks are declared.`,
      'Check whether each family has a deliberate role; consolidate accidental variation.',
    );
  const grouped = new Map<string, Declaration[]>();
  for (const declaration of declarations) {
    if (declaration.prop.startsWith('--')) continue;
    const group = grouped.get(declaration.scope) ?? [];
    group.push(declaration);
    grouped.set(declaration.scope, group);
  }
  for (const group of grouped.values()) {
    const fg = group.filter((d) => d.prop === 'color').at(-1);
    const bg = group.filter((d) => d.prop === 'background-color' || d.prop === 'background').at(-1);
    if (!fg || !bg) continue;
    const f = literalColor(resolve(fg.value) ?? '');
    const b = literalColor(resolve(bg.value) ?? '');
    const layered = group.some(
      (d) =>
        /^(opacity|background-image|filter|mix-blend-mode)$/.test(d.prop) &&
        !['1', 'none', 'normal'].includes(d.value),
    );
    if (f && b && !layered) {
      const ratio = contrast(f, b);
      if (ratio < minimum)
        add(
          'contrast-pair',
          'warning',
          'high',
          'verified',
          `The explicitly declared opaque pair ${f} on ${b} has ${ratio.toFixed(2)}:1 contrast, below the ${minimum}:1 normal-text target. Cascade, text size, and actual visibility were not evaluated.`,
          'Use a palette pair meeting the text target; confirm actual computed styles and large-text exceptions in a browser.',
          fg,
          context
            ? [
                ...context.resolve(fg.value, fg).provenance,
                ...context.resolve(bg.value, bg).provenance,
              ]
            : undefined,
        );
    } else
      add(
        'contrast-review',
        'info',
        'low',
        'review',
        'A foreground/background pair could not be resolved to opaque sRGB literals, or has layering effects.',
        'Inspect computed colors and composited backgrounds in a rendered UI.',
        fg,
        context
          ? [
              ...context.resolve(fg.value, fg).provenance,
              ...context.resolve(bg.value, bg).provenance,
            ]
          : undefined,
      );
  }
  return findings.map(({ provenance, ...finding }) => ({
    ...findingSchema.parse(finding),
    ...(provenance?.length ? { provenance } : {}),
  }));
}
