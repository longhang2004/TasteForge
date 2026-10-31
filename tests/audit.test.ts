import { describe, expect, it } from 'vitest';
import { auditSource, contrast } from '../packages/core/src/index.js';

describe('source-based audit evidence', () => {
  it('computes the standard sRGB contrast ratio', () => {
    expect(contrast('#ffffff', '#000000')).toBe(21);
    expect(contrast('#123456', '#123456')).toBe(1);
    expect(() => contrast('red', '#ffffff')).toThrow();
  });
  it('reports declared contrast pairs with precise locations and limitations', () => {
    const findings = auditSource('view.css', '\n.notice { color: #aaa; background-color: #fff; }');
    const issue = findings.find((f) => f.ruleId === 'contrast-pair')!;
    expect(issue.category).toBe('verified');
    expect(issue.line).toBe(2);
    expect(issue.explanation).toContain('2.32:1');
    expect(issue.explanation).toContain('Cascade');
    expect(auditSource('ok.css', '.text { color: black; background: white; }')).toEqual([]);
  });
  it('resolves literal custom-property references and nested fallbacks', () => {
    const css =
      ':root { --fg: #aaa; --bg: #fff; } .text { color: var(--fg); background: var(--missing, var(--bg)); }';
    expect(auditSource('vars.css', css).some((f) => f.ruleId === 'contrast-pair')).toBe(true);
    expect(
      auditSource(
        'cycle.css',
        ':root { --a: var(--a); } .x { color: var(--a); background: white; }',
      ).some((f) => f.ruleId === 'contrast-review'),
    ).toBe(true);
  });
  it('does not claim resolved contrast for alpha, images, or dynamic expressions', () => {
    for (const source of [
      '.x { color: rgb(1 1 1 / .5); background: white; }',
      '.x { color: #aaa; background-color: white; background-image: url(x.png); }',
    ]) {
      const f = auditSource('x.css', source);
      expect(f.some((f) => f.ruleId === 'contrast-pair')).toBe(false);
      expect(f.some((f) => f.category === 'review')).toBe(true);
    }
    expect(
      auditSource('x.tsx', 'const x = <div style={{ ...theme, color: dynamic }} />').some(
        (f) => f.ruleId === 'dynamic-style-review',
      ),
    ).toBe(true);
  });
  it('compares hardcoded values to role-specific tokens and allows documented exceptions', () => {
    const tokens = {
      '--tf-color-foreground': '#171717',
      '--tf-space-1': '0.25rem',
      '--tf-radius-1': '0.125rem',
    };
    const f = auditSource(
      'x.css',
      '.x { color: #171717; padding: 4px; margin: 13px; border-radius: 3px; }',
      { tokens },
    );
    expect(f.filter((f) => f.ruleId === 'hardcoded-token')).toHaveLength(2);
    expect(f.filter((f) => f.ruleId === 'off-scale-value')).toHaveLength(2);
    expect(f.every((f) => f.category === 'heuristic')).toBe(true);
    expect(auditSource('x.css', '.x { padding: var(--tf-space-1); }', { tokens })).toEqual([]);
  });
  it('finds malformed and unavailable tokens while recognizing local definitions', () => {
    expect(
      auditSource('reserved.css', '.x { color: var(toString); background: white; }').some(
        (f) => f.ruleId === 'malformed-token',
      ),
    ).toBe(true);
    const f = auditSource(
      'x.css',
      ':root { --tf-space-1: nope; } .x { color: var(tf-color-accent); padding: var(--tf-space-missing, 4px); }',
    );
    expect(f.some((f) => f.ruleId === 'malformed-token' && f.category === 'verified')).toBe(true);
    expect(f.some((f) => f.ruleId === 'unknown-token')).toBe(true);
    expect(
      auditSource(
        'x.css',
        ':root { --tf-color-accent: #123456; } .x { color: var(--tf-color-accent); }',
      ),
    ).toEqual([]);
  });
  it('does not flag a single gradient or quoted text mentioning one', () => {
    expect(
      auditSource(
        'x.css',
        '.x { background: linear-gradient(red, blue); content: "linear-gradient(red, blue)"; }',
      ),
    ).toEqual([]);
    const f = auditSource(
      'x.css',
      '.a { background: linear-gradient(red, blue); } .b { background: radial-gradient(red, blue); } .c { background: conic-gradient(red, blue); }',
    );
    expect(f.find((f) => f.ruleId === 'repeated-gradients')?.category).toBe('heuristic');
  });
  it('finds missing generic fallbacks and typography variation', () => {
    expect(auditSource('inherit.css', '.control { font-family: inherit; }')).toEqual([]);
    const css =
      '.a { font-family: "Inter"; } .b { font-family: serif; } .c { font-family: monospace; } .d { font-family: Arial, sans-serif; }';
    expect(auditSource('x.css', css).map((f) => f.ruleId)).toEqual([
      'font-fallback',
      'typography-drift',
    ]);
    expect(auditSource('x.css', '.a { font-family: "sans-serif"; }')[0]!.ruleId).toBe(
      'font-fallback',
    );
  });
  it('parses JSX and TSX inline literals and nested card ancestry without executing code', () => {
    const source =
      'export const X = () => <Card><div className="card"><section className="card"><p style={{color: "#aaa", backgroundColor: "#fff", fontFamily: "Inter"}}>Hi</p></section></div></Card>;';
    for (const ext of ['jsx', 'tsx']) {
      const findings = auditSource(`x.${ext}`, source);
      expect(findings.map((f) => f.ruleId)).toEqual(
        expect.arrayContaining(['nested-cards', 'contrast-pair', 'font-fallback']),
      );
      expect(findings.every((f) => f.line === 1)).toBe(true);
    }
    expect(
      auditSource('x.tsx', 'const x = <><Card /><Card /><Card /></>').some(
        (f) => f.ruleId === 'nested-cards',
      ),
    ).toBe(false);
  });
  it('reports malformed source and rejects unsupported input', () => {
    expect(auditSource('x.css', '.x { color: red;')[0]!.ruleId).toBe('parse-error');
    expect(auditSource('x.tsx', 'const x = <div style={{color: }} />')[0]!.ruleId).toBe(
      'parse-error',
    );
    expect(() => auditSource('x.py', 'print(1)')).toThrow(/Unsupported/);
  });
});
