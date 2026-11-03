import type { Finding } from './audit-source.js';

export type TokenProvenance = {
  kind: 'definition' | 'provided' | 'fallback';
  token: string;
  file?: string;
  line?: number;
  column?: number;
  value?: string;
};
export type ProjectFinding = Finding & { provenance?: TokenProvenance[]; entries?: string[] };
export type ValueResolution = {
  value?: string;
  provenance: TokenProvenance[];
  reason?: string;
};
/** Internal value substitution; public callers use auditProject with source strings. */
export type AuditSourceContext = {
  tokens: Record<string, string>;
  resolve(value: string, at?: { line: number; column: number }): ValueResolution;
  tokenState(name: string): 'known' | 'missing' | 'unresolved';
  origins(name: string): TokenProvenance[];
};
