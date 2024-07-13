import OBR from "@owlbear-rodeo/sdk";
import { processRollData, firebaseActionDataIntoRollData } from '../shared/DiceBag/DiceBagData.js';

export const sendTextToRumbleChatbox = (actionData) => {
  let text = ''

  if (actionData.type === 'text') {
    text = `${actionData.title}: ${actionData.message}`
  } else if (actionData.type === 'attack') {
    // text = parseAttackToPlaintext(actionData)
    return // attacks are not yet supported
  } else if (actionData.type === 'dicebag') {
    text = parseDicebagToPlaintext(actionData)
  }

  const metadataUpdate = {}
  metadataUpdate['com.battle-system.friends/metadata_chatlog'] = {
    chatlog: replaceBrWithLinebreaks(text),
    sender: actionData.name,
    created: new Date().toISOString(),
    targetId: '0000'
  }

  console.log('Rumble chatbox metadataUpdate text: ', text)
  if (OBR && OBR.isAvailable && text) {
    console.log('OBR is available! Setting metadata.')
    OBR.player.setMetadata(metadataUpdate)
  }
}


const replaceBrWithLinebreaks = (text) => {
  return text.replace('<br>','\n')
}

// copied from witchdice-discord
function parseDicebagToPlaintext(actionData) {
  const {conditions, updatedAt} = actionData;

  // these are put together into a string
  let [summaryMode, summaryModeValue] = conditions.split(' ')
  summaryModeValue = parseInt(summaryModeValue) || 1

  // convert the 'roll-X' keys into roll data:
  // [ {'dieType': '20', 'result': '1'}, {'dieType': '20', 'result': '12'}, ... ]
  let rollData = firebaseActionDataIntoRollData(actionData);

  if (rollData.length === 1) {
    return ` ⦑  ${rollData[0].result}  ⦒      ${rollData[0].dieType}`
  } else { // complicated roll
    const joinText = (actionData.conditions == 'total') ? ` + ` : ', '

    const rollsText = rollData.map(roll => {
      return `${roll.result} (${roll.dieType})`
    }).join(joinText)

    const summaryModeText = summaryMode !== 'total' ? ` | ${summaryMode} ${summaryModeValue}` : ''

    const resultTotal = processRollData(rollData, summaryMode, summaryModeValue)
    return ` ⦑  ${String(resultTotal)}  ⦒     ${rollsText}${summaryModeText}`
  }
}


function parseAttackToPlaintext(actionData) {
  console.log('actionData', actionData);
  return ''
}
