import { seedSchema } from './schemas.js';

/** Mulberry32; unsigned arithmetic is specified by ECMAScript. */
export function createRandom(seed: number): () => number {
  let state = seedSchema.parse(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
export function deriveSeed(seed: number, key: string): number {
  let hash = seed >>> 0;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
}
export function weightedIndex(weights: number[], random: () => number): number {
  if (!weights.length || weights.some((w) => !Number.isFinite(w) || w < 0))
    throw new Error('Invalid sampling weights');
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) throw new Error('Sampling requires a positive weight');
  let threshold = random() * total;
  for (let i = 0; i < weights.length; i++) {
    threshold -= weights[i]!;
    if (threshold < 0) return i;
  }
  return weights.length - 1;
}
