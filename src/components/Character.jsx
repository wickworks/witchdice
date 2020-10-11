import React, { useState } from 'react';
import AttackSource from './AttackSource.jsx';
import TextInput from './TextInput.jsx';
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

  return (
    <div className="Character">
      <hr className="pumpkin-bar" />


      <div className="character-sheet">
        { isDeleting ?
          <div className='delete-character-confirm-container'>
            <div className='delete-title'>Delete {characterName}?</div>

            <button className='delete' onClick={() => {setIsDeleting(false); deleteCharacter()}}>
              <div className='asset trash' />
              Delete
            </button>
            <button className='cancel' onClick={() => setIsDeleting(false)}>
              <div className='asset x' />
              Cancel
            </button>
          </div>
        :
          <h2 className="character-name">
            <TextInput
              textValue={characterName}
              setTextValue={setCharacterName}
              placeholder='Character name'
              maxLength={50}
            />
          </h2>
        }
        <div className="delete-character asset trash"
          onClick={() => setIsDeleting(true)}
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
