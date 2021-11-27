import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from './FileAndPlainList.jsx';
import EntryList from '../shared/EntryList.jsx';
import PilotDossier from './PilotDossier.jsx';
import MechSheet from './MechSheet.jsx';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import { deepCopy } from '../../utils.js';
import {
  loadLocalData,
  saveLocalData,
  getIDFromStorageName,
  getStorageName,
} from '../../localstorage.js';

import './MainLancer.scss';

const PILOT_PREFIX = 'pilot';
const STORAGE_ID_LENGTH = 6;

function savePilotData(pilot) {
  saveLocalData(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name, pilot);
}

function loadPilotData(pilotID) {
  return loadLocalData(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH));
}

function deletePilotData(pilot) {
  const storageName = getStorageName(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name);
  localStorage.removeItem(storageName);
}

const coreLcpEntry = {
  name: 'Core Content',
  id: 'core'
}

const MainLancer = () => {
  const [allLcpEntries, setAllLcpEntries] = useState([coreLcpEntry]);
  const [activeLcpID, setActiveLcpID] = useState(null);

  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

  const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const allMechEntries = activePilot ? activePilot.mechs : [];
  const activeMech = allMechEntries.find(mech => mech.id === activeMechID);

  // =============== INITIALIZE ==================
  useEffect(() => {
    let pilotEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));

      if (key.startsWith(`${PILOT_PREFIX}-`)) {
        const pilotID = getIDFromStorageName(PILOT_PREFIX, key);
        const pilotData = loadPilotData(pilotID);
        if (pilotData) pilotEntries.push(pilotData);
      }
    }

    setAllPilotEntries(pilotEntries);

    // if we were looking at a pilot, restore tham and their first mech
    const oldSelectedID = localStorage.getItem("lancer-selected-character");
    if (oldSelectedID) {
      const newActivePilot = pilotEntries.find(pilot => pilot.id.startsWith(oldSelectedID));
      if (newActivePilot) {
        setActivePilotID(newActivePilot.id)
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // always select the first mech from a pilot
  useEffect(() => {
    if (activePilot && activePilot.mechs.length > 0) setActiveMechID(activePilot.mechs[0].id);
  }, [activePilotID]); // eslint-disable-line react-hooks/exhaustive-deps


  const createNewPilot = (pilot) => {
    let newData = deepCopy(allPilotEntries);

    // remove any existing pilots of this ID
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === pilot.id);
    if (pilotIndex >= 0) newData.splice(pilotIndex, 1)

    // store the entry & set it to active
    newData.push(pilot);
    setAllPilotEntries(newData);
    setActivePilot(pilot.id)

    // save to localstorage
    savePilotData(pilot)
  }

  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( JSON.parse(e.target.result) )
    };
  }

  const setActivePilot = (pilotID) => {
    setActivePilotID(pilotID);

    const newActivePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
    if (newActivePilot && newActivePilot.mechs.length > 0) setActiveMechID(newActivePilot.mechs[0]);

    localStorage.setItem("lancer-selected-character", pilotID.slice(0,STORAGE_ID_LENGTH));
  }

  const deleteActivePilot = () => {
    deletePilotData(activePilot)
    localStorage.setItem("lancer-selected-character", '');

    // remove from the current list of crafter entries
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    if (pilotIndex >= 0) {
      let newData = deepCopy(allPilotEntries)
      newData.splice(pilotIndex, 1)
      setAllPilotEntries(newData);
    }

    setActivePilotID(null);
    setActiveMechID(null);
  }

  // <FileList
  //   title={'Lancer Content Pack'}
  //   extraClass={'content-packs'}
  //   characterEntries={allLcpEntries}
  //   handleEntryClick={setActiveLcpID}
  //   activeCharacterID={activeLcpID}
  //   deleteActiveCharacter={() => {}}
  //   createNewCharacter={() => {}}
  // />

  return (
    <div className='MainLancer'>



      <FileList
        title='Pilot'
        extraClass='pilots'
        allFileEntries={allPilotEntries}
        setActiveFileID={setActivePilot}
        activeFileID={activePilotID}
        deleteActiveFile={deleteActivePilot}
        onFileUpload={uploadPilotFile}
      />

      { activePilot &&
        <>
          <PilotDossier
            activePilot={activePilot}
          />

          <PlainList title='Mech' extraClass='mechs'>
            <EntryList
              entries={allMechEntries}
              handleEntryClick={setActiveMechID}
              activeCharacterID={activeMechID}
              deleteEnabled={false}
            />
          </PlainList>
        </>
      }

      { activeMech &&
        <MechSheet
          activeMech={activeMech}
          activePilot={activePilot}
        />
      }
    </div>
  )
}

export default MainLancer;
