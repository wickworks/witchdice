import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import { defaultDamageData, abilityTypes, actionTypes } from '../data.js';
import DamageSource from './DamageSource.jsx';
import TextInput from './TextInput.jsx';

import './AttackSource.scss';


const AttackSource = ({attackID, attackData, attackFunctions, deleteAttack, clearRollData}) => {
  const {
    damageData,
    dieCount,
    modifier,
    type,
    savingThrowDC,
    savingThrowType,
    name,
    desc
  } = attackData;

  const {
    setDamageData,
    setDieCount,
    setModifier,
    setType,
    setSavingThrowDC,
    setSavingThrowType,
    setName,
    setDesc
  } = attackFunctions;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDamageEditOpen, setIsDamageEditOpen] = useState(false);
  const [editingDamageID, setEditingDamageID] = useState(null);


  // =============== DATA PASSING =============

  const damageFunctions = {
    setDieCount: (value,attackID,damageID) => updateDamageData('dieCount',parseInt(value),attackID,damageID),
    setDieType: (value,attackID,damageID) => updateDamageData('dieType',parseInt(value),attackID,damageID),
    setModifier: (value,attackID,damageID) => updateDamageData('modifier',parseInt(value),attackID,damageID),
    setDamageType: (value,attackID,damageID) => updateDamageData('damageType',value,attackID,damageID),
    setName: (value,attackID,damageID) => updateDamageData('name',value,attackID,damageID),
    setTags: (value,attackID,damageID) => updateDamageData('tags',value,attackID,damageID),
    setEnabled: (value,attackID,damageID) => updateDamageData('enabled',value,attackID,damageID),
    setCondition: (value,attackID,damageID) => updateDamageData('condition',value,attackID,damageID),
    setSavingThrowDC: (value,attackID,damageID) => updateDamageData('savingThrowDC',value,attackID,damageID),
    setSavingThrowType: (value,attackID,damageID) => updateDamageData('savingThrowType',value,attackID,damageID),
  }

  const updateDamageData = (key, value, attackID, damageID) => {
    let newData = deepCopy(damageData)
    newData[damageID][key] = value
    setDamageData(newData, attackID);
  }

  // =============== ADD / EDIT DAMAGE SOURCES =============

  const openEditForDamage = (damageID) => {
    if (editingDamageID === damageID) { // already open; we clicked to close
      setIsDamageEditOpen(false);
    } else {
      setEditingDamageID(damageID);
      setIsDamageEditOpen(true);
    }
  }

  // const updateDamage = (die, type) => {
  //   let newData = deepCopy(damageData);
  //   newData[editingDamageID].dieType = die
  //   newData[editingDamageID].damageType = type
  //   setDamageData(newData, attackID);
  // }

  const createDamage = () => {
    let newData = deepCopy(damageData);
    let newDamage = deepCopy(defaultDamageData);
    newData.push(newDamage);
    setDamageData(newData, attackID);

    clearRollData();
  }

  const deleteDamage = (damageID) => {
    let newData = deepCopy(damageData);
    newData.splice(damageID, 1);
    setDamageData(newData, attackID);
    setIsDamageEditOpen(false);

    clearRollData();
  }

  // clear out the "we're editing this damage" whenever the panel closes
  useEffect(() => {
    if (!isDamageEditOpen) { setEditingDamageID(null) }
  }, [isDamageEditOpen]);

  // =============== EDIT ATTACK =============

  // function handleD20Click(e, leftMouse) {
  //   let newDieCount = dieCount;
  //
  //   if (leftMouse && !e.shiftKey) {
  //     newDieCount += 1;
  //   } else {
  //     newDieCount -= 1;
  //     e.preventDefault()
  //   }
  //
  //   newDieCount = Math.min(newDieCount, 99);
  //   newDieCount = Math.max(newDieCount, 0);
  //   setDieCount(newDieCount, attackID);
  // }

  function handleModifierClick(e, leftMouse) {
    let newModifier = modifier;

    if (leftMouse && !e.shiftKey) {
      newModifier += 1;
    } else {
      newModifier -= 1;
      e.preventDefault()
    }

    newModifier = Math.min(newModifier, 20);
    newModifier = Math.max(newModifier, -20);
    setModifier(newModifier, attackID);
  }

  function handleSavingThrowDCClick(e, leftMouse) {
    let newDC = savingThrowDC;

    if (leftMouse && !e.shiftKey) {
      newDC += 1;
    } else {
      newDC -= 1;
      e.preventDefault()
    }

    newDC = Math.min(newDC, 40);
    newDC = Math.max(newDC, 0);
    setSavingThrowDC(newDC, attackID);
  }

  function handleSavingThrowTypeClick(e, leftMouse) {
    let newType = savingThrowType;

    if (leftMouse && !e.shiftKey) {
      newType += 1;
    } else {
      newType -= 1;
      e.preventDefault()
    }

    newType = newType % abilityTypes.length
    setSavingThrowType(newType, attackID);
  }

  function cycleActionType(currentType) {
    const currentIndex = actionTypes.indexOf(currentType);
    return actionTypes[ (currentIndex+1) % actionTypes.length ]
  }

  const descClass = (desc.length > 64) ? 'long' : 'short'

  return (
    <div className='AttackSource'>


      {/*<div className='die-count-container'>
        <div
          className='asset d20_frame'
          onClick={(e) => handleD20Click(e, true)} onContextMenu={(e) => handleD20Click(e, false)}
        >
          <div className='die-count unselectable'>{dieCount}</div>
        </div>

        <div className="delete-attack asset trash"
          onClick={() => setIsDeleting(!isDeleting)}
        />
      </div>*/}

      <div className='statblock-container'>

        { isDeleting ?
          <div className='delete-confirm-container'>
            <button className='cancel' onClick={() => setIsDeleting(false)}>
              <div className='asset x' />
              Cancel
            </button>
            <button className='delete' onClick={() => {setIsDeleting(false); deleteAttack(attackID)}}>
              <div className='asset trash' />
              Delete
            </button>
            <div className='delete-title'>Delete '{name}'?</div>

          </div>
        :
          <>
            <div className='titlebar'>
              <div className='name'>
                <TextInput
                  textValue={name}
                  setTextValue={(name) => setName(name, attackID)}
                  placeholder='Attack name'
                  suffix='.'
                />
              </div>

              <div className='is-saving-throw'
                onClick={() => setType(cycleActionType(type), attackID)}
              >
                { (type === 'attack') ?
                  'Attack.'
                : (type === 'save') ?
                  'Saving throw.'
                :
                  'Ability.'
                }
              </div>

              { (type === 'attack') ?
                <div
                  className='modifier unselectable'
                  onClick={(e) => handleModifierClick(e, true)}
                  onContextMenu={(e) => handleModifierClick(e, false)}
                >
                  {modifier >= 0 ? '+' : ''}
                  {modifier} to hit
                </div>

              : (type === 'save') ?
                <>
                  <div
                    className='saving-throw-dc unselectable'
                    onClick={(e) => handleSavingThrowDCClick(e, true)}
                    onContextMenu={(e) => handleSavingThrowDCClick(e, false)}
                  >
                    DC {savingThrowDC}
                  </div>
                  <div
                    className='saving-throw-type unselectable'
                    onClick={(e) => handleSavingThrowTypeClick(e, true)}
                    onContextMenu={(e) => handleSavingThrowTypeClick(e, false)}
                  >
                    {abilityTypes[savingThrowType]}
                  </div>
                </>
              : //ability
                <></>
              }

              <div className={`desc ${descClass}`}>
                <TextInput
                  textValue={desc.length > 0 ? desc : '...' }
                  setTextValue={(desc) => setDesc(desc, attackID)}
                  placeholder='Attack description'
                  isTextbox={descClass === 'long'}
                />
              </div>
            </div>

            <div className='statblock'>
              { damageData.map((data, i) => {
                return (
                  <DamageSource
                    damageID={i}
                    attackID={attackID}
                    damageData={damageData[i]}
                    damageFunctions={damageFunctions}

                    setSavingThrowDC={setSavingThrowDC}
                    setSavingThrowType={setSavingThrowType}
                    savingThrowDC={savingThrowDC}
                    savingThrowType={savingThrowType}

                    isEditing={editingDamageID === i}
                    onEdit={openEditForDamage}
                    onDelete={deleteDamage}
                    key={i}
                  />
                )
              })}

              { !isDamageEditOpen &&
                <button
                  className="add-damage-button asset plus"
                  onClick={() => {
                    openEditForDamage(damageData.length);
                    createDamage();
                  }}
                >
                  <div className='text-container'>
                    <span>Add Damage</span>
                  </div>
                </button>
              }
            </div>
          </>
        }
      </div>
    </div>
  );
}
export default AttackSource ;
