import allSpellOriginalData from './srd_spells.json';
// import allSpellOriginalData from './srd_spells_test.json';
import {
  allDamageTypes,
  allConditions,
  abilityTypes,
  defaultAttackData,
  defaultDamageData,
} from '../data.js';

import {
  getDamageTypesFromDesc,
  getCountAndTypeFromDiceString,
} from './process_utils.js';

import { deepCopy, capitalize } from '../../../utils.js';

import TurndownService from 'turndown';

function getSpellData() {
  const turndownService = new TurndownService()
  let allSpellData = {};

  for ( var i = 0; i < allSpellOriginalData.length; ++i ) {
    const spellOriginal = allSpellOriginalData[i];

    if ('name' in spellOriginal) {
      // console.log('~');
      // console.log('processing spell', spellOriginal.name);

      let attackData = deepCopy(defaultAttackData);
      attackData.name = spellOriginal.name;
      attackData.desc = turndownService.turndown(spellOriginal.desc);
      attackData.modifier = 0;

      const desc = spellOriginal.desc;

      const attackIndex = desc.indexOf('spell attack');
      const saveIndex = Math.max(
        desc.indexOf('cceed on a'),
        desc.indexOf('ust make a'),
        desc.indexOf(' to make a')
      );

      // ATTACK
      if (attackIndex > 0) {
        attackData.type = 'attack';

      // SAVING THROW
      } else if (saveIndex > 0) {
        const saveString =
          desc.slice(saveIndex+11, desc.indexOf(' ', saveIndex+12))
          .trim()
          .slice(0,3);

        const savingThrowType = abilityTypes.indexOf( capitalize(saveString) );

        attackData.type = 'save';
        attackData.savingThrowType = Math.max(savingThrowType, 0)
        // console.log('    saving throw type:', saveString, ': ',attackData.savingThrowType);

      // ABILITY
      } else {
        attackData.type = 'ability';
      }

      // DAMAGE
      const takeIndex = desc.indexOf(' take');
      const damageIndex = desc.indexOf(' damage');
      if (takeIndex > 0 && damageIndex > 0) {
        let damageData = deepCopy(defaultDamageData);

        const dieString =
          desc.slice(takeIndex+6, desc.indexOf(' ', takeIndex+7))
          .trim();

        const countAndType = getCountAndTypeFromDiceString(dieString);
        damageData.dieCount = countAndType.count;
        damageData.dieType = countAndType.dietype;

        const damageTypes = getDamageTypesFromDesc(desc);
        if (damageTypes[0]) { damageData.damageType = damageTypes[0] }

        if (desc.indexOf('half as much') >= 0) { damageData.tags.push('savehalf') }

        if (damageData.dieCount && damageData.dieType) {
          attackData.damageData.push(damageData);
        }

        // console.log('      damage:', dieString, ': ',damageData.dieCount,'d',damageData.dieType);
        // console.log('       types:', damageTypes);
      }


      allSpellData[spellOriginal.name] = attackData;
    }
  }

  return allSpellData;
}

export { getSpellData };
