import React, { useState, useEffect } from 'react';
import DamageSource from './DamageSource.jsx';
import AddDamage from './AddDamage.jsx';
import Roller from './Roller.jsx';

import './Attack.scss';


// TODO:
// - reroll ones and twos
// - maximized attacks
// - crit on 18-19-20

const initialAttackData =
  {dieCount: 1, dieType: 20, modifier: 0, timing: 'none', damageType: 'd20', enabled: true, name: 'Attack roll'};

const defaultDamageData =
  {dieCount: 1, dieType: 6, modifier: 0, timing: 'all', damageType: 'slashing', enabled: true, name: ''};

const initialDamageData =
[
  {dieCount: 1, dieType: 8, modifier: 3, timing: 'all', damageType: 'slashing', enabled: true, name: 'Longsword...'},
  {dieCount: 1, dieType: 6, modifier: 0, timing: 'first', damageType: 'necrotic', enabled: true, name: '...of DEATH'},
];

const initialRollData = [];
// {
//   hit: true,
//   rollOne: 18,
//   rollTwo: 1,
//   damageRollData: [[TYPE, AMOUNT, SOURCE_ID], ['fire', 6, 1]]
// }

const Attack = () => {
  const [attackData, setAttackData] = useState(initialAttackData);
  const [damageData, setDamageData] = useState(initialDamageData);
  const [rollData, setRollData] = useState(initialRollData);

  const [addDamageIsOpen, setAddDamageIsOpen] = useState(false);
  const [editingDamageID, setEditingDamageID] = useState(null);


  // =============== UPDATE DATA ===================

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
    setEnabled: (enabled, id) => updateDamageData('enabled',enabled,id),
    setName: (name, id) => updateDamageData('name',name,id),
  }

  const rollFunctions = {
    setHit: (hit, id) => updateRollData('hit',hit,id),
    setRollOne: (rollOne, id) => updateRollData('rollOne',parseInt(rollOne),id),
    setRollTwo: (rollTwo, id) => updateRollData('rollTwo',parseInt(rollTwo),id),
    setDamageData: (damageData, id) => updateRollData('damageData',damageData,id),
  }

  // =============== ROLLER FUNCTIONS ==================

  function getRandomInt(max) {
    if (max === 0) {return 0}
    return Math.floor(Math.random() * Math.floor(max)) + 1;
  }

  const generateNewRoll = () => {
    let data = []

    // console.log('~~~~~ NEW ROLL ~~~~~');

    // EACH TO-HIT D20
    let d20 = attackData
    for (let rollID = 0; rollID < d20.dieCount; rollID++) {
      let roll = {hit: false}
      roll.rollOne = getRandomInt(d20.dieType) + d20.modifier
      roll.rollTwo = getRandomInt(d20.dieType) + d20.modifier

      // EACH DAMAGE SOURCE
      let damageRollData = []
      for (let sourceID = 0; sourceID < damageData.length; sourceID++) {
        const source = damageData[sourceID]

        // EACH DIE IN THAT SOURCE
        for (let damageID = 0; damageID < source.dieCount; damageID++) {
          let damage = [
            source.damageType,
            getRandomInt(source.dieType),
            sourceID
          ]
          if (damage[1] > 0) { damageRollData.push(damage) }
        }

        // PLUS MODIFIER
        if (source.modifier > 0) {
          let damage = [
            source.damageType,
            source.modifier,
            sourceID
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

  // returns an array of [true,false,true] corresponding to the current enabled states
  function getDamageSourcesEnabled() {
    let enabledData = [];
    for (let sourceID = 0; sourceID < damageData.length; sourceID++) {
      enabledData.push(damageData[sourceID].enabled);
    }
    return enabledData;
  }

  function getDamageSourcesTiming() {
    let timingData = [];
    for (let sourceID = 0; sourceID < damageData.length; sourceID++) {
      timingData.push(damageData[sourceID].timing);
    }
    return timingData;
  }

  // =============== ADD / EDIT SOURCES =============

  const openEditForDamage = (damageID) => {
    if (editingDamageID === damageID) { // already open; we clicked to close
      setAddDamageIsOpen(false);
    } else {
      setEditingDamageID(damageID);
      setAddDamageIsOpen(true);
    }
  }

  const updateDamage = (die, type) => {
    let newData = [...damageData];
    newData[editingDamageID].dieType = die
    newData[editingDamageID].damageType = type
    setDamageData(newData);
  }

  const createDamage = () => {
    let newData = [...damageData];
    let newDamage = {...defaultDamageData}
    newData.push(newDamage);
    setDamageData(newData);
  }

  const deleteDamage = (damageID) => {
    let newData = [...damageData];
    newData.splice(damageID, 1);
    setDamageData(newData);
    setAddDamageIsOpen(false);

    setRollData([]);
  }

  const renderAddDamage = (damageSourceID) => {
    if (addDamageIsOpen && editingDamageID === damageSourceID) {
      return (
        <AddDamage
          startingData={editingDamageID === null ? null : damageData[editingDamageID]}
          onDelete={() => deleteDamage(damageSourceID)}
          onAccept={(die, type) => updateDamage(die, type)}
          onClose={() => setAddDamageIsOpen(false)}
        />
      )
    }
  }

  // clear out the "we're editing this damage" whenever the panel closes
  useEffect(() => {
    if (!addDamageIsOpen) { setEditingDamageID(null) }
  }, [addDamageIsOpen]);


  return (
    <>
      <div className="Attack">
        <h2>Attack Action</h2>

        <DamageSource {...attackData} {...attackFunctions} />

        <div className='attack-timing-labels'>
          <div>All</div>
          <div>First hit</div>
        </div>

        { damageData.map((data, i) => {
          const editClass = (editingDamageID === i) ? 'editing' : '';

          return (
            <>
              <DamageSource
                attackID={i}
                {...damageData[i]}
                {...damageFunctions}
                onEdit={openEditForDamage}
                extraClass={editClass}
                key={i}
              />
              {renderAddDamage(i)}
            </>
          )
        })}

        {renderAddDamage(null)}
        { !addDamageIsOpen &&
          <button
            className="add-damage-button"
            onClick={() => {
              openEditForDamage(damageData.length);
              createDamage();
            }}
          >
            <div className={`asset plus clickable`} />
            <span>Add Damage Source</span>
          </button>
        }

      </div>

      <Roller
        rollData={rollData}
        damageSourceData={damageData}
        handleNewRoll={generateNewRoll}
        rollFunctions={rollFunctions}
      />
    </>
  );
}
export default Attack ;
