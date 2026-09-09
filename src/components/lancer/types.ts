export interface MechSystem {
  id: string;
  destroyed?: boolean;
  uses?: number;
}

export interface Loadout {
  systems: MechSystem[];
  integratedSystems: MechSystem[];
  [key: string]: any;
}

export interface Mech {
  id: string;
  name: string;
  frame: string;
  loadouts: Loadout[];
  overshield: number;
  current_hp: number;
  current_heat: number;
  burn: number;
  current_overcharge: number;
  current_core_energy: number;
  current_repairs: number;
  current_structure: number;
  current_stress: number;
  conditions?: string[];
  cloud_portrait?: string;
  active?: boolean;
}

export interface PilotTalent {
  id: string;
  rank: number;
}

export interface PilotLicense {
  id: string;
  rank: number;
}

export interface Counter {
  id: string;
  name: string;
  val?: number;
}

export interface Pilot {
  id: string;
  name: string;
  callsign?: string;
  mechs: Mech[];
  mechSkills: [hull: number, agility: number, systems: number, engineering: number];
  talents: PilotTalent[];
  core_bonuses: string[];
  core_bonus_data?: { id: string; [key: string]: any }[];
  licenses: PilotLicense[];
  custom_counters?: Counter[];
  counter_data?: Counter[];
  state?: any;
  cloud_portrait?: string;
}

export interface Encounter {
  id: string;
  name: string;
  active: string[];
  reinforcements: string[];
  casualties: string[];
  allNpcs: Record<string, any>;
  roundCount: number;
}

export interface RobotState {
  overshield: number;
  hp: number;
  heat: number;
  burn: number;
  overcharge: number;
  coreEnergy: number;
  repairs: number;
  structure: number;
  stress: number;
  conditions?: string[];
  counters?: Counter[];
  hasIntactCustomPaintJob?: boolean;
}

export interface RobotStats {
  hull: number;
  hullAccuracy: number;
  engineering: number;
  engineeringAccuracy: number;
  agility: number;
  agilityAccuracy: number;
  systems: number;
  systemsAccuracy: number;
  maxHP: number;
  maxHeat: number;
  maxRepairCap: number;
  maxStructure: number;
  maxStress: number;
  size: number;
  armor: number;
  evasion: number;
  moveSpeed: number;
  eDef: number;
  saveTarget: number;
  sensorRange: number;
  techAttackBonus: number;
  limitedBonus: number;
  rangeSynergies: any[];
  attackBonus: number;
  attackBonusRanged: number;
}

export interface RobotInfo {
  name: string;
  id: string;
  cloud_portrait?: string;
  hasMultipleLoadouts: boolean;
  frameID: string;
  frameSourceIcon: string;
  frameSourceText: string;
  frameName: string;
}

export interface RobotLoadout {
  frameTraits: any[];
  systems: any[];
  pilotTraits: any[];
  mounts: any[];
  invades: any[];
}

export type UpdateMechState = (update: Record<string, any>) => void;
