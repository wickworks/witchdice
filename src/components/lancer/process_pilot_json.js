

function processPilotJson(pilotString) {
  const pilotJson = JSON.parse(pilotString)

  // const {id, name, callsign, mechsArray} = pilotJson;

  const pilot = {
    'id': pilotJson.id,
    'name': pilotJson.name,
    'callsign': pilotJson.callsign,
    'background': pilotJson.background,
    'level': pilotJson.level,
    'skills': pilotJson.skills,
    'mechs': processMechsArray(pilotJson.mechs)
  }

  console.log('PROCESSED PILOT JSON:', pilot);

  return pilot;
}

function processMechsArray(mechsArray) {
  return mechsArray.map(mechObject => {
    return {
      id: mechObject.id,
      name: mechObject.name,
    }
  })
}


export {
  processPilotJson,
}
