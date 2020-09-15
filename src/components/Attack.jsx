import React, { useState } from 'react';
import { deepCopy, getRandomInt } from '../utils.js';
import AttackSource from './AttackSource.jsx';
import Roller from './Roller.jsx';
import './Attack.scss';


// TODO:
// - reroll ones and twos
// - maximized attacks
// - crit on 18-19-20

console.log('copy func', typeof(deepCopy));

const defaultDamageData = {
  dieCount: 1,
  dieType: 6,
  modifier: 0,
  damageType: 'slashing',
  name: '',
  tags: [],
  enabled: true
};

const defaultAttackData = {
  dieCount: 1,
  modifier: 2,
  name: 'Longsword',
  damageData: [deepCopy(defaultDamageData)]
};

const initialAllAttackData = [deepCopy(defaultAttackData) ];

const initialRollData = [];
// [
//   {
//     attackID: 0,
//     hit: true,
//     rollOne: 18,
//     rollTwo: 1,
//     damageRollData: [[TYPE, AMOUNT, DAMAGE_ID], ['fire', 6, 1]]
//   }, {
//     ...
//   }
// ]

const Attack = () => {
  const [allAttackData, setAllAttackData] = useState(initialAllAttackData);
  const [rollData, setRollData] = useState(initialRollData);


  // =============== UPDATE DATA ===================

  const updateAllAttackData = (key, value, attackID) => {
    console.log('');
    console.log('Current attack data:', JSON.stringify(allAttackData));
    console.log('');
    console.log('updating attack data id', attackID, '   key ', key)
    console.log('  with value ', JSON.stringify(value));
    console.log('old data : ', JSON.stringify(allAttackData[attackID][key]));

    let newData = deepCopy(allAttackData)
    newData[attackID][key] = value
    setAllAttackData(newData);
    console.log('');

  }

  const updateRollData = (key, value, rollID) => {
    let newData = deepCopy(rollData)
    newData[rollID][key] = value
    setRollData(newData);
  }

  const attackFunctions = {
    setDieCount: (value, attackID) => updateAllAttackData('dieCount',parseInt(value),attackID),
    setModifier: (value, attackID) => updateAllAttackData('modifier',parseInt(value),attackID),
    setName: (value, attackID) => updateAllAttackData('name',value,attackID),
    setDamageData: (value, attackID) => updateAllAttackData('damageData',value,attackID)
  }


  const rollFunctions = {
    setHit: (value, id) => updateRollData('hit',value,id),
    setRollOne: (value, id) => updateRollData('rollOne',parseInt(value),id),
    setRollTwo: (value, id) => updateRollData('rollTwo',parseInt(value),id),
    setDamageData: (value, id) => updateRollData('damageData',value,id),
  }

  // =============== ROLLER FUNCTIONS ==================



  const generateNewRoll = () => {
    let data = []

    // console.log('~~~~~ NEW ROLL ~~~~~');

    // EACH ATTACK
    for (let attackID = 0; attackID < allAttackData.length; attackID++) {
      let roll = {attackID: attackID, hit: false}

      // EACH TO-HIT D20
      let attack = allAttackData[attackID]
      for (let rollID = 0; rollID < attack.dieCount; rollID++) {
        roll.rollOne = getRandomInt(20) + attack.modifier
        roll.rollTwo = getRandomInt(20) + attack.modifier

        // EACH DAMAGE SOURCE
        const damageData = allAttackData[attackID].damageData
        let damageRollData = []
        for (let damageSourceID = 0; damageSourceID < damageData.length; damageSourceID++) {
          const source = damageData[damageSourceID]

          // EACH DIE IN THAT SOURCE
          for (let damageDieID = 0; damageDieID < source.dieCount; damageDieID++) {
            let damage = [
              source.damageType,
              getRandomInt(source.dieType),
              damageSourceID
            ]
            if (damage[1] > 0) { damageRollData.push(damage) }
          }

          // PLUS MODIFIER
          if (source.modifier > 0) {
            let damage = [
              source.damageType,
              source.modifier,
              damageSourceID
            ]
            damageRollData.push(damage)
          }
        }
        roll.damageRollData = damageRollData
        data.push(roll)
        // console.log('  roll data: ', roll);
      }

      console.log('ROLLDATA', JSON.stringify(data));
      setRollData(data);
    }
  }

  // =============== CREATE / EDIT / DELETE ATTACKS ==================


  const createAttack = () => {
    let newData = deepCopy(allAttackData);
    let newAttack = deepCopy(defaultAttackData);
    newData.push(newAttack);
    setAllAttackData(newData);
  }

  const deleteAttack = (attackID) => {
    let newData = deepCopy(allAttackData);
    newData.splice(attackID, 1);
    setAllAttackData(newData);
  }

  return (
    <>
      <div className="Attack">

        {console.log("ATTACKDATA ", JSON.stringify(allAttackData))}

        <h2 className="character-name">Sneak-thief</h2>

        { allAttackData.map((data, i) => {
          return (
            <AttackSource
              attackID={i}
              attackData={allAttackData[i]}
              attackFunctions={attackFunctions}
              key={i}
            />
          )
        })}

        <div className='add-attack' onClick={createAttack}>
          <div className={`asset plus`} />
          Add Attack
        </div>
      </div>

      <Roller
        rollData={rollData}
        attackSourceData={allAttackData}
        handleNewRoll={generateNewRoll}
        rollFunctions={rollFunctions}
      />
    </>
  );
}


export default Attack ;
