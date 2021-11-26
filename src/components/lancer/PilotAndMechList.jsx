import React, { useState } from 'react';

import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import EntryList from '../shared/EntryList.jsx';

import './PilotAndMechList.scss';


const PilotAndMechList = ({
  allPilotEntries,
  setActivePilotID,
  activePilotID,
  deleteActivePilot,

  onPilotFileUpload,

  allMechEntries,
  setActiveMechID,
  activeMechID,
}) => {
  const [isMakingNewPilot, setIsMakingNewPilot] = useState(false);

  const onFileChange = (e) => {
    setIsMakingNewPilot(false);
    onPilotFileUpload(e);
  }

  return (
    <div className="PilotAndMechList">

      { isMakingNewPilot ?
        <div className="MechList new-pilot">
          <div className="title-bar">
            <h2>Pilots</h2>
          </div>


          <div className="title-and-input">
            <div className="title">New Pilot</div>
            <input type="file" accept="application/JSON" onChange={onFileChange} />
          </div>


          <div className="instructions">
            Upload a pilot data file (.json) from
            <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
          </div>

          <button className='cancel' onClick={() => setIsMakingNewPilot(false)}>
            Cancel
          </button>
        </div>
      :
        <CharacterList
          title={'Pilot'}
          characterEntries={allPilotEntries}
          handleEntryClick={setActivePilotID}
          activeCharacterID={activePilotID}
          deleteActiveCharacter={deleteActivePilot}
          createNewCharacter={() => setIsMakingNewPilot(true)}
        />
      }

      <div className="MechList">
        <div className="title-bar">
          <h2>Mechs</h2>
        </div>

        <EntryList
          entries={allMechEntries}
          handleEntryClick={setActiveMechID}
          activeCharacterID={activeMechID}
          deleteEnabled={false}
        />
      </div>

    </div>
  );
}


export default PilotAndMechList;
