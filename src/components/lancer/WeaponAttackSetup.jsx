import React, { useState } from 'react';
import BigRollButton from '../shared/BigRollButton.jsx';

import './WeaponAttackSetup.scss';


const WeaponAttackSetup = ({
}) => {

  const difficultySources = ['Impaired', 'Inaccurate']
  const accuracySources = ['Accurate', 'Consume Lock']

  return (
    <div className="WeaponAttackSetup">

      <BigRollButton
        handleNewRoll={() => {}}
      />

      <div className="column-container">
        <div className="column difficulty">
          <div className='column-label'>- Difficulty</div>

          <div className="numberline">
            { [4,3,2,1].map(difficulty =>
              <button>{difficulty}</button>
            )}
          </div>

          <div className="sources">
            { difficultySources.map(source =>
              <button>{source}</button>
            )}

            <div className="cover">
              <span className='label'>Cover:</span>
              <button>Soft</button>
              <button>Hard</button>
            </div>
          </div>
        </div>

        <div className="column accuracy">
          <div className='column-label'>Accuracy+</div>

          <div className="numberline">
            { [1,2,3,4].map(accuracy =>
              <button>{accuracy}</button>
            )}
          </div>

          <div className="sources">
            { accuracySources.map(source =>
              <button>{source}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default WeaponAttackSetup;
