// import allSpellOriginalData from './srd_spells.json';
// import allSpellOriginalData from './srd_spells_test.json';

import allSpellOriginalData from '../../../../node_modules/5e-database/src/5e-SRD-Spells.json';


import {
  abilityTypes,
  defaultAttackData,
  defaultDamageData,
} from '../data.js';

import {
  getDamageTypesFromDesc,
  getConditionFromDesc,
  getCountAndTypeFromDiceString,
} from './process_utils.js';

import { deepCopy, capitalize } from '../../../utils.js';

import TurndownService from 'turndown';

// console.log('allSpellOriginalData',allSpellOriginalData);


function getSpellData() {
  console.log('~~~ PROCESSING SPELL SRD ~~~');

  // const turndownService = new TurndownService()
  let allSpellData = {};

  for ( var i = 0; i < allSpellOriginalData.length; ++i ) {
    const spellOriginal = allSpellOriginalData[i];

    if ('name' in spellOriginal) {
      // console.log('~');
      // console.log('processing spell', spellOriginal.name);

      let attackData = deepCopy(defaultAttackData);
      attackData.name = spellOriginal.name;

      const spellDesc = spellOriginal.desc.join(' ');
      const spellHigherLevels = spellOriginal.higher_level ? spellOriginal.higher_level.join(' ') : '';
      const fullDesc = spellDesc + spellHigherLevels

      attackData.desc = spellDesc + spellHigherLevels// turndownService.turndown(fullDesc);
      attackData.modifier = 0;

      const attackIndex = spellDesc.indexOf('spell attack');
      const saveIndex = Math.max(
        spellDesc.indexOf('cceed on a'),
        spellDesc.indexOf('ust make a'),
        spellDesc.indexOf(' to make a')
      );

      // ATTACK
      if (attackIndex > 0) {
        attackData.type = 'attack';

      // SAVING THROW
      } else if (saveIndex > 0) {
        const saveString =
          spellDesc.slice(saveIndex+11, spellDesc.indexOf(' ', saveIndex+12))
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
      const takeIndex = Math.max(
        spellDesc.indexOf(' take'),
        spellDesc.indexOf(' deal'),
      );
      const damageIndex = spellDesc.indexOf(' damage');
      const bonusIndex = spellDesc.indexOf(' + ');
      if (takeIndex > 0 && damageIndex > 0) {
        let damageData = deepCopy(defaultDamageData);

        const dieString =
          spellDesc.slice(takeIndex+6, spellDesc.indexOf(' ', takeIndex+7))
          .trim();

        const countAndType = getCountAndTypeFromDiceString(dieString);
        damageData.dieCount = countAndType.count;
        damageData.dieType = countAndType.dietype;

        if (bonusIndex > 0) {
          damageData.modifier = parseInt(
            spellDesc.slice(bonusIndex+3, bonusIndex+5).trim()
          )
        }

        const damageTypes = getDamageTypesFromDesc(spellDesc);
        if (damageTypes[0]) { damageData.damageType = damageTypes[0] }

        if (spellDesc.indexOf('half as much') >= 0) { damageData.tags.push('savehalf') }

        if (damageData.dieCount && damageData.dieType) {
          attackData.damageData.push(damageData);
        }
        // console.log('      damage:', dieString, ': ',damageData.dieCount,'d',damageData.dieType);
        // console.log('       types:', damageTypes);
      }

      // CONDITION
      const appliedCondition = getConditionFromDesc(spellDesc);
      if (appliedCondition) {
        // make a 0-damage thing that applies a condition
        let savingThrowDamageData = deepCopy(defaultDamageData);
        savingThrowDamageData.tags.push('condition')
        savingThrowDamageData.condition = appliedCondition;
        savingThrowDamageData.dieType = 0;
        savingThrowDamageData.modifier = 0;
        savingThrowDamageData.damageType = 'psychic'; //just because
        attackData.damageData.push(savingThrowDamageData);
      }

      // MANUAL TWEAKS
      switch(spellOriginal.name) {
        case 'Magic Missile':
          attackData.type = 'ability';
          attackData.dieCount = 3;
          break;
        default: break;
      }

      allSpellData[spellOriginal.name] = attackData;
    }
  }

  // console.log(JSON.stringify(allSpellData));
  return allSpellData;
}

export { getSpellData };
