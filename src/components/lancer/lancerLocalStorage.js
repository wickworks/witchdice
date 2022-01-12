import {
  loadLocalData,
  saveLocalData,
  getStorageName,
} from '../../localstorage.js';

export const PILOT_PREFIX = 'pilot';
export const LCP_PREFIX = 'lcp';
export const STORAGE_ID_LENGTH = 6;


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

export function deletePilotData(pilot) {
  const storageName = getStorageName(PILOT_PREFIX, pilot.id.slice(0,STORAGE_ID_LENGTH), pilot.name);
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
