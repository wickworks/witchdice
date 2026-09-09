import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

export type FixtureKind = 'v2-pilots' | 'v3-pilots' | 'v2-npcs' | 'v3-npcs';

export interface Fixture {
  name: string;
  json: any;
}

export function loadFixtures(kind: FixtureKind): Fixture[] {
  const dir = path.join(ROOT, kind);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => ({ name: f, json: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

export function loadFixture(kind: FixtureKind, name: string): any {
  return JSON.parse(fs.readFileSync(path.join(ROOT, kind, name), 'utf8'));
}

export const INLINE_LCP_PILOT = 'v3-pilot-inline-lcp-content.json';

export const v2Pilots = loadFixtures('v2-pilots');
export const v3Pilots = loadFixtures('v3-pilots');
export const v2Npcs = loadFixtures('v2-npcs');
export const v3Npcs = loadFixtures('v3-npcs');
