import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc } from './parseNpc';
import {
  registerPilotInlineContent,
  registerNpcInlineContent,
  findSkillData,
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  getModdedWeaponData,
  findPilotGearData,
  findCoreBonusData,
} from '../lancerData';
import { loadFixture, INLINE_LCP_PILOT, v3Npcs } from './__fixtures__/fixtures';

describe('inline content registry resolves V3 self-contained content', () => {
  it('resolves LCP skills carried inline in the export (not just bundled content)', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', INLINE_LCP_PILOT));

    expect(findSkillData('igfa1_sk_jury_rig').name).toBe('UNKNOWN SKILL');

    registerPilotInlineContent(pilot);

    expect(findSkillData('igfa1_sk_jury_rig').name).not.toBe('UNKNOWN SKILL');
    expect(findSkillData('sk_push_boundaries').name).not.toBe('UNKNOWN SKILL');
  });

  it('resolves NPC class, templates, and features carried inline in a V3 NPC export', () => {
    const raw = v3Npcs[0].json;
    const npc = parseCompconNpc(raw);

    expect(findNpcClassData(npc.class).id).toBe('npcc_unknown');

    registerNpcInlineContent(npc);

    expect(findNpcClassData(npc.class).name).toBe(raw.class.data.name);
    npc.templates.forEach((templateID, i) =>
      expect(findNpcTemplateData(templateID).name).toBe(raw.templates[i].data.name));
    npc.items.forEach(item =>
      expect(findNpcFeatureData(item.itemID).id).toBe(item.itemID));
  });

  it('normalizes V3 tiered weapon values so tier selection works on inline NPC weapons', () => {
    v3Npcs.forEach(({ name, json }) => {
      const npc = parseCompconNpc(json);
      registerNpcInlineContent(npc);

      npc.items
        .filter(item => findNpcFeatureData(item.itemID).type === 'Weapon')
        .forEach(item => {
          const featureData = findNpcFeatureData(item.itemID);
          const weaponData = getModdedWeaponData({ id: item.itemID, npcTier: npc.tier });
          (weaponData.damage || []).forEach((damage: any) => {
            expect(typeof damage.val, `${name} ${item.itemID} damage`).toBe('number');
          });
          if ('accuracy' in featureData) {
            expect(Array.isArray(featureData.accuracy), `${name} ${item.itemID} accuracy`).toBe(true);
          }
          expect(Array.isArray(featureData.attack_bonus), `${name} ${item.itemID} attack_bonus`).toBe(true);
        });
    });
  });
  it('resolves homebrew pilot gear carried inline in the export', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', 'v3-pilot-04-moth-hour.json'));

    expect(findPilotGearData('pg_player_two_neural_bypass').name).toBe(blankPilotGearName());

    registerPilotInlineContent(pilot);

    expect(findPilotGearData('pg_player_two_neural_bypass').name).toBe('Player_Two Neural Bypass');
  });

  it('keeps V3 inline core bonus data and resolves it through the registry', () => {
    const raw = loadFixture('v3-pilots', 'v3-pilot-04-moth-hour.json');
    raw.data.core_bonuses[0].id = 'cb_homebrew_test_bonus';
    const pilot = parseCompconPilot(raw);

    expect(pilot.core_bonuses).toContain('cb_homebrew_test_bonus');
    expect(findCoreBonusData('cb_homebrew_test_bonus').id).not.toBe('cb_homebrew_test_bonus');

    registerPilotInlineContent(pilot);

    expect(findCoreBonusData('cb_homebrew_test_bonus').id).toBe('cb_homebrew_test_bonus');
  });
});

function blankPilotGearName() {
  return findPilotGearData('pg_definitely_not_a_real_gear_id').name;
}
