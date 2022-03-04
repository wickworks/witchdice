import React, { useState, useEffect } from 'react';
import { FileList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import { CharacterList } from '../../shared/CharacterAndMonsterList.jsx';
import { ActiveNpcBox, CondensedNpcBox } from './ActiveNpcBox.jsx';
import EncounterControls from './EncounterControls.jsx';
import NpcMechSheet from './NpcMechSheet.jsx';
import NpcRoster from './NpcRoster.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';

import { deepCopy, capitalize } from '../../../utils.js';
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

import { findNpcFeatureData, } from '../lancerData.js';
import { getStat, getMarkerForNpcID, } from './npcUtils.js';

import './LancerNpcMode.scss';

const emptyEncounter = {
  id: '',
  name: '',
  active: [],
  reinforcements: [],
  casualties: [],
  allNpcs: {},
  roundCount: 1,
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
  setDistantDicebagData,
}) => {
  //
  const [allEncounterEntries, setAllEncounterEntries] = useState([])
  const [npcLibrary, setNpcLibrary] = useState({})

  const [activeEncounterID, setActiveEncounterID] = useState(null)
  const [activeNpcFingerprint, setActiveNpcFingerprint] = useState(null)

  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  const activeEncounter = activeEncounterID && loadEncounterData(activeEncounterID);
  const activeNpc = (activeEncounter && activeNpcFingerprint) && activeEncounter.allNpcs[activeNpcFingerprint];

  // console.log('activeEncounter',activeEncounter);

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

    // // If we have no encounters, make a new one
    // if (encounterEntries.length === 0) {
    //   const newEncounter = buildNewEncounter()
    //   encounterEntries.push(newEncounter)
    //   setActiveEncounterID(newEncounter.id)
    //   saveEncounterData(newEncounter)
    // }

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

    let newNpcLibrary = {...npcLibrary}
    newNpcLibrary[npc.id] = npc;

    // save the whole library to state & localstorage
    setNpcLibrary(newNpcLibrary)
    localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));
  }

  const uploadNpcFile = e => {
    const fileName = e.target.files[0].name

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {

      // compcon backups — have a lot of stuff we don't need
      if (fileName.endsWith('.compcon')) {
        console.log('loaded a compcon app!');
        const compconBackup = JSON.parse(e.target.result)
        console.log('compconBackup',compconBackup);
        const npcFile = compconBackup.find(backupFile => backupFile.filename.startsWith('npcs'))
        console.log('npcFile',npcFile);
        const npcArray = JSON.parse(npcFile.data)
        console.log('npcArray',npcArray);

        // create ALL the new npcs & save them to localstorage
        let newNpcLibrary = {...npcLibrary}
        // npcArray.forEach(npc => newNpcLibrary[npc.id] = npc );
        npcArray.forEach(npc => {
          console.log('NPC:');
          console.log(npc);
          newNpcLibrary[npc.id] = npc
        });
        setNpcLibrary(newNpcLibrary)
        localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));

      // single json npc; just create it
      } else {
        createNewNpc( JSON.parse(e.target.result) )
      }
    };
  }



  const addNpcToEncounter = (npcId) => {
    const npc = npcLibrary[npcId]

    if (npc) {
      let newNpc = deepCopy(npc)
      // need a new id so we can tell instances apart
      newNpc.fingerprint = `${getMarkerForNpcID(newNpc.id, activeEncounter.allNpcs)}-${getRandomFingerprint()}`

      let newEncounter = deepCopy(activeEncounter)
      newEncounter.reinforcements.push(newNpc.fingerprint)
      newEncounter.allNpcs[newNpc.fingerprint] = newNpc

      saveEncounterData(newEncounter)
      setTriggerRerender(!triggerRerender)
    }
  }

  const removeNpcFromEncounter = (npcFingerprint) => {
    let newEncounter = deepCopy(activeEncounter)

    // drop the data
    delete newEncounter.allNpcs[npcFingerprint]

    // remove it from all statuses
    newEncounter.active = newEncounter.active.filter(id => id !== npcFingerprint)
    newEncounter.reinforcements = newEncounter.reinforcements.filter(id => id !== npcFingerprint)
    newEncounter.casualties = newEncounter.casualties.filter(id => id !== npcFingerprint)

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }


  // =============== ENCOUNTERS ==================

  function buildNewEncounter() {
    let newEncounter = deepCopy(emptyEncounter)
    newEncounter.id = `${getRandomFingerprint()}`
    newEncounter.name = capitalize(`${randomWords({exactly: 1, maxLength: 5})} ${randomWords(1)}`)

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

  const setNpcStatus = (npcFingerprint, status) => {
    let newEncounter = {...activeEncounter}

    // remove it from all previous statuses
    newEncounter.active = newEncounter.active.filter(id => id !== npcFingerprint)
    newEncounter.reinforcements = newEncounter.reinforcements.filter(id => id !== npcFingerprint)
    newEncounter.casualties = newEncounter.casualties.filter(id => id !== npcFingerprint)

    // add it to the new list
    newEncounter[status].push(npcFingerprint)

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)

    // if it was selected, deselect it
    if (activeNpcFingerprint === npcFingerprint) setActiveNpcFingerprint(null)
  }

  const setCurrentRound = (newRound) => {
    let newEncounter = {...activeEncounter}
    newEncounter.roundCount = newRound

    // reset all npc activations
    if (newRound > activeEncounter.roundCount) {
      Object.keys(newEncounter.allNpcs).forEach(fingerprint => {
        let npc = newEncounter.allNpcs[fingerprint]
        npc.currentStats['activations'] = getStat('activations', npc)
      })
    }

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }

  const restartEncounter = () => {
    let newEncounter = deepCopy(activeEncounter)

    // Reset round counter
    newEncounter.roundCount = 1

    // Heal all NPCs
    Object.keys(newEncounter.allNpcs).forEach(fingerprint => {
      const npc = newEncounter.allNpcs[fingerprint]

      const healedState = {
        repairAllWeaponsAndSystems: true,
        conditions: [],
        custom_counters: [],
        counter_data: [],
        overshield: 0,
        current_hp: getStat('hp', npc),
        current_heat: 0,
        burn: 0,
        current_structure: getStat('structure', npc),
        current_stress: getStat('stress', npc),
      }
      applyUpdatesToNpc(healedState, npc)
    })

    // Move them all back to "reinforcements"
    newEncounter.reinforcements.push(...newEncounter.active)
    newEncounter.reinforcements.push(...newEncounter.casualties)
    newEncounter.active = []
    newEncounter.casualties = []

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }

  const setEncounterName = (newName) => {
    let newEncounter = {...activeEncounter}
    newEncounter.name = newName

    let newEncounterEntries = deepCopy(allEncounterEntries)
    let oldEntry = newEncounterEntries.find(entry => entry.id === newEncounter.id)
    oldEntry.name = newEncounter.name

    saveEncounterData(newEncounter)
    setAllEncounterEntries(newEncounterEntries)
    setTriggerRerender(!triggerRerender)
  }

  // applies the changes to an npc object ~ in place ~
  function applyUpdatesToNpc(newMechData, newNpc) {

    Object.keys(newMechData).forEach(statKey => {
      // console.log('statKey:',statKey, ' : ', newMechData[statKey]);
      switch (statKey) {
        // attributes outside of the currentStats
        case 'conditions':
        case 'custom_counters':
        case 'counter_data':
        case 'overshield':
        case 'burn':
          newNpc[statKey] = newMechData[statKey]
          break;

        // equipment features
        case 'systemCharged':
          newNpc.items[newMechData[statKey].index].charged = newMechData[statKey].charged
          break;
        case 'systemDestroyed':
          newNpc.items[newMechData[statKey].index].destroyed = newMechData[statKey].destroyed
          break;
        case 'weaponUses':
        case 'weaponLoaded':
        case 'weaponCharged':
        case 'weaponDestroyed':
          // find the item that generates this weapon
          const weaponItems = newNpc.items.filter(item => findNpcFeatureData(item.itemID).type === 'Weapon')
          let weaponItem = weaponItems[newMechData[statKey].mountIndex]
          if (weaponItem) {
            if ('destroyed' in newMechData[statKey]) weaponItem.destroyed = newMechData[statKey].destroyed
            if ('uses' in newMechData[statKey]) weaponItem.uses = newMechData[statKey].uses
            if ('loaded' in newMechData[statKey]) weaponItem.loaded = newMechData[statKey].loaded
          }
          break;
        case 'repairAllWeaponsAndSystems':
          newNpc.items.forEach(item => {
            // item.uses = x // how are we doing npc system uses?
            item.destroyed = false
          });

        // not relavant for npcs
        case 'current_overcharge':
        case 'current_core_energy':
        case 'current_repairs':
          console.log('    not relavant for npcs');
          break;

        default: // change something in currentStats
          // remove the 'current_' for keys that have it
          const keyConversion = {
            'current_hp': 'hp',
            'current_heat': 'heatcap',
            'current_structure': 'structure',
            'current_stress': 'stress',
            'activations': 'activations'
          }
          const convertedKey = keyConversion[statKey] || statKey
          newNpc.currentStats[convertedKey] = newMechData[statKey]

          break;
      }
    })
  }

  const updateNpcState = (newMechData, npcFingerprint = null) => {
    // default to the current fingerprint if none is given
    if (!npcFingerprint) npcFingerprint = activeNpcFingerprint

    let newEncounterData = {...activeEncounter}
    let newNpc = deepCopy(newEncounterData.allNpcs[npcFingerprint])

    if (newNpc) {
      applyUpdatesToNpc(newMechData, newNpc)

      // console.log('newNpc',newNpc);
      newEncounterData.allNpcs[newNpc.fingerprint] = newNpc

      saveEncounterData(newEncounterData)
      setTriggerRerender(!triggerRerender)
    }
  }


  const npcListActive = activeEncounter && activeEncounter.active.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListReinforcements = activeEncounter && activeEncounter.reinforcements.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListCasualties = activeEncounter && activeEncounter.casualties.map(fingerprint => activeEncounter.allNpcs[fingerprint])

  // =============== JUMPLINKS ==================

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

      <div className='encounter-management'>
        <div className='jumplink-anchor' id='roster' />
        <div className='encounter-and-roster-container'>
          <FileList
            title='NPC'
            extraClass='npcs'
            acceptFileType='application/JSON,.compcon'
            onFileUpload={uploadNpcFile}
            isUploadingNewFile={isUploadingNewFile}
            setIsUploadingNewFile={setIsUploadingNewFile}
            instructions={
              <>
                Upload a npc data file (.json) - OR - a full data backup (.compcon) from
                <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
              </>
            }
          >
            <NpcRoster
              npcLibrary={npcLibrary}
              addNpcToEncounter={addNpcToEncounter}
              setIsUploadingNewFile={setIsUploadingNewFile}
              hasActiveEncounter={!!activeEncounter}
            />
          </FileList>

          <div className='encounter-list-and-info'>
            <CharacterList
              title='Encounter'
              characterEntries={allEncounterEntries}
              handleEntryClick={setActiveEncounter}
              activeCharacterID={activeEncounterID}
              deleteActiveCharacter={deleteActiveEncounter}
              createNewCharacter={createNewEncounter}
            />

            { activeEncounter &&
              <EncounterControls
                activeEncounter={activeEncounter}
                setEncounterName={setEncounterName}
                restartEncounter={restartEncounter}
              />
            }
          </div>
        </div>

        <div className='jumplink-anchor' id='encounter' />
        { activeEncounter &&
          <div className='active-npc-boxes-container'>
            <CondensedNpcBox
              label={'~ Reinforcements ~'}
              npcList={npcListReinforcements}
              setNpcStatus={setNpcStatus}
              activeNpcFingerprint={activeNpcFingerprint}
              removeNpcFromEncounter={removeNpcFromEncounter}
            />
            <CondensedNpcBox
              label={'~ Casualties ~'}
              npcList={npcListCasualties}
              setNpcStatus={setNpcStatus}
              activeNpcFingerprint={activeNpcFingerprint}
              removeNpcFromEncounter={removeNpcFromEncounter}
            />
            <ActiveNpcBox
              label={'Active Combatants'}
              npcList={npcListActive}
              setNpcStatus={setNpcStatus}
              setActiveNpcFingerprint={setActiveNpcFingerprint}
              activeNpcFingerprint={activeNpcFingerprint}
              updateNpcState={updateNpcState}
              currentRound={activeEncounter.roundCount}
              setCurrentRound={setCurrentRound}
            />
          </div>
        }
      </div>

      { activeNpc && <>
        <div className='jumplink-anchor' id='npc' />
        <NpcMechSheet
          activeNpc={activeNpc}
          updateNpcState={updateNpcState}

          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}
          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
          setDistantDicebagData={setDistantDicebagData}
        />
      </>}
    </div>
  );
}




export default LancerNpcMode;
