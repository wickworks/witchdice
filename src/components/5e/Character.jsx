import React, { useState } from 'react';
import AttackSource from './AttackSource.jsx';
import TextInput from '../shared/TextInput.jsx';
import { DeleteButton, DeleteConfirmation } from '../shared/DeleteButton.jsx';
import './Character.scss';

const Character = ({
  characterName, setCharacterName,
  allAttackData,
  updateAllAttackData, deleteAttack, createAttack,
  attackFunctions,
  deleteCharacter,
  clearRollData
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingClass = isDeleting ? 'hidden' : '';

  const updateCharacterName = (value) => {
    let filtered = value.replace(/[^A-Za-z -]/ig, '')
    if (filtered.length === 0) { filtered = 'X'; }
    setCharacterName(filtered)
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

          <div className='add-attack' onClick={createAttack}>
            <div className={`asset plus`} />
            Add Attack
          </div>
        </div>
      </div>

      <hr className="pumpkin-bar" />
    </div>
  );
}


export default Character ;
