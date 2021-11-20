import React, { useState } from 'react';

import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import EntryList from '../shared/EntryList.jsx';

import './PilotAndMechList.scss';


const PilotAndMechList = ({
  allPilotEntries,
  setActivePilotID,
  activePilotID,
  deleteActivePilot,
  createNewPilot,

  allMechEntries,
  setActiveMechID,
  activeMechID,
}) => {

  return (
    <div className="PilotAndMechList">

      <CharacterList
        title={'Pilot'}
        characterEntries={allPilotEntries}
        handleEntryClick={setActivePilotID}
        activeCharacterID={activePilotID}
        deleteActiveCharacter={deleteActivePilot}
        createNewCharacter={createNewPilot}
      />

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
