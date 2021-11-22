import React, { useState, useEffect } from 'react';
import PilotAndMechList from './PilotAndMechList.jsx';
import PilotDossier from './PilotDossier.jsx';
import MechSheet from './MechSheet.jsx';
import { processPilotJson } from './process_pilot_json.js';
import { deepCopy } from '../../utils.js';
import {
  loadLocalData,
  saveLocalData,
  getIDFromStorageName,
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

const MainLancer = ({

}) => {
  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

  const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const allMechEntries = activePilot ? activePilot.mechs : [];
  const activeMech = allMechEntries.find(mech => mech.id === activeMechID);

  const createNewPilot = (pilot) => {
    let newData = deepCopy(allPilotEntries);
    newData.push(pilot);
    setAllPilotEntries(newData);
    setActivePilot(pilot.id)
    savePilotData(pilot)
  }

  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( processPilotJson(e.target.result) )
    };
  }

  const setActivePilot = (pilotID) => {
    setActivePilotID(pilotID);

    const newActivePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
    if (newActivePilot && newActivePilot.mechs.length > 0) setActiveMechID(newActivePilot.mechs[0]);

    localStorage.setItem("lancer-selected-character", pilotID.slice(0,STORAGE_ID_LENGTH));
  }

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
        if (newActivePilot.mechs.length > 0) setActiveMechID(newActivePilot.mechs[0].id);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='MainLancer'>

      <input type="file" onChange={uploadPilotFile} />

      <PilotAndMechList
        allPilotEntries={allPilotEntries}
        setActivePilotID={setActivePilot}
        activePilotID={activePilotID}
        deleteActivePilot={() => {}}
        createNewPilot={() => {}}

        allMechEntries={allMechEntries}
        setActiveMechID={setActiveMechID}
        activeMechID={activeMechID}
      />

      { activePilot &&
        <PilotDossier
          activePilot={activePilot}
        />
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
