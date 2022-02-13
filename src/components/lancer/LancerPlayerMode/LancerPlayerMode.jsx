import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import PilotDossier from './PilotDossier.jsx';
import FullRepairButton from './FullRepairButton/FullRepairButton.jsx';
import MechSheet from '../MechSheet/MechSheet.jsx';
import SquadPanel from '../SquadPanel/SquadPanel.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';

import {
  savePilotData,
  loadPilotData,
  deletePilotData,
  PILOT_PREFIX,
  STORAGE_ID_LENGTH,
} from '../lancerLocalStorage.js';

import { deepCopy } from '../../../utils.js';
import { findSystemData, findWeaponData } from '../lancerData.js';
import { getIDFromStorageName } from '../../../localstorage.js';
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
}) => {
  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

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
    const oldSelectedID = localStorage.getItem("lancer-selected-character");
    if (oldSelectedID) {
      const newActivePilot = pilotEntries.find(pilot => pilot.id.startsWith(oldSelectedID));
      if (newActivePilot) {
        setActivePilot(newActivePilot.id)
      }
    }
  }, []);

  // always select the last mech from a pilot
  // useEffect(() => {
  //   if (activePilot && activePilot.mechs.length > 0) {
  //     const lastMechIndex = activePilot.mechs.length - 1
  //     setActiveMechID(activePilot.mechs[lastMechIndex].id);
  //   }
  // }, [activePilotID]);

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
        setActiveMechID(newActivePilot.mechs[lastMechIndex].id);
      } else {
        setActiveMechID(null)
      }

      localStorage.setItem("lancer-selected-character", pilotID.slice(0,STORAGE_ID_LENGTH));
    }
  }

  const deleteActivePilot = () => {
    deletePilotData(activePilot)
    localStorage.setItem("lancer-selected-character", '');

    // remove from the current list of pilot entries
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    if (pilotIndex >= 0) {
      let newData = [...allPilotEntries]
      newData.splice(pilotIndex, 1)
      setAllPilotEntries(newData);
    }

    setActivePilotID(null);
    setActiveMechID(null);
  }

  // =============== MECH STATE ==================

  const updateMechState = (newMechData) => {
    let newPilotData = deepCopy(activePilot);
    const pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    const mechIndex = activePilot.mechs.findIndex(mech => mech.id === activeMechID)
    const loadout = newPilotData.mechs[mechIndex].loadouts[0]

    if (mechIndex >= 0 && pilotIndex >= 0) {
      Object.keys(newMechData).forEach(statKey => {
        // update something on the pilot, actually
        if (statKey === 'custom_counters' || statKey === 'counter_data') {
          newPilotData[statKey] = newMechData[statKey]

        // update the state of a system on the mech (modifying a value in a json tree is hell)
        } else if (statKey === 'systemUses') {
          const systemIndex = newMechData[statKey].index
          loadout.systems[systemIndex].uses = newMechData[statKey].uses
        } else if (statKey === 'systemDestroyed') {
          const systemIndex = newMechData[statKey].index
          loadout.systems[systemIndex].destroyed = newMechData[statKey].destroyed
        } else if (statKey === 'weaponDestroyed') {
          const mountSource = newMechData[statKey].mountSource
          const mountIndex = newMechData[statKey].mountIndex
          const weaponIndex = newMechData[statKey].weaponIndex
          let slot
          if (mountSource === 'mounts') {
            slot = loadout.mounts[mountIndex].slots[weaponIndex]
            if (!slot) slot = loadout.mounts[mountIndex].extra[0]
          } else if (mountSource === 'improved_armament') {
            slot = loadout.improved_armament.slots[weaponIndex]
            if (!slot) slot = loadout.improved_armament.extra[0]
          } else if (mountSource === 'integratedWeapon') {
            slot = loadout.integratedWeapon.slots[weaponIndex]
            if (!slot) slot = loadout.integratedWeapon.extra[0]
          } else if (mountSource === 'integratedMounts') {
            // integrated mounts can't be destroyed; only including here for thouroughness
          }
          slot.weapon.destroyed = newMechData[statKey].destroyed
        } else if (statKey === 'repairAllWeaponsAndSystems') {
          // - systems - //
          [loadout.systems, loadout.integratedSystems].forEach(systemArray => {
            systemArray.forEach(system => {
              // Repair
              system.destroyed = false
              // Restore limited uses
              const systemData = findSystemData(system.id)
              if (systemData && systemData.tags) {
                const limitedTag = systemData.tags.find(tag => tag.id === 'tg_limited')
                if (limitedTag) system.uses = limitedTag.val
              }
            })
          });
          // - weapons - //
          [loadout.mounts, [loadout.improved_armament], [loadout.integratedWeapon]].forEach(weaponMounts => {
            weaponMounts.forEach(mount => {
              mount.slots.forEach(slot => {
                if (slot.weapon) {
                  // Repair
                  slot.weapon.destroyed = false
                  // Restore limited uses
                  const weaponData = findWeaponData(slot.weapon.id)
                  if (weaponData && weaponData.tags) {
                    const limitedTag = weaponData.tags.find(tag => tag.id === 'tg_limited')
                    if (limitedTag) slot.weapon.uses = limitedTag.val
                  }
                }
              })
            })
          });

        // update a mech value
        } else if (statKey === 'conditions') {
          newPilotData.mechs[mechIndex][statKey] = newMechData[statKey]
        } else {
          newPilotData.mechs[mechIndex][statKey] = parseInt(newMechData[statKey])
        }
      });

      // update it in localstorage
      savePilotData(newPilotData)

      setTriggerRerender(!triggerRerender)

    } else {
      console.error('Could not find mech or pilot to save it!', newMechData)
    }
  }



  return (
    <div className='LancerPlayerMode'>

      { activePilot && <JumplinkPanel partyConnected={partyConnected} /> }

      <FileList
        title='Pilot'
        extraClass='pilots'
        allFileEntries={allPilotEntries}
        setActiveFileID={setActivePilot}
        activeFileID={activePilotID}
        deleteActiveFile={deleteActivePilot}
        onFileUpload={uploadPilotFile}
        onFilePaste={parsedJson => createNewPilot(parsedJson)}
      >
        Upload a pilot data file (.json) from
        <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
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
              handleEntryClick={setActiveMechID}
              activeCharacterID={activeMechID}
              deleteEnabled={false}
            />
          </PlainList>
        </>
      }

      <div className='jumplink-anchor' id='mech' />
      { activeMech &&
        <>
          <FullRepairButton activeMech={activeMech} activePilot={activePilot} updateMechState={updateMechState} />
          <MechSheet
            activeMech={activeMech}
            activePilot={activePilot}
            updateMechState={updateMechState}

            setPartyLastAttackKey={setPartyLastAttackKey}
            setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
            setRollSummaryData={setRollSummaryData}
          />
        </>
      }

      <div className='jumplink-anchor' id='squad' />
      { partyConnected &&
        <SquadPanel
          activeMech={activeMech}
          activePilot={activePilot}

          partyConnected={partyConnected}
          partyRoom={partyRoom}
        />
      }

    </div>
  );
}




export default LancerPlayerMode;
