import React, { useState, useEffect } from 'react';
import { deepCopy } from '../../utils.js';
import { defaultDamageData, abilityTypes, actionTypes } from './data.js';
import DamageSource from './DamageSource.jsx';
import DamageEdit from './DamageEdit.jsx';
import TextInput from '../shared/TextInput.jsx';
import { DeleteButton, DeleteConfirmation } from '../shared/DeleteButton.jsx';

import './AttackSource.scss';


const AttackSource = ({attackID, attackData, attackFunctions, deleteAttack, clearRollData}) => {
  const {
    damageData,
    modifier,
    type,
    savingThrowDC,
    savingThrowType,
    name,
    desc
  } = attackData;

  const {
    setDamageData,
    setModifier,
    setType,
    setSavingThrowDC,
    setSavingThrowType,
    setName,
    setDesc
  } = attackFunctions;

  const [isDeleting, setIsDeleting] = useState(false)
  const [isDamageEditOpen, setIsDamageEditOpen] = useState(false)
  const [editingDamageID, setEditingDamageID] = useState(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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

  const toggleDamageSourceEdit = (damageID) => {
    if (editingDamageID === damageID) { // already open; we clicked to close
      setIsDamageEditOpen(false);
    } else {
      setEditingDamageID(damageID);
      setIsDamageEditOpen(true);
    }
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

  const isLong = (desc.length > 64)
  const isVeryLong = (desc.length > 256)
  const descClass = (isVeryLong || isLong) ? 'long' : 'short'
  const expandedClass = (isDescriptionExpanded || !isVeryLong) ? 'expanded' : ''

  return (
    <div className='AttackSource'>
      <div className='statblock-container'>

        { isDeleting ?
          <DeleteConfirmation
            name={name}
            handleCancel={() => setIsDeleting(false)}
            handleDelete={() => {setIsDeleting(false); deleteAttack(attackID)}}
            moreClasses={'delete-attack-confirmation'}
          />
        :
          <>
            <div className={`titlebar ${descClass}`}>
              <div className='info-left'>
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

              </div>

              <div className={`desc-container ${descClass}`}>
                <div className={`desc ${descClass} ${expandedClass}`}>

                  { isVeryLong && !isDescriptionExpanded ?
                    <div className='collapsed-snippet' onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                      {desc}
                    </div>
                  :
                    <TextInput
                      textValue={desc.length > 0 ? desc : '...' }
                      setTextValue={(desc) => setDesc(desc, attackID)}
                      placeholder='Attack description'
                      isTextbox={isLong}
                      isMarkdown={isLong}
                    />
                  }
                </div>
                {isVeryLong &&
                  <button
                    className={`expand-arrow asset arrow ${expandedClass}`}
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  />
                }
              </div>

            </div>

            <div className='statblock'>
              { damageData.map((data, i) => {
                return (
                  <React.Fragment key={i}>
                    <DamageSource
                      damageData={damageData[i]}
                      damageID={i}
                      savingThrowDC={savingThrowDC}
                      savingThrowType={savingThrowType}
                      isEditing={editingDamageID === i}
                      toggleEdit={toggleDamageSourceEdit}
                    />

                    { (isDamageEditOpen && editingDamageID === i) &&
                      <DamageEdit
                        damageID={editingDamageID}
                        attackID={attackID}
                        damageData={damageData[editingDamageID]}
                        damageFunctions={damageFunctions}
                        setSavingThrowDC={setSavingThrowDC}
                        setSavingThrowType={setSavingThrowType}
                        savingThrowDC={savingThrowDC}
                        savingThrowType={savingThrowType}
                        toggleEdit={toggleDamageSourceEdit}
                        onDelete={deleteDamage}
                      />
                    }
                  </React.Fragment>
                )
              })}

              <button
                className='add-damage-button'
                onClick={() => {
                  toggleDamageSourceEdit(damageData.length);
                  createDamage();
                }}
              >
                <div className='asset plus' />
                <span className={`desc ${damageData.length === 0 ? 'show' : ''}`}>Add Damage</span>
              </button>
            </div>

          </>
        }
      </div>

      {!isDeleting &&
        <DeleteButton
          handleClick={() => setIsDeleting(!isDeleting)}
          moreClasses='delete-attack'
        />
      }
    </div>
  );
}
export default AttackSource ;
