import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import { defaultDamageData } from '../data.js';
import DamageSource from './DamageSource.jsx';
import './AttackSource.scss';


const AttackSource = ({attackID, attackData, attackFunctions, deleteAttack, clearRollData}) => {
  const { damageData, dieCount, modifier, isSavingThrow, savingThrowDC, name, desc } = attackData;
  const { setDamageData, setDieCount, setModifier, setIsSavingThrow, setSavingThrowDC, setName, setDesc } = attackFunctions;

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDamageEditOpen, setIsDamageEditOpen] = useState(false);
  const [editingDamageID, setEditingDamageID] = useState(null);


  // =============== DATA PASSING =============

  const damageFunctions = {
    setDieCount: (value, attackID,damageID) => updateDamageData('dieCount',parseInt(value),attackID,damageID),
    setDieType: (value, attackID,damageID) => updateDamageData('dieType',parseInt(value),attackID,damageID),
    setModifier: (value, attackID,damageID) => updateDamageData('modifier',parseInt(value),attackID,damageID),
    setDamageType: (value, attackID,damageID) => updateDamageData('damageType',value,attackID,damageID),
    setName: (value, attackID,damageID) => updateDamageData('name',value,attackID,damageID),
    setTags: (value, attackID,damageID) => updateDamageData('tags',value,attackID,damageID),
    setEnabled: (value, attackID,damageID) => updateDamageData('enabled',value,attackID,damageID),
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

  const updateDamage = (die, type) => {
    let newData = deepCopy(damageData);
    newData[editingDamageID].dieType = die
    newData[editingDamageID].damageType = type
    setDamageData(newData, attackID);
  }

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

  function handleD20Click(e, leftMouse) {
    let newDieCount = dieCount;

    if (leftMouse && !e.shiftKey) {
      newDieCount += 1;
    } else {
      newDieCount -= 1;
      e.preventDefault()
    }

    newDieCount = Math.min(newDieCount, 99);
    // newDieCount = Math.max(newDieCount, 0);
    if (newDieCount === -1) { deleteAttack(attackID) }
    else {setDieCount(newDieCount, attackID);}
  }

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


  return (
    <div className='AttackSource'>
      <div className='die-count-container'>
        <div
          className='asset d20_frame'
          onClick={(e) => handleD20Click(e, true)} onContextMenu={(e) => handleD20Click(e, false)}
        >
          <div className='die-count unselectable'>{dieCount}</div>
        </div>
      </div>

      <div className='statblock-container'>
        <div className='titlebar'>
          <div className='name'>
            {isEditingName ?
              <input
                type="text"
                value={name}
                onKeyPress={ (e) => { if (e.key === 'Enter') {setIsEditingName(false)} }}
                onBlur={ () => {setIsEditingName(false)} }
                onChange={ e => setName(e.target.value, attackID) }
                placeholder={'Attack name'}
                focus={'true'}
              />
            :
              <div className='display' onClick={() => setIsEditingName(true)}>
                {name}.
              </div>
            }

          </div>

          {isSavingThrow ?
            <div
              className='saving-throw-dc unselectable'
              onClick={(e) => handleSavingThrowDCClick(e, true)} onContextMenu={(e) => handleSavingThrowDCClick(e, false)}
            >
              DC {savingThrowDC}
            </div>
          :
            <div
              className='modifier unselectable'
              onClick={(e) => handleModifierClick(e, true)} onContextMenu={(e) => handleModifierClick(e, false)}
            >
              {modifier >= 0 ? '+' : ''}
              {modifier} to hit
            </div>
          }

          <div className='metadata-container'>
            <div className='is-saving-throw'
              onClick={() => setIsSavingThrow(!isSavingThrow, attackID)}
            >
              { isSavingThrow ?
                'Saving throw.'
              :
                'Attack.'
              }
            </div>

            {!isEditingName &&
              <div className='desc'>
                {isEditingDesc ?
                  <input
                    type="text"
                    value={desc}
                    onKeyPress={ (e) => { if (e.key === 'Enter') {setIsEditingDesc(false)} }}
                    onBlur={ () => {setIsEditingDesc(false)} }
                    onChange={ e => setDesc(e.target.value, attackID) }
                    placeholder={'Attack description'}
                    focus={'true'}
                  />
                :
                  <div className='display' onClick={() => setIsEditingDesc(true)}>
                    {desc}
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div className='statblock'>
          { damageData.map((data, i) => {
            const editClass = (editingDamageID === i) ? 'editing' : '';
            return (
              <DamageSource
                damageID={i}
                attackID={attackID}
                damageData={damageData[i]}
                damageFunctions={damageFunctions}
                isEditing={editingDamageID === i}
                onEdit={openEditForDamage}
                onDelete={deleteDamage}
                key={i}
              />
            )
          })}

          { !isDamageEditOpen &&
            <button
              className="add-damage-button"
              onClick={() => {
                openEditForDamage(damageData.length);
                createDamage();
              }}
            >
              <span>Add Damage</span>
              <div className={`asset plus`} />
            </button>
          }
        </div>
      </div>
    </div>
  );
}
export default AttackSource ;
