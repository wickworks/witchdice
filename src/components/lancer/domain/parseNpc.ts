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

function tierText(value: any): string {
  return Array.isArray(value) ? `{${value.join('/')}}` : String(value);
}

const ACTIVATION_TAGS: Record<string, string> = {
  Quick: 'tg_quick_action',
  Full: 'tg_full_action',
  Protocol: 'tg_protocol',
};

function hasTagId(feature: any, tagID: string): boolean {
  return Array.isArray(feature.tags) && feature.tags.some((tag: any) => tag && tag.id === tagID);
}

function addTag(feature: any, tag: { id: string; val?: any }) {
  if (hasTagId(feature, tag.id)) return;
  feature.tags = [...(feature.tags || []), tag];
}

function mentions(text: string, word: string): boolean {
  return typeof word === 'string' && text.toLowerCase().includes(word.toLowerCase());
}

function damageText(damage: any, alreadyIn = ''): string {
  if (!Array.isArray(damage)) return '';
  return damage
    .filter((d: any) => d && !mentions(alreadyIn, d.type))
    .map((d: any) => `${tierText('val' in d ? d.val : d.damage)} ${d.type}`).join(' + ');
}

function rangeText(range: any, alreadyIn = ''): string {
  if (!Array.isArray(range)) return '';
  return range
    .filter((r: any) => r && !mentions(alreadyIn, r.type))
    .map((r: any) => `${r.type} ${tierText(r.val)}`).join(', ');
}

function actionText(action: any, withHeader: boolean): string {
  const detail = action.detail || '';
  const qualifiers = [action.activation, action.frequency].filter(q => q).join(', ');
  const header = withHeader ? `<strong>${action.name}</strong>${qualifiers ? ` (${qualifiers})` : ''}` : '';
  const trigger = action.trigger ? `<strong>Trigger:</strong> ${action.trigger}` : '';
  const numbers = [rangeText(action.range, detail), damageText(action.damage, detail)].filter(t => t).join(' · ');
  return [header, trigger, detail, numbers].filter(t => t).join('<br>');
}

function deployableText(deployable: any): string {
  const stats = [
    deployable.type,
    deployable.size !== undefined ? `Size ${deployable.size}` : '',
    deployable.hp !== undefined ? `HP ${tierText(deployable.hp)}` : '',
    deployable.armor !== undefined ? `Armor ${tierText(deployable.armor)}` : '',
    deployable.evasion !== undefined ? `Evasion ${tierText(deployable.evasion)}` : '',
    deployable.edef !== undefined ? `E-Def ${tierText(deployable.edef)}` : '',
    deployable.speed !== undefined ? `Speed ${tierText(deployable.speed)}` : '',
  ].filter(s => s).join(', ');
  const qualifiers = [deployable.activation, stats].filter(q => q).join(' · ');
  const header = `<strong>${deployable.name}</strong>${qualifiers ? ` (${qualifiers})` : ''}`;
  const numbers = [rangeText(deployable.range), damageText(deployable.damage)].filter(t => t).join(' · ');
  return [header, deployable.detail || '', numbers].filter(t => t).join('<br>');
}

function deriveEffectFromV3(feature: any) {
  if (typeof feature.effect === 'string' && feature.effect.trim() !== '') return;
  const actions = Array.isArray(feature.actions) ? feature.actions : [];
  const deployables = Array.isArray(feature.deployables) ? feature.deployables : [];
  if (actions.length === 0 && deployables.length === 0) return;

  if (actions.length === 1) {
    const [action] = actions;
    if (action.trigger && !feature.trigger) feature.trigger = action.trigger;
    if (action.activation in ACTIVATION_TAGS) addTag(feature, { id: ACTIVATION_TAGS[action.activation] });
    if (feature.type === 'Tech' && typeof action.activation === 'string' && action.activation.endsWith(' Tech')) {
      feature.tech_type = feature.tech_type || action.activation.replace(/ Tech$/, '');
    }
    const perRound = typeof action.frequency === 'string' && action.frequency.match(/^(\d+)\/round$/i);
    if (perRound) addTag(feature, { id: 'tg_round', val: parseInt(perRound[1]) });
    feature.effect = actionText({ ...action, trigger: undefined }, false);
    return;
  }

  feature.effect = [
    ...actions.map((action: any) => actionText(action, true)),
    ...deployables.map(deployableText),
  ].join('<br><br>');
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
  deriveEffectFromV3(feature);
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

  const alreadyDomain = Array.isArray(src.items) && !Array.isArray(src.features) && src.stats && typeof src.class === 'string';
  const isV3 = 'combat_data' in src && !alreadyDomain;

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
