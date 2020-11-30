
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

const allDifficulties = {
  basic: 1,
  simple: 2,
  intermediate: 3,
  advanced: 4,
  complex: 5,
  master: 6,
  legendary: 7
}

const allSizes = {
  tiny: .5,
  small: 1,
  medium: 2,
  large: 3,
  huge: 4
}

const allPreparations = [
  'Knowledge',
  'High-quality Materials',
  'Assistance',
  'Sacrifice',
  'Generosity',
  'Inspiration'
]

const defaultRollData = {
  rolls: [],
  flawCount: 0,
  boonCount: 0,
}

const allFlaws = [
  'Minor Flaw',
  'Substantial Flaw',
  'Dangerous Flaw'
]

const allBoons = [
  'Minor Flaw',
  'Substantial Flaw',
  'Dangerous Flaw'
]

const defaultFlawBoon = {
  isBoon: true, // is a flaw if not a boon
  size: 1,
}

const defaultProject = {
  difficulty: 'intermediate',
  size: 'medium',
  preparations: [],
  staminaSpent: 0,
  rollData: defaultRollData,
  cancelledCount: 0
}

function getTotalFlawBoonStack(flawOrBoonCount, projectData) {
  const count = flawOrBoonCount - projectData.cancelledCount;

  var stack = [];
  if (count % 3 === 1) stack.push(0);  // minor flaw/boon
  if (count % 3 === 2) stack.push(1);  // substantial flaw/boon
  for (var i = 0; i < Math.floor(count / 3); i++) {
    stack.push(2);  // dangerous flaw / magical boon
  }

  return stack
}

function getStaminaCostForProject(projectData) {
  let cost = allSizes[projectData.size] * allDifficulties[projectData.difficulty];
  cost = Math.floor(cost);
  cost = Math.max(cost, 1);
  return cost;
}

function getBonusDiceForProject(characterData, projectData) {
  return characterData.tier + projectData.preparations.length;
}

function getProjectDC(projectData) {
  return (allDifficulties[projectData.difficulty] * 5) + 5;
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
  allDifficulties,
  allSizes,
  allPreparations,
  allBoons,
  allFlaws,
  defaultProject,
  defaultRollData,
  defaultFlawBoon,
  defaultCraftingCharacter,
  getTotalFlawBoonStack,
  getStaminaCostForProject,
  getBonusDiceForProject,
  getProjectDC,
  getStaminaForCharacter,
  getTechniqueCountForCharacter
} ;
