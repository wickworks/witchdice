import { deepCopy } from '../../../utils';
import { NpcSchema, type DomainNpc } from './schema';

function unwrapEnvelope(raw: any): any {
  if (raw && raw.data && !raw.class && raw.data.class) return raw.data;
  return raw;
}

const V2_STAT_KEYS = [
  'activations', 'armor', 'structure', 'stress', 'hp', 'evade', 'edef',
  'heatcap', 'speed', 'sensor', 'save', 'hull', 'agility', 'systems',
  'engineering', 'size',
];

const V2_TO_V3_STAT: Record<string, string> = {
  evade: 'evasion',
  sensor: 'sensorRange',
  save: 'saveTarget',
  agility: 'agi',
  systems: 'sys',
  engineering: 'eng',
};

function refId(ref: any): string {
  return (ref && typeof ref === 'object') ? ref.id : ref;
}

function refData(ref: any): any {
  return (ref && typeof ref === 'object') ? ref.data : undefined;
}

export function defaultNpcName(npc: any): string {
  const className = (refData(npc.class) && refData(npc.class).name) || 'NPC';
  const templateNames = (npc.templates || []).map((t: any) => refData(t) && refData(t).name).filter((n: any) => n);
  return [
    npc.tier ? `T${npc.tier}` : '',
    ...templateNames,
    className,
    npc.tag || '',
  ].filter(part => part).join(' ');
}

function labelTitles(labels: any): string[] {
  return (labels || [])
    .map((label: any) => (label && typeof label === 'object') ? label.title : label)
    .filter((label: any) => typeof label === 'string' && label !== '');
}

function statsFromV3(combatData: any) {
  const max = (combatData && combatData.stats && combatData.stats.max) || {};
  const stats: Record<string, any> = { bonuses: {}, overrides: {} };
  V2_STAT_KEYS.forEach(v2key => {
    const v3key = V2_TO_V3_STAT[v2key] || v2key;
    if (v3key in max) stats[v2key] = max[v3key];
  });
  return stats;
}

function tierArray(value: any): any {
  return Array.isArray(value) ? value : [value, value, value];
}

export function featureDataFromV3(data: any): any {
  if (!data) return undefined;
  const feature = { ...data };
  if (Array.isArray(feature.damage)) {
    feature.damage = feature.damage.map((entry: any) => {
      const { val, ...rest } = entry;
      return { ...rest, damage: 'damage' in entry ? entry.damage : tierArray(val) };
    });
  }
  if ('accuracy' in feature && feature.accuracy !== undefined) feature.accuracy = tierArray(feature.accuracy);
  if ('attack_bonus' in feature && feature.attack_bonus !== undefined) feature.attack_bonus = tierArray(feature.attack_bonus);
  return feature;
}

function itemsFromV3(features: any, tier: any) {
  return (features || []).map((f: any) => ({
    itemID: f.id,
    tier: tier,
    flavorName: (f.data && f.data.flavorName) || '',
    description: '',
    destroyed: !!(f.data && f.data.destroyed),
    charged: false,
    uses: 0,
    data: featureDataFromV3(f.data),
  }));
}

export function parseCompconNpc(raw: any): DomainNpc {
  const src = deepCopy(unwrapEnvelope(raw));

  if (!src || !src.id || !src.class) {
    throw new Error('Invalid NPC file: missing id or class');
  }

  const isV3 = 'combat_data' in src;

  if (!isV3) {
    src.class = refId(src.class);
    src.templates = (src.templates || []).map(refId);
    src.labels = labelTitles(src.labels);
    return NpcSchema.parse(src);
  }

  const { features, ...rest } = src;
  const npc = {
    ...rest,
    name: src.name || defaultNpcName(src),
    class: refId(src.class),
    classData: refData(src.class),
    templates: (src.templates || []).map(refId),
    templateData: (src.templates || []).map(refData).filter((data: any) => data),
    labels: labelTitles(src.narrative && src.narrative.labels),
    stats: statsFromV3(src.combat_data),
    items: itemsFromV3(features, src.tier),
  };

  return NpcSchema.parse(npc);
}
