import React, { useState } from 'react';
import { deepCopy, getRandomInt } from '../utils.js';
import { defaultDamageData, defaultAttackData, initialAllAttackData, initialCharacterName } from '../data.js';
import AttackSource from './AttackSource.jsx';
import Roller from './Roller.jsx';
import DiceBag from './DiceBag.jsx';
import './Attack.scss';

// whenever we make a change that breaks the old data, bump up the first number
const CURRENT_VERSION = '0.1';
console.log('Welcome to Roll-To-Hit version ', CURRENT_VERSION);

const loadedVersion = localStorage.getItem("version");
let brokeOldData = false;
if (loadedVersion) {
  const newMajorVersion = loadedVersion.slice(0,loadedVersion.indexOf("."))
  console.log('Loading browser-saved data from', loadedVersion, '— major version: ', newMajorVersion);

  if (newMajorVersion !== CURRENT_VERSION.slice(0,CURRENT_VERSION.indexOf("."))) {
    brokeOldData = true;
    console.log('Detected breaking change of saved data. Resetting to defaults.');
  }
}

let loadedAllAttackData, loadedCharacterName;
if (loadedVersion && !brokeOldData) {
  console.log('Restoring previous data...');
  loadedAllAttackData = JSON.parse(localStorage.getItem("attack-data"));
  loadedCharacterName = localStorage.getItem("character-name");
}

const Attack = () => {
  // should break this out into its own component
  const [characterName, setCharacterName] = useState(loadedCharacterName || 'Character');
  const [isEditingCharacterName, setIsEditingCharacterName] = useState(false);

  const [allAttackData, setAllAttackData] = useState(loadedAllAttackData || initialAllAttackData);
  const [rollData, setRollData] = useState([]);

  function saveAllAttackData(data) {
    // console.log('saved all attack data');
    localStorage.setItem("attack-data", JSON.stringify(data));
    localStorage.setItem("character-name", characterName);
    localStorage.setItem("version", CURRENT_VERSION);
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
    setIsSavingThrow: (value, attackID) => updateAllAttackData('isSavingThrow',value,attackID),
    setSavingThrowDC: (value, attackID) => updateAllAttackData('savingThrowDC',parseInt(value),attackID),
    setSavingThrowType: (value, attackID) => updateAllAttackData('savingThrowType',parseInt(value),attackID),
    setName: (value, attackID) => updateAllAttackData('name',value,attackID),
    setDesc: (value, attackID) => updateAllAttackData('desc',value,attackID),
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
        const defaultHit = attackData.isSavingThrow ? true : false;
        let roll = {
          attackID: attackID,
          hit: defaultHit,
          attackBonus: attackData.modifier,
        }

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

              // minimum 2s?
              if (
                (source.tags.includes('min2') && damageAmount <= 1)
              ) {
                rerolled = true;
                damageAmount = 2;
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

    setRollData([]);
  }

  const deleteAttack = (attackID) => {
    let newData = deepCopy(allAttackData);
    newData.splice(attackID, 1);
    setAllAttackData(newData);
    saveAllAttackData(newData);

    setRollData([]);
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
              onBlur={ () => {setIsEditingCharacterName(false)} }
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
              clearRollData={() => setRollData([])}
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

      <DiceBag />
    </>
  );
}


export default Attack ;
