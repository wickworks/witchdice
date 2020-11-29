
const allMediaTypes = [
  'Crystals',
  'Wood',
  'Drafting',
  'Living Arts',
  'Metals',
  'Textiles'
]

const allTechniques = {
  finishingTouches: {name: 'Finishing Touches', desc: 'Reroll one d6, remove a flaw, or add a boon.', prereq: [2]},
  secondNature: {name: 'Second Nature', desc: 'Forgo rolls for easy projects.', prereq: [3]},
  insightfulTalent: {name: 'Insightful Talent', desc: 'Double stamina cost of a project to roll twice.', prereq: [5]},

  aStitchInTime: {name: 'A Stitch In Time', desc: 'Reduce difficulty for repairs.', prereq: [1,'textiles']},
  collector: {name: 'Collector', desc: 'Gifts also count as sacrifices.', prereq: [1,'crystals']},
  connections: {name: 'Connections', desc: 'Trade favors for high-quality materials.', prereq: [1]},
  dazzlefly: {name: 'Dazzlefly', desc: 'Shiny creations dazzle for a small ability bonus.', prereq: [1,'crystals','living arts']},
  durableAssembly: {name: 'Durable Assembly', desc: 'Created objects are more resistant to damage.', prereq: [1,'metals','wood']},
  eideticEnterprise: {name: 'Eidetic Enterprise', desc: 'Create perfect copies.', prereq: [1]},
  greenThumb: {name: 'Green Thumb', desc: 'Care for plants with supernatural effect.', prereq: [1,'living arts', 'wood']},

  // xxx: {name: '', desc: '', prereq: []},
}

const defaultCraftingCharacter = {
  name: 'Character',
  tier: 1,
  class: 'Class',
  mediaPrimary: '',
  mediaSecondary: '',
  proficiencyBonus: 2,
  techniques: [],
  workshop: '',
  linguaFranca: '',
  toolProficiency: ''
}

function getStaminaForCharacter(characterData) {
  return (characterData.tier + 2);
}

function getTechniqueCountForCharacter(characterData) {
  return (characterData.tier + 1); // TODO: allow for techniques that let you choose multiple smaller techniques
}

export {
  allMediaTypes,
  allTechniques,
  defaultCraftingCharacter,
  getStaminaForCharacter,
  getTechniqueCountForCharacter
} ;
