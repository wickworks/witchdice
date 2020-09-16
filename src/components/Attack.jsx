import React, { useState } from 'react';
import { deepCopy, getRandomInt } from '../utils.js';
import AttackSource from './AttackSource.jsx';
import Roller from './Roller.jsx';
import './Attack.scss';


// TODO:
// - reroll ones and twos
// - maximized attacks
// - crit on 18-19-20

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
  modifier: 0,
  name: 'Longsword',
  damageData: [deepCopy(defaultDamageData)]
};

const initialAllAttackData = [deepCopy(defaultAttackData) ];

const initialRollData = [];
// [
//   {
//     attackID: 0,
//     hit: true,
//     critOne: false;
//     critTwo: false;
//     rollOne: 18,
//     rollTwo: 1,
//     damageRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//     critRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//   }, {
//     ...
//   }
// ]

const Attack = () => {
  // should break this out into its own component
  const [characterName, setCharacterName] = useState('Character');
  const [isEditingCharacterName, setIsEditingCharacterName] = useState(false);

  const [loadedLocalData, setLoadedLocalData] = useState(false);
  const [allAttackData, setAllAttackData] = useState(initialAllAttackData);
  const [rollData, setRollData] = useState(initialRollData);

  if (!loadedLocalData) {
    const loadedAllAttackDataJson = localStorage.getItem("attack-data");
    const loadedAllAttackData = JSON.parse(loadedAllAttackDataJson);
    if (loadedAllAttackData) {
      deepCopy(setAllAttackData(loadedAllAttackData))
      setCharacterName(localStorage.getItem("character-name") || 'Character')
    }
    setLoadedLocalData(true)
  }

  function saveAllAttackData(data) {
    console.log('saved all attack data');
    localStorage.setItem("attack-data", JSON.stringify(data));
    localStorage.setItem("character-name", characterName);
  }


  // =============== UPDATE DATA ===================

  const updateAllAttackData = (key, value, attackID) => {
    // console.log('');
    // console.log('Current attack data:', JSON.stringify(allAttackData));
    // console.log('');
    // console.log('updating attack data id', attackID, '   key ', key)
    // console.log('  with value ', JSON.stringify(value));
    // console.log('old data : ', JSON.stringify(allAttackData[attackID][key]));

    let newData = deepCopy(allAttackData)
    newData[attackID][key] = value
    setAllAttackData(newData);

    saveAllAttackData(newData);
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
    setDamageData: (value, attackID) => updateAllAttackData('damageData',value,attackID),
  }

  const rollFunctions = {
    setHit: (value, id) => updateRollData('hit',value,id),
    setRollOne: (value, id) => updateRollData('rollOne',parseInt(value),id),
    setRollTwo: (value, id) => updateRollData('rollTwo',parseInt(value),id),
    setDamageRollData: (value, id) => updateRollData('damageRollData',value,id),
    setCritRollData: (value, id) => updateRollData('critRollData',value,id),
    setRollData: (newData) => setRollData(deepCopy(newData))
  }

  // =============== ROLLER FUNCTIONS ==================

  const generateNewRoll = () => {
    let data = []

    console.log('');
    console.log('~~~~~ NEW ROLL ~~~~~');

    // EACH ATTACK
    for (let attackID = 0; attackID < allAttackData.length; attackID++) {

      // EACH TO-HIT D20
      let attackData = allAttackData[attackID]
      for (let rollID = 0; rollID < attackData.dieCount; rollID++) {
        let roll = {attackID: attackID, hit: false, critOne: false, critTwo: false}

        // roll some d20s
        roll.rollOne = getRandomInt(20)
        roll.rollTwo = getRandomInt(20)

        // did we crit? (any of the damage sources have expanded crit ranges)
        let critRange = 20;
        for (let damageSourceID = 0; damageSourceID < attackData.damageData.length; damageSourceID++) {
          const source = attackData.damageData[damageSourceID]
          if (source.tags.includes('expandedcrit1')) {critRange = 19}
          if (source.tags.includes('expandedcrit2')) {critRange = 18}
        }

        if (roll.rollOne >= critRange) { roll.critOne = true }
        if (roll.rollTwo >= critRange) { roll.critTwo = true }

        // add the attack modifier
        roll.rollOne += attackData.modifier;
        roll.rollTwo += attackData.modifier;

        // EACH DAMAGE SOURCE
        const damageData = attackData.damageData
        let damageRollData = []
        let critRollData = []
        for (let damageSourceID = 0; damageSourceID < damageData.length; damageSourceID++) {
          const source = damageData[damageSourceID]

          // get both CRIT and REGULAR dice
          const dicePools = [damageRollData,critRollData]
          dicePools.forEach((dicePool) => {

            // EACH DIE IN THAT SOURCE
            for (let damageDieID = 0; damageDieID < source.dieCount; damageDieID++) {
              let damageAmount = getRandomInt(source.dieType)
              let rerolled = false;

              // maximized?
              if (source.tags.includes('maximized')) { damageAmount = source.dieType }

              // reroll damage?
              if (
                (source.tags.includes('reroll1') && damageAmount <= 1) ||
                (source.tags.includes('reroll2') && damageAmount <= 2)
              ) {
                rerolled = true;
                damageAmount = getRandomInt(source.dieType);
              }

              let damage = [
                source.damageType,
                damageAmount,
                rerolled,
                damageSourceID
              ]

              if (damageAmount > 0) { dicePool.push(damage) }
            }
          })

          // PLUS MODIFIER
          if (source.modifier > 0) {
            let damage = [
              source.damageType,
              source.modifier,
              false,
              damageSourceID
            ]
            damageRollData.push(damage)
          }
        }
        roll.damageRollData = damageRollData
        roll.critRollData = critRollData
        data.push(roll)
        // console.log('  roll data: ', roll);
      }

      console.log('New Roll Data for ', attackData.name, JSON.stringify(data));
      setRollData(data);
    }
  }

  // =============== CREATE / EDIT / DELETE ATTACKS ==================


  const createAttack = () => {
    let newData = deepCopy(allAttackData);
    let newAttack = deepCopy(defaultAttackData);
    newData.push(newAttack);
    setAllAttackData(newData);
    saveAllAttackData(newData);
  }

  const deleteAttack = (attackID) => {
    let newData = deepCopy(allAttackData);
    newData.splice(attackID, 1);
    setAllAttackData(newData);
    saveAllAttackData(newData);
  }

  // console.log('');
  // console.log("Attack Data: ", JSON.stringify(allAttackData));
  // console.log("Roll Data: ", JSON.stringify(rollData));


  return (
    <>
      <div className="Attack">
        <h2 className="character-name">
          {isEditingCharacterName ?
            <input
              type="text"
              value={characterName}
              onKeyPress={ (e) => { if (e.key === 'Enter') {setIsEditingCharacterName(false)} }}
              onChange={ e => setCharacterName(e.target.value) }
              placeholder={'Character name'}
              focus={'true'}
            />
          :
            <div className='display' onClick={() => setIsEditingCharacterName(true)}>
              {characterName}
            </div>
          }
        </h2>

        { allAttackData.map((data, i) => {
          return (
            <AttackSource
              attackID={i}
              attackData={allAttackData[i]}
              attackFunctions={attackFunctions}
              deleteAttack={(attackID) => deleteAttack(attackID)}
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
