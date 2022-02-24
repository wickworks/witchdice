import React, { useState } from 'react';
import TextInput from '../../shared/TextInput.jsx';
import { DeleteConfirmation } from '../../shared/DeleteButton.jsx';

import './EncounterControls.scss';

const EncounterControls = ({
  activeEncounter,
  setEncounterName,
  restartEncounter,
}) => {
  const [isRestarting, setIsRestarting] = useState(false)

  return (
    <div className='EncounterControls'>
      <TextInput
        textValue={activeEncounter.name}
        setTextValue={setEncounterName}
        placeholder='Encounter name'
        maxLength={32}
      />

      {isRestarting ?
        <DeleteConfirmation
          fullConfirmMessage={'Reset round counter, heal all NPCs, and move them back to reinforcements?'}
          deleteWord='Restart'
          deleteIcon='refresh'
          handleCancel={() => setIsRestarting(false)}
          handleDelete={() => {setIsRestarting(false); restartEncounter();}}
        />
      :
        <div className='buttons-container'>
          <div />

          <button className='restart' onClick={() => setIsRestarting(true)}>
            Restart
          </button>
        </div>
      }
    </div>
  )
}

export default EncounterControls;
