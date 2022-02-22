import React, { useState, useEffect } from 'react';
import { FileList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import { CharacterList } from '../../shared/CharacterAndMonsterList.jsx';
import ActiveNpcBox from './ActiveNpcBox.jsx';
import NpcMechSheet from './NpcMechSheet.jsx';
import NpcRoster from './NpcRoster.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';

import { deepCopy } from '../../../utils.js';
import { randomWords } from '../../../random_words.js';

import {
  saveEncounterData,
  loadEncounterData,
  deleteEncounterData,
  ENCOUNTER_PREFIX,
  STORAGE_ID_LENGTH,
  NPC_LIBRARY_NAME,
} from '../lancerLocalStorage.js';

import {
  loadLocalData,
  saveLocalData,
  getIDFromStorageName,
  getRandomFingerprint,
} from '../../../localstorage.js';




// import npcJson from './GRAVITYOFTHESITUATION.json';
import npcJson from './THEWORMS.json';

import './LancerNpcMode.scss';

const emptyEncounter = {
  id: '',
  name: '',
  active: [],
  reinforcements: [],
  casualties: [],
  allNpcs: {},
}

const SELECTED_ENCOUNTER_KEY = "lancer-selected-encounter"

const LancerNpcMode = ({
  setTriggerRerender,
  triggerRerender,

  partyConnected,
  partyRoom,
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  //
  const [allEncounterEntries, setAllEncounterEntries] = useState([])
  const [npcLibrary, setNpcLibrary] = useState({})

  const [activeEncounterID, setActiveEncounterID] = useState(null)
  const [activeNpcFingerprint, setActiveNpcFingerprint] = useState(null)

  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  const activeEncounter = activeEncounterID && loadEncounterData(activeEncounterID);
  const activeNpc = (activeEncounter && activeNpcFingerprint) && activeEncounter.allNpcs[activeNpcFingerprint];


  // =============== INITIALIZE ==================
  useEffect(() => {
    let encounterEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      if (key.startsWith(`${ENCOUNTER_PREFIX}-`)) {
        const encounterID = getIDFromStorageName(ENCOUNTER_PREFIX, key, STORAGE_ID_LENGTH);
        const encounterData = loadEncounterData(encounterID);
        if (encounterData) encounterEntries.push(encounterData);
      }

      // load the npc library into memory
      if (key === NPC_LIBRARY_NAME) setNpcLibrary( JSON.parse(localStorage.getItem(NPC_LIBRARY_NAME)) )
    }

    // If we have no encounters, make a new one
    if (encounterEntries.length === 0) {
      const newEncounter = buildNewEncounter()
      encounterEntries.push(newEncounter)
      setActiveEncounterID(newEncounter.id)
      saveEncounterData(newEncounter)
    }

    setAllEncounterEntries(encounterEntries.map(encounter => ({name: encounter.name, id: encounter.id})));

    // if we were looking at a encounter, restore it
    const oldSelectedID = localStorage.getItem(SELECTED_ENCOUNTER_KEY);
    console.log('sel id :',oldSelectedID);
    if (oldSelectedID) {
      const newActiveEncounter = encounterEntries.find(encounter => encounter.id.startsWith(oldSelectedID));
      if (newActiveEncounter) {
        setActiveEncounterID(newActiveEncounter.id)
      }
    }
  }, []);


  // =============== NPC ROSTER ==================


  const createNewNpc = (npc) => {
    // sanity-check the npc file
    if (!npc || !npc.id || !npc.class) return

    let newData = {...npcLibrary}
    newData[npc.id] = npc;

    // save the whole library to state & localstorage
    setNpcLibrary(newData)
    localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newData));
  }

  const uploadNpcFile = e => {
    console.log('uploadNpcFile',uploadNpcFile);
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewNpc( JSON.parse(e.target.result) )
    };
  }

  const addNpcToEncounter = (npcId) => {
    console.log('Adding npc to encounter', npcId);
    const npc = npcLibrary[npcId]

    if (npc) {
      let newNpc = deepCopy(npc)
      newNpc.fingerprint = getRandomFingerprint() // need a new id so we can tell them apart

      let newEncounter = deepCopy(activeEncounter)
      newEncounter.reinforcements.push(newNpc.fingerprint)
      newEncounter.allNpcs[newNpc.fingerprint] = newNpc

      saveEncounterData(newEncounter)
      setTriggerRerender(!triggerRerender)
    }
  }

  // =============== ENCOUNTERS ==================


  function buildNewEncounter() {
    let newEncounter = deepCopy(emptyEncounter)
    newEncounter.id = `${getRandomFingerprint()}`
    newEncounter.name = `${randomWords(1)}-${randomWords(1)}`

    return newEncounter
  }

  const createNewEncounter = () => {
    let newEncounter = buildNewEncounter()
    setActiveEncounterID(newEncounter.id)

    let encounterEntries = [...allEncounterEntries]
    encounterEntries.push({name: newEncounter.name, id: newEncounter.id})
    setAllEncounterEntries(encounterEntries)

    saveEncounterData(newEncounter)
  }


  const deleteActiveEncounter = () => {
    if (!activeEncounter) return

    deleteEncounterData(activeEncounter)
    localStorage.setItem(SELECTED_ENCOUNTER_KEY, '');

    // remove from the current list of encounter entries
    let encounterIndex = allEncounterEntries.findIndex(entry => entry.id === activeEncounter.id);
    if (encounterIndex >= 0) {
      let newData = [...allEncounterEntries]
      newData.splice(encounterIndex, 1)
      setAllEncounterEntries(newData);
    }

    setActiveEncounterID(null);
    setActiveNpcFingerprint(null);
  }

  const setActiveEncounter = (encounterID) => {
    const newActiveEncounter = encounterID && loadEncounterData(encounterID)
    if (newActiveEncounter) {
      setActiveEncounterID(encounterID);
      localStorage.setItem(SELECTED_ENCOUNTER_KEY, encounterID.slice(0,STORAGE_ID_LENGTH));
    }
  }


  const npcListActive = activeEncounter && activeEncounter.active.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListReinforcements = activeEncounter && activeEncounter.reinforcements.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListCasualties = activeEncounter && activeEncounter.casualties.map(fingerprint => activeEncounter.allNpcs[fingerprint])


  const setNpcStatus = (npcFingerprint, status) => {
    console.log('setNpcStatus', npcFingerprint, status);

    let newEncounter = {...activeEncounter}

    // remove it from all previous statuses
    newEncounter.active = newEncounter.active.filter(id => id !== npcFingerprint)
    newEncounter.reinforcements = newEncounter.reinforcements.filter(id => id !== npcFingerprint)
    newEncounter.casualties = newEncounter.casualties.filter(id => id !== npcFingerprint)

    // add it to the new list
    newEncounter[status].push(npcFingerprint)

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }


  console.log('activeEncounter',activeEncounter);

  // --- JUMPLINKS --
  let jumplinks = []
  if (!activeEncounter) {
    jumplinks.push('roster')
  } else {
    jumplinks.push('encounter')

    if (activeNpc) {
      jumplinks.push('npc')
      jumplinks.push('weapons')
    }
  }
  jumplinks.push('dicebag')


  return (
    <div className='LancerNpcMode'>

      <JumplinkPanel jumplinks={jumplinks} partyConnected={partyConnected} />

      <div className='jumplink-anchor' id='roster' />
      <div className='encounter-and-roster-container'>
        <FileList
          title='NPC'
          extraClass='npcs'
          onFileUpload={uploadNpcFile}
          onFilePaste={parsedJson => createNewNpc(parsedJson)}
          isUploadingNewFile={isUploadingNewFile}
          setIsUploadingNewFile={setIsUploadingNewFile}
          instructions={
            <>
              Upload a npc data file (.json) from
              <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
            </>
          }
        >
          <NpcRoster
            npcLibrary={npcLibrary}
            addNpcToEncounter={addNpcToEncounter}
            setIsUploadingNewFile={setIsUploadingNewFile}
          />
        </FileList>

        <CharacterList
          title='Encounter'
          characterEntries={allEncounterEntries}
          handleEntryClick={setActiveEncounter}
          activeCharacterID={activeEncounterID}
          deleteActiveCharacter={deleteActiveEncounter}
          createNewCharacter={createNewEncounter}
        />
      </div>

      <div className='jumplink-anchor' id='encounter' />
      { activeEncounter &&
        <div className='active-npc-boxes-container'>
          <ActiveNpcBox
            label={'Reinforcements'}
            condensed={true}
            npcList={npcListReinforcements}
            setNpcStatus={setNpcStatus}
          />
          <ActiveNpcBox
            label={'Casualties'}
            condensed={true}
            npcList={npcListCasualties}
            setNpcStatus={setNpcStatus}
          />
          <ActiveNpcBox
            label={'Active Combatants'}
            condensed={false}
            npcList={npcListActive}
            setNpcStatus={setNpcStatus}
            setActiveNpcFingerprint={setActiveNpcFingerprint}
          />
        </div>
      }

      { activeNpc && <>
        <div className='jumplink-anchor' id='npc' />
        <NpcMechSheet
          activeNpc={activeNpc}

          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}

          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
        />
      </>}

    </div>
  );
}




export default LancerNpcMode;
