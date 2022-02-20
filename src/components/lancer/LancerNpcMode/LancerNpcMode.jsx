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
} from '../lancerLocalStorage.js';

import { getIDFromStorageName, getRandomFingerprint } from '../../../localstorage.js';


// import npcJson from './GRAVITYOFTHESITUATION.json';
import npcJson from './THEWORMS.json';

import './LancerNpcMode.scss';

const emptyEncounter = {
  id: '',
  name: '',
  active: [],
  reinforcements: [],
  casualties: [],
  npcData: {},
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
  const [allNpcData, setAllNpcData] = useState([])

  const [activeEncounterID, setActiveEncounterID] = useState(null)
  const [activeNpcID, setActiveNpcID] = useState(null)

  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  const activeEncounter = activeEncounterID && loadEncounterData(activeEncounterID);
  const activeNpc = (activeEncounter && activeNpcID) && activeEncounter.allNpcData.find(npc => npc.id === activeNpcID);


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
    setActiveNpcID(null);
  }

  const setActiveEncounter = (encounterID) => {
    const newActiveEncounter = encounterID && loadEncounterData(encounterID)
    if (newActiveEncounter) {
      setActiveEncounterID(encounterID);
      localStorage.setItem(SELECTED_ENCOUNTER_KEY, encounterID.slice(0,STORAGE_ID_LENGTH));
    }
  }


  const npcListActive = activeEncounter && activeEncounter.active.map(id => activeEncounter.npcData[id])
  const npcListReinforcements = activeEncounter && activeEncounter.reinforcements.map(id => activeEncounter.npcData[id])
  const npcListCasualties = activeEncounter && activeEncounter.casualties.map(id => activeEncounter.npcData[id])


  const updateActiveNpcState = () => {

  }

  // =============== NPC ROSTER ==================




  const createNewNpc = () => {

  }

  const loadNpcData = (npcId) => {
    return npcJson;
  }

  const uploadNpcFile = () => {

  }

  const addNpcToEncounter = (npcId) => {
    console.log('Adding npc to encounter', npcId);
    const npcData = loadNpcData(npcId)

    if (npcData) {
      let newEncounter = deepCopy(activeEncounter)
      newEncounter.reinforcements.push(npcId)
      newEncounter.npcData[npcId] = npcData

      saveEncounterData(newEncounter)
      setTriggerRerender(!triggerRerender)
    }
  }

  // --- JUMPLINKS --
  let jumplinks = ['roster']
  if (activeNpc) {
    jumplinks.push('npc')
    jumplinks.push('weapons')
  }
  jumplinks.push('dicebag')


  return (
    <div className='LancerNpcMode'>

      <JumplinkPanel jumplinks={jumplinks} partyConnected={partyConnected} />

      <div className='encounter-and-roster-container'>
        <div className='jumplink-anchor' id='roster' />


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
            allNpcData={allNpcData}
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

      { activeEncounter &&
        <div className='active-npc-boxes-container'>
          <ActiveNpcBox
            label={'Reinforcements'}
            condensed={true}
            npcList={npcListReinforcements}
          />
          <ActiveNpcBox
            label={'Casualties'}
            condensed={true}
            npcList={npcListCasualties}
          />
          <ActiveNpcBox
            label={'Active Combatants'}
            condensed={false}
            npcList={npcListActive}
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
