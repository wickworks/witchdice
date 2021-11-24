const allWeapons = require('./lancer-data-master/lib/weapons.json');
const allPilotSkills = require('./lancer-data-master/lib/skills.json');
const allTags = require('./lancer-data-master/lib/tags.json');
const allFrames = require('./lancer-data-master/lib/frames.json');

const BONUS_TO_BURN_TAG = 'mf_tokugawa_dz'

const DAMAGE_MODIFIERS = {
  double: false,
  half: false,
  average: false,
  bonusToBurn: false,
}

const MAX_BONUS = 9; // either added or dice rolled
const GENERIC_BONUS_SOURCE = {
  name: 'Bonus damage',
  diceString: `${MAX_BONUS}d6+${MAX_BONUS}`, // we roll the max because user might increase it post-roll
  type: '',
  id: 'generic',
}

const getGrit = (pilot) => { return Math.ceil(pilot.level * .5) }

// turns '10d6+4' into {count: 10, dietype: 6, bonus: 4}
const processDiceString = (diceString) => {
  var dice = String(diceString)

  var count = 0;
  var dietype = 'd0';
  var bonus = 0;

  if (dice) {
    const bonusIndex = dice.indexOf('+');
    const dieIndex = dice.indexOf('d');

    // if it has neither d or +, just try to parse it as an int
    if (bonusIndex < 0 && dieIndex < 0) {
      bonus = parseInt(dice);

    } else {
      // slice off the bonus
      if (bonusIndex >= 0) {
        bonus = parseInt(dice.slice(bonusIndex+1))
        dice = dice.slice(0, bonusIndex)
      }

      // parse the die count and type
      if (dieIndex >= 0) {
        count = parseInt(dice.slice(0, dieIndex));
        dietype = parseInt(dice.slice(dieIndex+1));
      }
    }
  }

  return {count: count, dietype: dietype, bonus: bonus}
}

const findTagData = (tagID) => {
  const tagData = allTags.find(tag => tag.id === tagID);
  return tagData;
}

const findTagOnWeapon = (weaponData, tagID) => {
  if (weaponData.tags) {
    const weaponTag = weaponData.tags.find(weapontag => weapontag.id === tagID);
    return weaponTag;
  }
  return null;
}

const getTagName = (tag) => {
  const tagData = findTagData(tag.id)

  if (tagData) {
    const tagVal = tag.val || 0;
    const tagString = tagData.name.replace('{VAL}', tagVal)
    return tagString;

  } else {
    return tag.id
  }
}

// Gets the type of damage dealt by the weapon, or Variable if multiple or none.
const defaultWeaponDamageType = (weaponData) => {
  const VARIABLE_DAMAGE_TYPES = ['Kinetic', 'Explosive', 'Energy']

  var damageType = '';
  if (weaponData.damage) {
    weaponData.damage.forEach(damageValAndType => {
      // is this one of the types that bonus damage can normally become?
      if (VARIABLE_DAMAGE_TYPES.includes(damageValAndType.type)) {
        // assign it to the first one we see
        if (damageType === '') {
          damageType = damageValAndType.type

        // if we see another type, switch it back to variable
        } else if (damageType !== damageValAndType.type) {
          damageType = 'Variable'
        }
      }
    });
  }

  return damageType || 'Variable';
}


const findFrameData = (frameID) => {
  const frameData = allFrames.find(frame => frame.id === frameID);
  return frameData;
}

const findWeaponData = (weaponID) => {
  const weaponData = allWeapons.find(weapon => weapon.id === weaponID);
  return weaponData;
}

export {
  allPilotSkills,
  getGrit,
  processDiceString,
  findTagData,
  findTagOnWeapon,
  getTagName,
  defaultWeaponDamageType,
  findFrameData,
  findWeaponData,
  GENERIC_BONUS_SOURCE,
  MAX_BONUS,
  DAMAGE_MODIFIERS,
  BONUS_TO_BURN_TAG,
}
