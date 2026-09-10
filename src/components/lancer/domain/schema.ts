import { z } from 'zod';

const num = z.coerce.number();

const IdRankRef = z.looseObject({ id: z.string(), rank: num.optional() });

export const MechSystemSchema = z.looseObject({
  id: z.string(),
  destroyed: z.boolean().optional(),
  uses: num.optional(),
});

export const LoadoutSchema = z.looseObject({
  systems: z.array(MechSystemSchema).default([]),
  integratedSystems: z.array(MechSystemSchema).default([]),
});

export const MechSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  frame: z.string(),
  loadouts: z.array(LoadoutSchema).min(1),
  overshield: num,
  current_hp: num,
  current_heat: num,
  burn: num,
  current_overcharge: num,
  current_core_energy: num,
  current_repairs: num,
  current_structure: num,
  current_stress: num,
  conditions: z.array(z.string()).default([]),
  cloud_portrait: z.string().optional(),
  active: z.boolean().optional(),
});

export const PilotSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  callsign: z.string().optional(),
  mechs: z.array(MechSchema),
  mechSkills: z.array(num).default([]),
  talents: z.array(IdRankRef).default([]),
  core_bonuses: z.array(z.string()).default([]),
  core_bonus_data: z.array(z.looseObject({ id: z.string() })).default([]),
  licenses: z.array(IdRankRef).default([]),
  skills: z.array(IdRankRef).default([]),
  cloud_portrait: z.string().optional(),
  state: z.looseObject({
    per_round_uses: z.record(z.string(), z.any()).default({}),
  }).default({ per_round_uses: {} }),
  custom_counters: z.array(z.any()).optional(),
  counter_data: z.array(z.any()).optional(),
  shareCode: z.string().optional(),
  bondId: z.string().optional(),
  bondData: z.looseObject({ id: z.string() }).optional(),
  xp: num.optional(),
  stress: num.optional(),
  burdens: z.array(z.any()).optional(),
  bondPowers: z.array(z.any()).optional(),
  bondAnswers: z.array(z.any()).optional(),
  minorIdeal: z.string().optional(),
  clocks: z.array(z.any()).optional(),
});

export const NpcSchema = z.looseObject({
  id: z.string(),
  name: z.string().optional(),
  class: z.string(),
  tier: num.optional(),
  templates: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  stats: z.looseObject({}).catchall(z.any()),
  currentStats: z.looseObject({}).catchall(z.any()).optional(),
  items: z.array(z.looseObject({ itemID: z.string(), data: z.any().optional() })).default([]),
  classData: z.any().optional(),
  templateData: z.array(z.any()).default([]),
  overshield: num.optional(),
  burn: num.optional(),
  conditions: z.array(z.string()).default([]),
  custom_counters: z.array(z.any()).optional(),
  counter_data: z.array(z.any()).optional(),
  fingerprint: z.string().optional(),
  cloud_portrait: z.string().optional(),
});

export type DomainMechSystem = z.infer<typeof MechSystemSchema>;
export type DomainLoadout = z.infer<typeof LoadoutSchema>;
export type DomainMech = z.infer<typeof MechSchema>;
export type DomainPilot = z.infer<typeof PilotSchema>;
export type DomainNpc = z.infer<typeof NpcSchema>;
