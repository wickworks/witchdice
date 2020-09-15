import React, { useState } from 'react';
import AttackSource from './AttackSource.jsx';
import Roller from './Roller.jsx';
import './Attack.scss';


// TODO:
// - reroll ones and twos
// - maximized attacks
// - crit on 18-19-20

const defaultDamageData =
  {dieCount: 1, dieType: 6, modifier: 0, damageType: 'slashing', name: '', tags: [], enabled: true};

const initialAttackData =
[
  {dieCount: 1, modifier: 2, name: 'Longsword', damageData: [{...defaultDamageData}, {...defaultDamageData}]}
];

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
  const [attackData, setAttackData] = useState(initialAttackData);
  const [rollData, setRollData] = useState(initialRollData);


  // =============== UPDATE DATA ===================

  const updateAttackData = (key, value, attackID) => {
    let newData = {...attackData}
    newData[attackID][key] = value
    setAttackData(newData);
  }

  const updateRollData = (key, value, rollID) => {
    let newData = [...rollData]
    newData[rollID][key] = value
    setRollData(newData);
  }

  const attackFunctions = {
    setDieCount: (value, attackID) => updateAttackData('dieCount',parseInt(value),attackID),
    setModifier: (value, attackID) => updateAttackData('modifier',parseInt(value),attackID),
    setName: (value, attackID) => updateAttackData('name',value,attackID),
    setDamageData: (value, attackID) => updateAttackData('damageData',value,attackID)
  }


  const rollFunctions = {
    setHit: (value, id) => updateRollData('hit',value,id),
    setRollOne: (value, id) => updateRollData('rollOne',parseInt(value),id),
    setRollTwo: (value, id) => updateRollData('rollTwo',parseInt(value),id),
    setDamageData: (value, id) => updateRollData('damageData',value,id),
  }

  // =============== ROLLER FUNCTIONS ==================

  function getRandomInt(max) {
    if (max === 0) {return 0}
    return Math.floor(Math.random() * Math.floor(max)) + 1;
  }

  const generateNewRoll = () => {
    let data = []

    // console.log('~~~~~ NEW ROLL ~~~~~');

    // EACH ATTACK
    for (let attackID = 0; attackID < attackData.length; attackID++) {

      // EACH TO-HIT D20
      let d20 = attackData[attackID]
      for (let rollID = 0; rollID < d20.dieCount; rollID++) {
        let roll = {attackID: attackID, hit: false}
        roll.rollOne = getRandomInt(d20.dieType) + d20.modifier
        roll.rollTwo = getRandomInt(d20.dieType) + d20.modifier

        // EACH DAMAGE SOURCE
        const damageData = attackData[attackID].damageData
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

      console.log('=====', data);
      setRollData(data);
    }
  }


  return (
    <>
      <div className="Attack">

        { attackData.map((data, i) => {
          return (
            <AttackSource
              attackID={i}
              {...attackData[i]}
              {...attackFunctions}
              key={i}
            />
          )
        })}

        <div className='add-attack'>
          Add Attack
        </div>


      </div>


    </>
  );
}

// <Roller
//   rollData={rollData}
//   attackSourceData={attackData}
//   handleNewRoll={generateNewRoll}
//   rollFunctions={rollFunctions}
// />


export default Attack ;
