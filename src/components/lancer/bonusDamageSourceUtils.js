import { findFrameData, BONUS_TO_BURN_TAG } from './data.js';

function newBonusDamageSource(name, id, diceString, type = '', traitData = null) {
  return {
    name: name,
    id: id,
    diceString: diceString,
    type: type,
    trait: traitData,
  }
}

function findTraitFromFrame(frame, traitName) {
  const traitData = frame.traits.find(trait => trait.name === traitName);
  return traitData || null;
}

function newBonusDamageSourceFromFrame(frame, diceString, type = '', traitName = '') {
  return newBonusDamageSource(frame.name, frame.id, diceString, type, findTraitFromFrame(frame, traitName))
}

function getBonusDamageSourcesFromMech(mech) {
  var sources = [];

  const frame = findFrameData(mech.frame);
  if (!frame) return sources;

  switch (frame.id) {
    case 'mf_nelson':
      sources.push( newBonusDamageSourceFromFrame(frame, '1d6', '', 'Momentum') )
      break;

    case 'mf_deaths_head':
      sources.push( newBonusDamageSource('Mark for Death - Aux', 'mf_deaths_head_aux', '1d6', '') )
      sources.push( newBonusDamageSource('Mark for Death - Main', 'mf_deaths_head_main', '2d6', '') )
      sources.push( newBonusDamageSource('Mark for Death - Heavy', 'mf_deaths_head_heavy', '3d6', '') )
      break;

    case 'mf_mourning_cloak':
      sources.push( newBonusDamageSourceFromFrame(frame, '1d6', '', 'Hunter') )
      break;

    case 'mf_tokugawa':
      sources.push( newBonusDamageSourceFromFrame(frame, '3', 'Energy', 'Limit Break') )
      sources.push( newBonusDamageSource('Plasma Sheath', BONUS_TO_BURN_TAG, '', 'Burn', findTraitFromFrame(frame, 'Plasma Sheath')) )
      break;
  }

  return sources;
}


export { getBonusDamageSourcesFromMech };
