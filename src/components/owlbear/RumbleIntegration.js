import OBR from "@owlbear-rodeo/sdk";

export const sendTextToRumbleChatbox = (actionData) => {
  let text = ''

  if (actionData.type === 'text') {
    text = `${actionData.title}: ${actionData.message}`
  }

  text = replaceBrWithLinebreaks(text)
  const metadataUpdate = {}
  metadataUpdate['com.battle-system.friends/metadata_chatlog'] = {
    chatlog: text,
    sender: actionData.name,
    created: new Date().toISOString(),
    targetId: '0000'
  }

  console.log('metadataUpdate text: ', text)
  if (OBR.isAvailable && text) {
    console.log('OBR is available! Setting metadata.')
    OBR.player.setMetadata(metadataUpdate)
  }
}


const replaceBrWithLinebreaks = (text) => {
  return text.replace('<br>','\n')
}
