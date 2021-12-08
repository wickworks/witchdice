// import {
//   getRandomInt,
//   deepCopy
// } from '../../../utils.js';

import {
  OVERCHARGE_SEQUENCE
} from '../lancerData.js';


export function getMechMaxHP(activeMech, activePilot, frameData) {

  return parseInt(frameData.stats.hp);
}

export function getMechMaxHeatCap(activeMech, activePilot, frameData) {

  return parseInt(frameData.stats.heatcap);
}


export const tickUpOvercharge = (currentOverchargeDie) => {
  console.log('tickUpOvercharge currentOverchargeDie', currentOverchargeDie);
  var index = Math.max(OVERCHARGE_SEQUENCE.indexOf(String(currentOverchargeDie)), 0);
  index += 1
  index = Math.min(index, OVERCHARGE_SEQUENCE.length-1)
  console.log('index', index);
  console.log('OVERCHARGE_SEQUENCE[index]', OVERCHARGE_SEQUENCE[index]);
  return OVERCHARGE_SEQUENCE[index]
}
