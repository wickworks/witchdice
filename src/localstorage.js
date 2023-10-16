

// ======================== SAVE / LOAD TO LOCALSTORAGE =======================

const DEFAULT_ID_LENGTH = 6;

function getStorageName(prefix, id, name) {
  return `${prefix}-${id}-${name}`;
}

// cuts out the "crafter-XXXXXX-"
function getNameFromStorageName(prefix, storageName, idLength = DEFAULT_ID_LENGTH) {
  const precedingLength = prefix.length + idLength + 2;
  return String(storageName).slice(precedingLength);
}

// cuts out the "character-" and "-NAME"
function getIDFromStorageName(prefix, storageName, idLength = DEFAULT_ID_LENGTH) {
  const precedingLength = prefix.length + 1;
  return String(storageName).slice(precedingLength, precedingLength+idLength);
}

function saveLocalData(prefix, id, newName, localData, idLength = DEFAULT_ID_LENGTH) {
  if (id <= 0 || newName.length <= 0) {
    return null;
  }
  console.log('saving', prefix, newName, '   ', id);

  const storageName = getStorageName(prefix, id, newName);
  localStorage.setItem(storageName, JSON.stringify(localData));

  // has the name changed? if so, delete the old one
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${prefix}-`)) {
      const localID = getIDFromStorageName(prefix, key, idLength)
      const localName = getNameFromStorageName(prefix, key, idLength)

      if (String(localID) === String(id) && localName !== newName) {
        console.log('name changed from "',localName,'" to "',newName,'"; updating key names');
        localStorage.removeItem(key)
      }
    }
  }
}

function loadLocalData(prefix, id, idLength = DEFAULT_ID_LENGTH) {
  let stringedID = String(id)

  // find the key with this ID
  let storageName = null;
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    const localID = getIDFromStorageName(prefix, key, idLength)
    if (localID === stringedID) {
      storageName = key;
      // console.log('found id for', storageName);
    }
  }

  // load up that local data
  if (storageName) {
    const loadedData = localStorage.getItem(storageName);

    if (loadedData) {
      return JSON.parse(loadedData);;
    }
  }

  console.log('Tried to load',prefix,'   id [', stringedID, '], but failed!');
  return null;
}

// generates a random 6-digit int from 200000 to 999999 (monster IDs are ordered)
function getRandomFingerprint() {
  let rand = Math.random();
  rand = rand * 799999
  rand = rand + 200000
  return Math.floor(rand)
}

function convertLocalDataToJson() {
  // find the key with this ID
  let jsonObject = {};
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);

    let saveKey = false;

    // whitelist
    const savePrefixes = ['pilot-', 'lcp-', 'encounter-', 'crafter-', 'project-', 'party_name', 'version']
    saveKey = savePrefixes.some((prefix) => key.startsWith(prefix))

    // conditional whitelist
    const CHARACTER_PREFIX = 'character-';
    saveKey = saveKey || (key.startsWith(CHARACTER_PREFIX) && getIDFromStorageName(CHARACTER_PREFIX, key) > 120000)

    if (saveKey) jsonObject[key] = localStorage.getItem(key)
  }

  return JSON.stringify(jsonObject);
}

export {
  loadLocalData,
  saveLocalData,
  getStorageName,
  getNameFromStorageName,
  getIDFromStorageName,
  getRandomFingerprint,
  convertLocalDataToJson,
};
