import {
  loadLocalData,
  saveLocalData,
  getIDFromStorageName,
  getStorageName,
} from '../../localstorage.js';

const PILOT_PREFIX = 'pilot';
const LCP_PREFIX = 'lcp';
const STORAGE_ID_LENGTH = 6;


function saveLcpData(contentPack) {
  saveLocalData(LCP_PREFIX, contentPack.id.slice(0,STORAGE_ID_LENGTH), contentPack.manifest.name, contentPack);
}

function loadLcpData(lcpID) {
  return loadLocalData(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH));
}

function deleteLcpData(lcpID, lcpName) {
  const storageName = getStorageName(LCP_PREFIX, lcpID.slice(0,STORAGE_ID_LENGTH), lcpName);
  localStorage.removeItem(storageName);
}

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


export {
  saveLcpData,
  loadLcpData,
  deleteLcpData,
  savePilotData,
  loadPilotData,
  deletePilotData,

  PILOT_PREFIX,
  LCP_PREFIX,
  STORAGE_ID_LENGTH,
}
