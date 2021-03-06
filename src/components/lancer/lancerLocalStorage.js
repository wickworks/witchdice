import {
  loadLocalData,
  saveLocalData,
  getStorageName,
} from '../../localstorage.js';

export const PILOT_PREFIX = 'pilot';
export const LCP_PREFIX = 'lcp';
export const ENCOUNTER_PREFIX = 'encounter';
export const STORAGE_ID_LENGTH = 6;
export const NPC_LIBRARY_NAME = 'lancer-npcs'
export const SELECTED_CHARACTER_KEY = "lancer-selected-character"
export const LANCER_SQUAD_MECH_KEY = 'lancer-squad-mech' // a summary for the squad data

export function saveLcpData(contentPack) {
  saveLocalData(LCP_PREFIX, contentPack.id.slice(0,STORAGE_ID_LENGTH), contentPack.manifest.name, contentPack);
}

export function loadLcpData(lcpID) {
  return loadLocalData(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH));
}

export function deleteLcpData(lcpID, lcpName) {
  const storageName = getStorageName(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH), lcpName);
  localStorage.removeItem(storageName);
}



export function savePilotData(pilot) {
  saveLocalData(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name, pilot);
}

export function loadPilotData(pilotID) {
  return loadLocalData(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH));
}

export function deletePilotData(pilotID, pilotName) {
  const storageName = getStorageName(PILOT_PREFIX, pilotID.slice(0,STORAGE_ID_LENGTH), pilotName);
  localStorage.removeItem(storageName);
}

export const saveMechStateToLocalStorage = (mechState, activePilot, activeMech) => {
  var pilotData = loadPilotData(activePilot.id)
  const mechIndex = pilotData.mechs.findIndex(mech => mech.id === activeMech.id)

  if (mechIndex >= 0) {
    Object.keys(mechState).forEach(statKey => {
      pilotData.mechs[mechIndex][statKey] = parseInt(mechState[statKey])
    });
    savePilotData(pilotData)
  } else {
    console.error('Could not find mech ', activeMech.id, ' for pilot!')
  }
}


export function saveEncounterData(encounter) {
  saveLocalData(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name, encounter);
}

export function loadEncounterData(encounterID) {
  return loadLocalData(ENCOUNTER_PREFIX, encounterID.slice(0,STORAGE_ID_LENGTH));
}

export function deleteEncounterData(encounter) {
  const storageName = getStorageName(ENCOUNTER_PREFIX, encounter.id.slice(0,STORAGE_ID_LENGTH), encounter.name);
  localStorage.removeItem(storageName);
}

export const saveNpcStateToLocalStorage = (mechState, activePilot, activeMech) => {
  var pilotData = loadPilotData(activePilot.id)
  const mechIndex = pilotData.mechs.findIndex(mech => mech.id === activeMech.id)

  if (mechIndex >= 0) {
    Object.keys(mechState).forEach(statKey => {
      pilotData.mechs[mechIndex][statKey] = parseInt(mechState[statKey])
    });
    savePilotData(pilotData)
  } else {
    console.error('Could not find mech ', activeMech.id, ' for pilot!')
  }
}
