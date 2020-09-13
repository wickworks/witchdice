import React, { useState } from 'react';
import AttackMod from './AttackMod.jsx';
import Roller from './Roller.jsx';

import './Attack.scss';

const initialAttackData =
  {dieCount: 1, dieType: 20, modifier: 0, timing: 'none', damageType: 'd20'};

const initialDamageData =
[
  {dieCount: 1, dieType: 8, modifier: 3, timing: 'all', damageType: 'fire'},
  {dieCount: 1, dieType: 6, modifier: 1, timing: 'first', damageType: 'necrotic'},
];

const initialRollData =
[
  {hit: true, rollOne: 18, rollTwo: 1, damageRollData: [['fire', 3],['slashing', 8],['piercing', 8],['psychic', 8]]},
  {hit: false, rollOne: 15, rollTwo: 8, damageRollData: [['necrotic', 22],['radiant', 4],['bludgeoning', 8],['thunder', 8]]},
  {hit: false, rollOne: 2, rollTwo: 18, damageRollData: [['poison', 1],['force', 1],['acid', 3],['cold', 8],['lightning', 8]]},
];

const Attack = () => {
  const [attackData, setAttackData] = useState(initialAttackData);
  const [damageData, setDamageData] = useState(initialDamageData);
  const [rollData, setRollData] = useState(initialRollData);

  const updateAttackData = (key, value) => {
    let newData = {...attackData}
    newData[key] = value
    setAttackData(newData);
  }

  const updateDamageData = (key, value, id) => {
    let newData = [...damageData]
    newData[id][key] = value
    setDamageData(newData);
  }

  const updateRollData = (key, value, id) => {
    let newData = [...rollData]
    newData[id][key] = value
    setRollData(newData);
  }

  const attackFunctions = {
    setDieCount: (dieCount, id) => updateAttackData('dieCount',parseInt(dieCount),id),
    setDieType: (dieType, id) => updateAttackData('dieType',parseInt(dieType),id),
    setModifier: (modifier, id) => updateAttackData('modifier',parseInt(modifier),id),
    setTiming: (timing, id) => updateAttackData('timing',timing,id),
    setDamageType: (damageType, id) => updateAttackData('damageType',damageType,id),
  }

  const damageFunctions = {
    setDieCount: (dieCount, id) => updateDamageData('dieCount',parseInt(dieCount),id),
    setDieType: (dieType, id) => updateDamageData('dieType',parseInt(dieType),id),
    setModifier: (modifier, id) => updateDamageData('modifier',parseInt(modifier),id),
    setTiming: (timing, id) => updateDamageData('timing',timing,id),
    setDamageType: (damageType, id) => updateDamageData('damageType',damageType,id),
  }

  const rollFunctions = {
    setHit: (hit, id) => updateRollData('hit',hit,id),
    setRollOne: (rollOne, id) => updateRollData('rollOne',parseInt(rollOne),id),
    setRollTwo: (rollTwo, id) => updateRollData('rollTwo',parseInt(rollTwo),id),
    setDamageData: (damageData, id) => updateRollData('damageData',damageData,id),
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
  }

  const generateNewRoll = () => {
    let data = []

    console.log('~~~~~ NEW ROLL ~~~~~');
    let d20 = attackData
    for (let rollID = 0; rollID < d20.dieCount; rollID++) {
      let roll = {hit: false}
      roll.rollOne = getRandomInt(d20.dieType) + d20.modifier
      roll.rollTwo = getRandomInt(d20.dieType) + d20.modifier

      let damageRollData = []
      for (let attackID = 0; attackID < damageData.length; attackID++) {
        const attack = damageData[attackID]

        for (let damageID = 0; damageID < attack.dieCount; damageID++) {
          let damage = [attack.damageType, getRandomInt(attack.dieType)]
          damageRollData.push(damage)
          console.log('     damage data: ', damage);
        }

        if (attack.modifier > 0) {
          let damage = [attack.damageType, attack.modifier]
          damageRollData.push(damage)
          console.log('     damage modifier: ', damage);
        }
      }
      roll.damageRollData = damageRollData
      console.log('  roll data: ', roll);
      data.push(roll)
    }

    console.log('=====', data);
    setRollData(data);
  }


  return (
    <>
      <div className="Attack">
        <h2>Attack Action</h2>

        <AttackMod {...attackData} {...attackFunctions} />

        <div className='attack-timing-labels'>
          <div>All</div>
          <div>First hit</div>
        </div>

        <AttackMod attackID={0} {...damageData[0]} {...damageFunctions} />
        <AttackMod attackID={1} {...damageData[1]} {...damageFunctions} />

        <p>Add Damage Roll</p>
      </div>

      <Roller rollData={rollData} handleNewRoll={generateNewRoll} rollFunctions={rollFunctions} />
    </>
  );
}
export default Attack ;
