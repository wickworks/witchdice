

const allWeapons = require('./lancer-data-master/lib/weapons.json');
const allPilotSkills = require('./lancer-data-master/lib/skills.json');
const allTags = require('./lancer-data-master/lib/tags.json');


const getGrit = (pilot) => { return Math.ceil(pilot.level * .5) }


export {
  allWeapons,
  allPilotSkills,
  allTags,
  getGrit,
}
