import { deepCopy } from '../../utils.js';

function processPilotJson(pilotString) {
  const pilotJson = JSON.parse(pilotString)

  // const {id, name, callsign, mechsArray} = pilotJson;
  //
  // const pilot = {
  //   'id': pilotJson.id,
  //   'name': pilotJson.name,
  //   'callsign': pilotJson.callsign,
  //   'background': pilotJson.background,
  //   'level': pilotJson.level,
  //   'skills': pilotJson.skills,
  //   'mechs': processMechsArray(pilotJson.mechs)
  // }

  // const pilot = deepCopy(pilotJson);

  console.log('PROCESSED PILOT JSON:', pilotJson);

  return pilotJson;
}

function processMechsArray(mechsArray) {
  // return mechsArray.map(mechObject => {
  //   return {
  //     id: mechObject.id,
  //     frame: mechObject.frame,
  //     name: mechObject.name,
  //     loadouts: mechObject.loadouts,
  //   }
  // })
}


export {
  processPilotJson,
}
