

const allWeapons = require('./lancer-data-master/lib/weapons.json');
const allPilotSkills = require('./lancer-data-master/lib/skills.json');
const allTags = require('./lancer-data-master/lib/tags.json');


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

export {
  allWeapons,
  allPilotSkills,
  getGrit,
  processDiceString,
  findTagData,
  findTagOnWeapon,
  getTagName,
}
