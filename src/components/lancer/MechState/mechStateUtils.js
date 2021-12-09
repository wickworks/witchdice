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


export const tickOvercharge = (currentOverchargeDie, direction) => {
  var index = OVERCHARGE_SEQUENCE.indexOf(String(currentOverchargeDie))
  index += direction
  index = Math.max(Math.min(index, OVERCHARGE_SEQUENCE.length-1), 0);
  return OVERCHARGE_SEQUENCE[index]
}
