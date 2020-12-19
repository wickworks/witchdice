import React, { useState } from 'react';
import Select from 'react-select'
import AttackSource from './AttackSource.jsx';
import TextInput from '../shared/TextInput.jsx';
import { DeleteButton, DeleteConfirmation } from '../shared/DeleteButton.jsx';
import './Character.scss';

const Character = ({
  characterName, setCharacterName,
  allAttackData,
  updateAllAttackData, deleteAttack,
  createAttack, createAttackFromSpell,
  attackFunctions,
  deleteCharacter,
  allPresetEntries, setToCharacterPreset,
  allSpellData,
  clearRollData
}) => {
  const [isAddingSpell, setIsAddingSpell] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingClass = isDeleting ? 'hidden' : '';

  const updateCharacterName = (value) => {
    let filtered = value.replace(/[^A-Za-z -]/ig, '')
    if (filtered.length === 0) { filtered = 'X'; }
    setCharacterName(filtered)
  }

  const spellOptions = Object.keys(allSpellData).map(spellName => ({
    "value" : spellName,
    "label" : spellName
  }))

  const selectSpell = (spellOption) => {
    setIsAddingSpell(false);
    createAttackFromSpell(spellOption.value);
  }

  return (
    <div className="Character">
      <hr className="pumpkin-bar" />
      <div className="character-sheet">
        { isDeleting ?
          <DeleteConfirmation
            name={characterName}
            handleCancel={() => setIsDeleting(false)}
            handleDelete={() => {setIsDeleting(false); deleteCharacter()}}
            moreClasses={'delete-character-confirmation'}
          />
        :
          <h2 className="character-name">
            <TextInput
              textValue={characterName}
              setTextValue={updateCharacterName}
              placeholder='Name'
              maxLength={50}
            />
          </h2>
        }
        <DeleteButton
          handleClick={() => setIsDeleting(true)}
          moreClasses='delete-character'
        />

        <div className={`attack-container ${isDeletingClass}`}>
          { allAttackData.map((data, i) => {
            return (
              <AttackSource
                attackID={i}
                attackData={allAttackData[i]}
                attackFunctions={attackFunctions}
                deleteAttack={(attackID) => deleteAttack(attackID)}
                clearRollData={clearRollData}
                key={`${characterName}-attack-${i}`}
              />
            )
          })}

          { allAttackData.length === 0 &&
            <div className='character-preset-container'>
              <select value={''} onChange={(e) => setToCharacterPreset(e.target.value)}>
                <option value={''} key={'blank'} disabled>Select preset...</option>
                {allPresetEntries.map((preset) => {
                  return (<option value={preset.id} key={preset.id}>{preset.name}</option>)
                })}
              </select>
            </div>
          }

          <div className='add-attack-container'>
            <div className='add-button' onClick={createAttack}>
              <div className={`asset plus`} />
              Add Attack
            </div>

            {!isAddingSpell ?
              <div className='add-button' onClick={() => setIsAddingSpell(true)}>
                <div className={`asset plus`} />
                Add Spell
              </div>
            :
              <div className='add-spell-container'>
                <div className='add-button' onClick={() => setIsAddingSpell(false)}>
                  <div className={`asset x`} />
                </div>
                <Select
                  placeholder={'Spell name'}
                  className={'select-spell-dropdown'}
                  options={spellOptions}
                  value={''}
                  onChange={selectSpell}
                  defaultMenuIsOpen
                />
              </div>
            }
          </div>
        </div>
      </div>

      <hr className="pumpkin-bar" />
    </div>
  );
}


export default Character ;
