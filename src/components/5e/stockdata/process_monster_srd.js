import allMonsterOriginalData from './srd_monsters.json';
// import allMonsterOriginalData from './srd_monsters_test.json';

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

import { deepCopy } from '../../../utils.js';

function getMonsterData() {
  console.log('~~~ PROCESSING MONSTER SRD ~~~');

  // const allMonsterOriginalData = JSON.parse(monsterJson);
  let allMonsterData = [];

  for ( var mi = 0; mi < allMonsterOriginalData.length; ++mi ) {
    const monsterOriginal = allMonsterOriginalData[mi];

    if ('name' in monsterOriginal) {

      let monsterNew = {};
      monsterNew.name = monsterOriginal.name;
      monsterNew.allAttackData = [];

      // console.log('~');
      // console.log('processing monster', monsterOriginal.name);

      if ('actions' in monsterOriginal) {
        let hasMultiattack = false;

        // ~~~~~~ for all actions ~~~~~~ \\
        for ( var ai = 0; ai < monsterOriginal.actions.length; ++ai ) {
          const attackOriginal = monsterOriginal.actions[ai];

          // MULTIATTACK sets the numbers of other attacks; have to post-process afterwards
          if (attackOriginal.name === 'Multiattack') { hasMultiattack = true }

          let attackData = deepCopy(defaultAttackData);
          attackData.name = attackOriginal.name;
          attackData.modifier = attackOriginal.attack_bonus;
          attackData.desc = attackOriginal.desc;

          // console.log('       processing attack ', attackData.name);

          const desc = attackOriginal.desc;
          const dcIndex = desc.indexOf('DC');
          const hitIndex = attackOriginal.desc.indexOf('Hit: ');

          // DAMAGE
          if ('damage_dice' in attackOriginal) {
            const damageTypes = getDamageTypesFromDesc(desc);
            const damageDice = attackOriginal.damage_dice.split(" + ")

            damageDice.forEach((damageDie, di) => {
              let damageData = deepCopy(defaultDamageData);

              const countAndType = getCountAndTypeFromDiceString(damageDie);
              damageData.dieCount = countAndType.count;
              damageData.dieType = countAndType.dietype;

              if (damageTypes[di]) { damageData.damageType = damageTypes[di] }
              if (('damage_bonus' in attackOriginal) && di === 0) { damageData.modifier = attackOriginal.damage_bonus }
              if (desc.indexOf('half as much') >= 0) { damageData.tags.push('savehalf') }

              attackData.damageData.push(damageData);
            });
          }

          // SAVING THROW DATA
          if (dcIndex > 0) {
            attackData.savingThrowDC = parseInt(
              desc.slice(dcIndex+3, dcIndex+5) //DCs are always one or two digits
            );

            const savingThrowType =
              abilityTypes.indexOf(
                desc.slice(dcIndex+5, desc.indexOf(' ', dcIndex+6))
                .trim()
                .slice(0,3)
              );

            attackData.savingThrowType = Math.max(savingThrowType, 0)
          }

          // VANILLA ATTACK
          if (dcIndex === -1 && hitIndex > 0) {
            // slice off the damage data
            attackData.desc = attackData.desc.slice(0, hitIndex);
            // slice off the attack bonus
            attackData.desc = attackData.desc.slice(desc.indexOf('to hit, ')+8);

          // ATTACK WITH SOME KIND OF SAVING THROW
          } else if (dcIndex > 0 && hitIndex > 0) {
            let extraDamageData = deepCopy(defaultDamageData);
            extraDamageData.tags.push('triggeredsave')

            // get additional damage from desc
            let extraDamageDie = getLastDamageFromDesc(desc);
            if (extraDamageDie) {
              const countAndType = getCountAndTypeFromDiceString(extraDamageDie);
              extraDamageData.dieCount = countAndType.count;
              extraDamageData.dieType = countAndType.dietype;
            } else {
              extraDamageData.dieCount = 1;
              extraDamageData.dieType = 0;
            }

            // get damage type from desc (I dunno, it's probably the last one)
            extraDamageData.damageType = 'necrotic';
            const damageTypes = getDamageTypesFromDesc(desc);
            if (damageTypes.length > 0) { extraDamageData.damageType = damageTypes[damageTypes.length-1] }
            if (desc.indexOf('half as much') >= 0) { extraDamageData.tags.push('savehalf') }

            // get conditions
            const appliedCondition = getConditionFromDesc(desc);
            if (appliedCondition) {
              extraDamageData.tags.push('condition')
              extraDamageData.condition = appliedCondition;
            }

            attackData.damageData.push(extraDamageData);

          // VANILLA SAVING THROW
          } else if (dcIndex > 0 && hitIndex === -1) {
            attackData.type = 'save';

            // if we didn't add any damage, check to see if there's a condition
            if (!('damage_dice' in attackOriginal)) {
              const appliedCondition = getConditionFromDesc(desc);
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
            }

          // SOME OTHER THING e.g. MULTIATTACK
          } else if (dcIndex === -1 && hitIndex === -1) {
            attackData.type = 'ability';
          }





          monsterNew.allAttackData.push(attackData);
        }
        // ~~~~~~ end all actions ~~~~~~ \\


        // process multiattack
        if (hasMultiattack) {
          const multiattackDesc = monsterNew.allAttackData[0].desc; // multiattack is always the first action

          monsterNew.allAttackData.forEach((attack) => {
            // look for the name of this attack in the multiattack description
            const nameIndex = multiattackDesc.indexOf(attack.name.toLowerCase());

            // look for the last preceding number-word
            const number = getLastNumberBeforeIndex(multiattackDesc, nameIndex);
            if (number > 0) { attack.dieCount = number; }
          });
        }
      }

      allMonsterData.push(monsterNew);
    }
  }

  // console.log(JSON.stringify(allMonsterData));

  return allMonsterData;
}

function getLastDamageFromDesc(desc) {
  // matches "1d6", "0d1"
  // const regex = new RegExp('\dd\d','g');

  const lastOpen = desc.lastIndexOf('(');
  const lastClose = desc.lastIndexOf(')');

  const firstOpen = desc.indexOf('(');
  if (firstOpen === lastOpen) { return null }

  if (lastClose - lastOpen > 5) {return null}

  const lastDamageDie = desc.slice(lastOpen+1, lastClose);
  return lastDamageDie;
}

// for multiattack
function getLastNumberBeforeIndex(multiattackDesc, nameIndex) {
  const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

  let currentBestIndex = -1;
  let currentBestNumber = null;

  numberWords.forEach((numberWord, i) => {

      // find each instance of each numberword
      const regex = new RegExp(` ${numberWord} `, "g");
      let result = [];
      while ( (result = regex.exec(multiattackDesc)) ) {

        // look for the MAXIMUM index that is still less than the given NAMEINDEX
        if ((result.index > currentBestIndex) && (result.index < nameIndex)) {
          currentBestIndex = result.index;
          currentBestNumber = numberWord;
        }
      }
  });

  // turn the numberword back into an int
  return numberWords.indexOf(currentBestNumber) + 1;
}

export {getMonsterData};
