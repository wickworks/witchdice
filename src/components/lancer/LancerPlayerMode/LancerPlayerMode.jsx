import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import { CharacterList } from '../../shared/CharacterAndMonsterList.jsx';
import PilotDossier from './PilotDossier.jsx';
import PlayerMechSheet from './PlayerMechSheet.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';

import {
  savePilotData,
  loadPilotData,
  deletePilotData,
  PILOT_PREFIX,
  STORAGE_ID_LENGTH,
  SELECTED_CHARACTER_KEY,
  LANCER_SQUAD_MECH_KEY,
} from '../lancerLocalStorage.js';

import { getIDFromStorageName } from '../../../localstorage.js';

import { createSquadMech } from '../SquadPanel/squadUtils.js';

import compendiaJonesJson from './YOURGRACE.json';

// import './LancerPlayerMode.scss';

const LancerPlayerMode = ({
  setTriggerRerender,
  triggerRerender,

  partyConnected,
  partyRoom,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}) => {
  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  // We trigger a full rerender when we change the mech so the squad panel can pick up changes to LANCER_SQUAD_MECH_KEY
  const changeMech = (newMechID) => {
    setActiveMechID(newMechID)
    setTriggerRerender(!triggerRerender)
  }

  // const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const activePilot = activePilotID && loadPilotData(activePilotID); // load the pilot data from local storage
  const allMechEntries = activePilot ? activePilot.mechs : [];
  const activeMech = allMechEntries.find(mech => mech.id === activeMechID);


  // =============== INITIALIZE ==================
  useEffect(() => {
    // Save some dummy data (it's my OC, okay? I can have this)
    savePilotData(compendiaJonesJson)

    let pilotEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));

      if (key.startsWith(`${PILOT_PREFIX}-`)) {
        const pilotID = getIDFromStorageName(PILOT_PREFIX, key, STORAGE_ID_LENGTH);
        const pilotData = loadPilotData(pilotID);
        if (pilotData) pilotEntries.push(pilotData);
      }
    }

    setAllPilotEntries(pilotEntries.map(pilot => ({name: pilot.name, id: pilot.id})));

    // if we were looking at a pilot, restore tham and their first mech
    const oldSelectedID = localStorage.getItem(SELECTED_CHARACTER_KEY);
    if (oldSelectedID) {
      const newActivePilot = pilotEntries.find(pilot => pilot.id.startsWith(oldSelectedID));
      if (newActivePilot) {
        setActivePilot(newActivePilot.id)
      }
    }
  }, []);

  // =============== MAINTAIN SQUAD MECH JSON ==================
  if (partyConnected && activeMech && activePilot) {
    const squadMech = createSquadMech(activeMech, activePilot)
    localStorage.setItem(LANCER_SQUAD_MECH_KEY, JSON.stringify(squadMech));
  }

  // =============== PILOT FILES ==================
  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( JSON.parse(e.target.result) )
    };
  }

  const createNewPilot = (pilot) => {
    // sanity-check the pilot file
    if (!pilot || !pilot.id || !pilot.mechs) return

    let newData = [...allPilotEntries]

    // remove any existing pilots of this ID
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === pilot.id);
    if (pilotIndex >= 0) newData.splice(pilotIndex, 1)

    // store the entry & set it to active
    newData.push({name: pilot.name, id: pilot.id});
    setAllPilotEntries(newData);
    setActivePilot(pilot.id)

    // save to localstorage
    savePilotData(pilot)
  }

  const setActivePilot = (pilotID) => {
    const newActivePilot = pilotID && loadPilotData(pilotID)

    if (newActivePilot) {
      setActivePilotID(pilotID);

      // select the last mech
      if (newActivePilot && newActivePilot.mechs.length > 0) {
        const lastMechIndex = newActivePilot.mechs.length - 1
        changeMech(newActivePilot.mechs[lastMechIndex].id);
      } else {
        changeMech(null)
      }

      localStorage.setItem(SELECTED_CHARACTER_KEY, pilotID.slice(0,STORAGE_ID_LENGTH));
    }
  }

  const deleteActivePilot = () => {
    if (!activePilot) return

    deletePilotData(activePilot)
    localStorage.setItem(SELECTED_CHARACTER_KEY, '');

    // remove from the current list of pilot entries
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    if (pilotIndex >= 0) {
      let newData = [...allPilotEntries]
      newData.splice(pilotIndex, 1)
      setAllPilotEntries(newData);
    }

    setActivePilotID(null);
    changeMech(null);
  }




  let jumplinks = ['pilot','mech','weapons','dicebag']
  if (partyConnected) jumplinks.splice(-1, 0, 'squad')

  return (
    <div className='LancerPlayerMode'>

      { activePilot &&
        <JumplinkPanel jumplinks={jumplinks} partyConnected={partyConnected} />
      }

      <FileList
        title='Pilot'
        extraClass='pilots'
        onFileUpload={uploadPilotFile}
        onFilePaste={parsedJson => createNewPilot(parsedJson)}
        isUploadingNewFile={isUploadingNewFile}
        setIsUploadingNewFile={setIsUploadingNewFile}
        instructions={
          <>
            Upload a pilot data file (.json) from
            <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
          </>
        }
      >
        <CharacterList
          title={'Pilot'}
          characterEntries={allPilotEntries}
          handleEntryClick={setActivePilot}
          activeCharacterID={activePilotID}
          deleteActiveCharacter={deleteActivePilot}
          createNewCharacter={() => setIsUploadingNewFile(true)}
        />

      </FileList>

      <div className='jumplink-anchor' id='pilot' />
      { activePilot &&
        <>
          <PilotDossier
            activePilot={activePilot}
          />

          <PlainList title='Mech' extraClass='mechs'>
            <EntryList
              entries={allMechEntries}
              handleEntryClick={changeMech}
              activeCharacterID={activeMechID}
              deleteEnabled={false}
            />
          </PlainList>
        </>
      }

      <div className='jumplink-anchor' id='mech' />
      { activeMech &&
        <PlayerMechSheet
          activePilot={activePilot}
          activeMech={activeMech}

          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}

          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
          setDistantDicebagData={setDistantDicebagData}
        />
      }
    </div>
  );
}




export default LancerPlayerMode;
