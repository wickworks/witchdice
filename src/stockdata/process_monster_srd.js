// import allMonsterOriginalData from './srd_monsters.json';
import allMonsterOriginalData from './srd_monsters_test.json';
import {
  allDamageTypes,
  abilityTypes,
  defaultAttackData,
  defaultDamageData,
} from '../data.js';
import { deepCopy } from '../utils.js';

function getCountAndTypeFromDiceString(dice) {
  const count = dice.slice(0, dice.indexOf('d'));
  const dietype = dice.slice(dice.indexOf('d')+1);
  return {count: count, dietype: dietype}
}

function getDamageTypesFromDesc(desc) {
  let damageTypesWithIndex = [];

  allDamageTypes.forEach((type, i) => {
    const damageindex = desc.indexOf(type);
    if (damageindex >= 0) {
      damageTypesWithIndex.push([damageindex, type]);
    }
  });

  // earlier indices come first
  damageTypesWithIndex.sort((a, b) => (a[0] > b[0]) ? 1 : -1)

  // now reduce 'em down without the indices
  let damageTypesOrdered = [];
  damageTypesWithIndex.forEach((typeAndIndex, i) => {
    damageTypesOrdered.push(typeAndIndex[1])
  });

  console.log(' desc : ', desc);
  console.log('    damage types ordered : ', damageTypesOrdered);

  return damageTypesOrdered;
}


function getMonsterData() {
  // const allMonsterOriginalData = JSON.parse(monsterJson);
  let allMonsterData = [];

  for ( var mi = 0; mi < allMonsterOriginalData.length; ++mi ) {
    const monsterOriginal = allMonsterOriginalData[mi];

    if ('name' in monsterOriginal) {

      let monsterNew = {};
      monsterNew.name = monsterOriginal.name;
      monsterNew.allAttackData = [];

      console.log('processing monster', monsterOriginal.name);

      if ('actions' in monsterOriginal) {
        let hasMultiattack = false;

        for ( var ai = 0; ai < monsterOriginal.actions.length; ++ai ) {
          const attackOriginal = monsterOriginal.actions[ai];

          // MULTIATTACK sets the numbers of other attacks; have to post-process afterwards
          if (attackOriginal.name === 'Multiattack') { hasMultiattack = true }

          let attackData = deepCopy(defaultAttackData);
          attackData.name = attackOriginal.name;
          attackData.modifier = attackOriginal.attack_bonus;

          console.log('       processing attack ', attackData.name);

          const desc = attackOriginal.desc;
          const dcIndex = desc.indexOf('DC');
          const hitIndex = attackOriginal.desc.indexOf('Hit: ');

          // slice off the damage data description
          if (hitIndex > 0 && dcIndex === -1) {
            attackData.desc = attackOriginal.desc.slice(0, hitIndex);
          } else {
            attackData.desc = attackOriginal.desc;
          }

          // SAVING THROW
          if (dcIndex > 0) {
            attackData.isSavingThrow = true;

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

          // DAMAGE
          if ('damage_dice' in attackOriginal) {
            const damageTypes = getDamageTypesFromDesc(desc);
            const damageDice = attackOriginal.damage_dice.split(" + ")

            damageDice.forEach((damageDie, di) => {
              let damageData = deepCopy(defaultDamageData);

              const countAndType = getCountAndTypeFromDiceString(damageDie);
              damageData.dieCount = countAndType.count;
              damageData.dieType = countAndType.dietype;

              // the way the json is structured, I think the damage bonus only applies to the first one
              if (('damage_bonus' in attackOriginal) && di === 0) {
                damageData.modifier = attackOriginal.damage_bonus;
              }

              if (damageTypes[di]) {
                damageData.damageType = damageTypes[di];
              }

              if (desc.indexOf('half as much') >= 0) {
                damageData.tags.push('savehalf');
              }

              attackData.damageData = [damageData];
            });
          }

          monsterNew.allAttackData.push(attackData);
        }

        // process multiattack
        if (hasMultiattack) {

          console.log('processing MULTIATTACK');
          const multiattackDesc = monsterNew.allAttackData[0].desc; // multiattack is always the first action

          monsterNew.allAttackData.forEach((attack) => {
            // look for the name of this attack in the multiattack description
            const nameIndex = multiattackDesc.indexOf(attack.name.toLowerCase());

            // look for the last preceding number-word
            const number = getLastNumberBeforeIndex(multiattackDesc, nameIndex);
            if (number > 0) { attack.dieCount = number; console.log('      ',attack.name,':',number); }
          });
        }
      }

      allMonsterData.push(monsterNew);
    }
  }

  return allMonsterData;
}

function getLastNumberBeforeIndex(multiattackDesc, nameIndex) {
  const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

  let currentBestIndex = -1;
  let currentBestNumber = null;

  numberWords.forEach((numberWord, i) => {

      // find each instance of each numberword
      const regex = new RegExp(` ${numberWord} `, "g");
      let result, indices = [];
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
