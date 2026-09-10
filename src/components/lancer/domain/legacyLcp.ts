import { deepCopy } from '../../../utils';

export interface LegacyNpcContent {
  classes: Record<string, any>;
  features: Record<string, any>;
  templates: Record<string, any>;
}

function hashById(list: any): Record<string, any> {
  if (!Array.isArray(list)) return {};
  return Object.fromEntries(list.filter(item => item && item.id).map(item => [item.id, item]));
}

export function npcContentFromLegacyLcps(lcps: any[]): LegacyNpcContent {
  const content: LegacyNpcContent = { classes: {}, features: {}, templates: {} };
  (lcps || []).forEach(lcp => {
    const data = (lcp && lcp.data) || {};
    Object.assign(content.classes, hashById(data.npcClasses || data.npc_classes));
    Object.assign(content.features, hashById(data.npcFeatures || data.npc_features));
    Object.assign(content.templates, hashById(data.npcTemplates || data.npc_templates));
  });
  return content;
}

export function hasNpcContent(content: LegacyNpcContent): boolean {
  return Object.keys(content.features).length > 0 || Object.keys(content.classes).length > 0;
}

export function backfillNpcInlineContent(npc: any, content: LegacyNpcContent): boolean {
  if (!npc) return false;
  let changed = false;

  (npc.items || []).forEach((item: any) => {
    if (item && !item.data && content.features[item.itemID]) {
      item.data = deepCopy(content.features[item.itemID]);
      changed = true;
    }
  });

  if (!npc.classData && content.classes[npc.class]) {
    npc.classData = deepCopy(content.classes[npc.class]);
    changed = true;
  }

  const templateData = Array.isArray(npc.templateData) ? npc.templateData : [];
  const known = new Set(templateData.map((t: any) => t && t.id));
  (npc.templates || []).forEach((templateID: string) => {
    if (!known.has(templateID) && content.templates[templateID]) {
      templateData.push(deepCopy(content.templates[templateID]));
      known.add(templateID);
      changed = true;
    }
  });
  if (changed) npc.templateData = templateData;

  return changed;
}
