import {
  loadLocalData,
  saveLocalData,
  getStorageName,
  getIDFromStorageName,
} from '../../localstorage.js';

import type { Encounter } from './types';
import { parseCompconPilot } from './domain/parsePilot';
import { parseCompconNpc, defaultNpcName } from './domain/parseNpc';
import {
  npcContentFromLegacyLcps,
  backfillNpcInlineContent,
  hasNpcContent,
  type LegacyNpcContent,
} from './domain/legacyLcp';
import { applyUpdatesToNpc, getStat } from './LancerNpcMode/npcUtils';
import { registerNpcInlineContent } from './lancerData';
import type { DomainPilot, DomainNpc } from './domain/schema';

export const MODEL_TAG = 'domain-v1';

export const PILOT_PREFIX = 'pilot';
export const ENCOUNTER_PREFIX = 'encounter';
export const STORAGE_ID_LENGTH = 6;
export const NPC_LIBRARY_NAME = 'lancer-npcs'
export const SELECTED_CHARACTER_KEY = "lancer-selected-character"
export const LANCER_SQUAD_MECH_KEY = 'lancer-squad-mech'

const LEGACY_LCP_PREFIX = 'lcp-';

function storageKeysWithPrefix(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  return keys;
}

function loadLegacyLcps(keys: string[]): any[] {
  return keys.map(key => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      console.error('Could not read legacy LCP; skipping', key, e);
      return null;
    }
  }).filter(lcp => lcp);
}

function backfillStoredNpcsFromLegacyLcps(content: LegacyNpcContent) {
  const library = loadNpcLibrary();
  const libraryChanged = Object.values(library)
    .map(npc => backfillNpcInlineContent(npc, content))
    .some(changed => changed);
  if (libraryChanged) saveNpcLibrary(library);

  storageKeysWithPrefix(`${ENCOUNTER_PREFIX}-`).forEach(key => {
    const encounter = loadEncounterData(getIDFromStorageName(ENCOUNTER_PREFIX, key, STORAGE_ID_LENGTH));
    if (!encounter) return;
    const encounterChanged = Object.values(encounter.allNpcs || {})
      .map(npc => backfillNpcInlineContent(npc, content))
      .some(changed => changed);
    if (encounterChanged) saveEncounterData(encounter);
  });
}

export function migrateLegacyLcpData() {
  const lcpKeys = storageKeysWithPrefix(LEGACY_LCP_PREFIX);
  if (lcpKeys.length === 0) return 0;

  const content = npcContentFromLegacyLcps(loadLegacyLcps(lcpKeys));
  if (hasNpcContent(content)) backfillStoredNpcsFromLegacyLcps(content);

  lcpKeys.forEach(key => localStorage.removeItem(key));
  return lcpKeys.length;
}

export function savePilotData(pilot: DomainPilot) {
  const tagged = { ...pilot, _model: MODEL_TAG };
  saveLocalData(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name, tagged);
}

export function loadPilotData(pilotID: string): DomainPilot | null {
  const raw: any = loadLocalData(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH));
  if (!raw) return null;
  if (raw._model === MODEL_TAG) return raw as DomainPilot;
  try {
    const domain = parseCompconPilot(raw);
    savePilotData(domain);
    return { ...domain, _model: MODEL_TAG } as DomainPilot;
  } catch (e) {
    console.error('Failed to migrate stored pilot to domain model; using raw as-is', e);
    return raw as DomainPilot;
  }
}

export function deletePilotData(pilotID: string, pilotName: string) {
  const storageName = getStorageName(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH), pilotName);
  localStorage.removeItem(storageName);
}


export function saveNpcLibrary(library: Record<string, any>) {
  const tagged: Record<string, any> = {};
  for (const id of Object.keys(library)) {
    tagged[id] = { ...library[id], _model: MODEL_TAG };
  }
  localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(tagged));
}

function fillMissingNpcName(npc: any): boolean {
  if (npc.name) return false;
  const className = npc.classData && npc.classData.name;
  npc.name = defaultNpcName({
    ...npc,
    class: { id: npc.class, data: className ? npc.classData : undefined },
    templates: (npc.templateData || []).map((data: any) => ({ id: data.id, data })),
  });
  return true;
}

function normalizeNpcCombatState(npc: any) {
  const current = npc.currentStats || {};
  Object.keys(current).forEach(key => {
    if (typeof current[key] === 'string' && current[key].trim() !== '' && !Number.isNaN(Number(current[key]))) {
      current[key] = Number(current[key]);
    }
  });
  if (typeof current.activations !== 'number') {
    current.activations = getStat('activations', npc);
  }
  npc.currentStats = current;
}

function migrateStoredNpcs(stored: Record<string, any>, describe: string) {
  const out: Record<string, any> = {};
  let migrated = false;
  for (const key of Object.keys(stored)) {
    const npc = stored[key];
    if (npc && npc._model === MODEL_TAG) {
      if (fillMissingNpcName(npc)) migrated = true;
      out[key] = npc;
      continue;
    }
    try {
      const hadItems = Array.isArray(npc && npc.items) && npc.items.length > 0;
      const domain: any = { ...parseCompconNpc(npc), _model: MODEL_TAG };
      if (!hadItems) {
        registerNpcInlineContent(domain);
        applyUpdatesToNpc({ repairAllWeaponsAndSystems: true }, domain);
      }
      normalizeNpcCombatState(domain);
      out[key] = domain;
      migrated = true;
    } catch (e) {
      console.error(`Failed to migrate stored ${describe} to domain model; using raw as-is`, key, e);
      out[key] = npc;
    }
  }
  return { npcs: out, migrated };
}

export function loadNpcLibrary(): Record<string, DomainNpc> {
  const stored = localStorage.getItem(NPC_LIBRARY_NAME);
  if (!stored) return {};
  const { npcs, migrated } = migrateStoredNpcs(JSON.parse(stored), 'NPC');
  if (migrated) saveNpcLibrary(npcs);
  return npcs;
}

export function saveEncounterData(encounter: Encounter) {
  saveLocalData(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name, encounter);
}

export function loadEncounterData(encounterID: string): Encounter | null {
  const encounter: Encounter | null = loadLocalData(ENCOUNTER_PREFIX, encounterID.slice(0,STORAGE_ID_LENGTH));
  if (!encounter) return null;
  const { npcs, migrated } = migrateStoredNpcs(encounter.allNpcs || {}, 'encounter NPC');
  if (migrated) {
    encounter.allNpcs = npcs;
    saveEncounterData(encounter);
  }
  return encounter;
}

export function deleteEncounterData(encounter: Encounter) {
  const storageName = getStorageName(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name);
  localStorage.removeItem(storageName);
}
