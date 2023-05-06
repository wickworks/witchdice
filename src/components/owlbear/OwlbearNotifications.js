
import OBR from "@owlbear-rodeo/sdk";

import {
  getRollDescription,
  processRollData,
  firebaseActionDataIntoRollData,
} from '../shared/DiceBag/DiceBagData.js';

export function latestActionToNotification(latestAction, actionToNotificationMap, setActionToNotificationMap) {
  // we already have a notification about it; close the old one
  if (latestAction.createdAt in actionToNotificationMap) {
    OBR.notification.close( actionToNotificationMap[latestAction.createdAt] )
  }

  let notificationMessage = ''
  if (latestAction.type === 'dicebag') notificationMessage = createDicebagNotification(latestAction)

  if (notificationMessage) {
    console.log('NOTIF: ', notificationMessage);

    // make a new notification and store its ID for this action
    OBR.notification.show(notificationMessage)
      .then(notifID => {
        setActionToNotificationMap( {...actionToNotificationMap, ...{[latestAction.createdAt]: notifID} } )
      })
  }
}


function createDicebagNotification(latestAction) {
  const rollData = firebaseActionDataIntoRollData(latestAction);
  let [summaryMode, summaryModeValue] = latestAction.conditions.split(' ')

  if (rollData.length > 1) {
    const resultTotal = processRollData(rollData, summaryMode, summaryModeValue)
    const resultDesc = getRollDescription(rollData, summaryMode, summaryModeValue)
    return `${latestAction.name} | ${resultDesc}⠀⠀⠀⠀⠀⦑ ${resultTotal} ⦒⠀⠀⠀`

  } else if (rollData.length === 1) {
    return `${latestAction.name} | ${rollData[0].dieType}⠀⠀⠀⠀⠀⦑ ${rollData[0].result} ⦒⠀⠀⠀`
  }

  return ''
}
