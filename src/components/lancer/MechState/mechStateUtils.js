// import {
//   getRandomInt,
//   deepCopy
// } from '../../../utils.js';

// import {
//   findTagOnWeapon,
//   processDiceString,
//   defaultWeaponDamageType,
//   isDamageRange,
//   GENERIC_BONUS_SOURCE
// } from '../lancerData.js';


export function getMechMaxHP(activeMech, activePilot, frameData) {

  return parseInt(frameData.stats.hp);
}

export function getMechMaxHeatCap(activeMech, activePilot, frameData) {

  return parseInt(frameData.stats.heatcap);
}
