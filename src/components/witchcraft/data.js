
const allMediaTypes = [
  'Crystals',
  'Wood',
  'Drafting',
  'Living Arts',
  'Metals',
  'Textiles'
]

function getDefaultClass(primary, secondary) {
  var className = 'Crafter'; // to put SOMETHING in so we don't get stuck in an infinite loop

  if (primary === 'Crystals') {
    switch(secondary) {
      case 'Wood': className = 'Mason'; break;
      case 'Drafting': className = 'Potter'; break;
      case 'Living Arts': className = 'Bonecarver'; break;
      case 'Metals': className = 'Glassblower'; break;
      case 'Textiles': className = 'Bead Stringer'; break;
    }

  } else if (primary === 'Wood') {
    switch(secondary) {
      case 'Crystals': className = 'Wandmaker'; break;
      case 'Drafting': className = 'Carpenter'; break;
      case 'Living Arts': className = 'Carver'; break;
      case 'Metals': className = 'Fletcher'; break;
      case 'Textiles': className = 'Shipwright'; break;
    }

  } else if (primary === 'Drafting') {
    switch(secondary) {
      case 'Crystals': className = 'Architect'; break;
      case 'Wood': className = 'Writer'; break;
      case 'Living Arts': className = 'Painter'; break;
      case 'Metals': className = 'Counterfeiter'; break;
      case 'Textiles': className = 'Mapmaker'; break;
    }

  } else if (primary === 'Living Arts') {
    switch(secondary) {
      case 'Crystals': className = 'Alchemist'; break;
      case 'Drafting': className = 'Beautician'; break;
      case 'Wood': className = 'Gardener'; break;
      case 'Metals': className = 'Chef'; break;
      case 'Textiles': className = 'Doula'; break;
    }

  } else if (primary === 'Metals') {
    switch(secondary) {
      case 'Crystals': className = 'Clockmaker'; break;
      case 'Drafting': className = 'Locksmith'; break;
      case 'Living Arts': className = 'Gilder'; break;
      case 'Wood': className = 'Weaponsmith'; break;
      case 'Textiles': className = 'Blacksmith'; break;
    }

  } else if (primary === 'Textiles') {
    switch(secondary) {
      case 'Crystals': className = 'Taxidermist'; break;
      case 'Drafting': className = 'Tailor'; break;
      case 'Living Arts': className = 'Leatherworker'; break;
      case 'Metals': className = 'Embroiderer'; break;
      case 'Wood': className = 'Weaver'; break;
    }
  }

  return className;
}

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
  'Minor Boon',
  'Substantial Boon',
  'Magical Boon'
]

const defaultCraftingCharacter = {
  name: 'Crafter',
  tier: 1,
  class: '',
  mediaPrimary: '',
  mediaSecondary: '',
  proficiencyBonus: 2,
  techniques: [],
  workshop: '',
  linguaFranca: '',
  toolProficiency: ''
}

const defaultProject = {
  blueprint: '',
  difficulty: 'simple',
  size: 'small',
  preparations: [],
  staminaSpent: 0,
  rollData: defaultRollData,
  cancelledCount: 0,
  desc: '',
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

// generate a description.
function buildFinishedDescription(projectData, characterData) {
  var desc = '';
  desc += projectData.blueprint + ".\n\n";

  const flawStack = getTotalFlawBoonStack(projectData.rollData.flawCount, projectData);
  const boonStack = getTotalFlawBoonStack(projectData.rollData.boonCount, projectData);

  flawStack.forEach(flaw => desc += ('**' + allFlaws[flaw] + '**: \n\n'))
  boonStack.forEach(boon => desc += ('**' + allBoons[boon] + '**: \n\n'))

  desc += buildPreparationSentence(projectData, characterData.name);
  desc += '\n\n';

  console.log('project desc:');
  console.log(desc);

  return desc;
}

function buildPreparationSentence(projectData, characterName = '') {
  if (projectData.preparations.length === 0) { return '' }

  const nonGiftPreparations = [...projectData.preparations]
    .filter(prep => prep !== 'Generosity');

  var string = 'Made';

  if (characterName.length > 0) {
    string += ` by ${characterName}`
  }

  if (projectHasPreparation(projectData, 'Generosity')) {
    string += ' as a gift';
  }

  // only a gift; end the sentence now.
  if (nonGiftPreparations.length === 0) {
    string += '.';
    return '*'+string+'*';
  }

  // list the non-gift preparations
  string += ' with ';
  nonGiftPreparations.forEach(function (preparation, i) {
      string += preparation.toLowerCase();
      if (i === (nonGiftPreparations.length-1)) {
        string += '.';
      } else if (i === (nonGiftPreparations.length-2)) {
        if (nonGiftPreparations.length === 2) {
          string += ' and ';
        } else {
          string += ', and ';
        }
      } else {
        string += ', ';
      }
    }
  );

  return '*'+string+'*';
}

function projectHasPreparation(projectData, preparation) {
  return (projectData.preparations.indexOf(preparation) >= 0);
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
  defaultCraftingCharacter,
  getDefaultClass,
  getTotalFlawBoonStack,
  buildFinishedDescription,
  getStaminaCostForProject,
  getBonusDiceForProject,
  getProjectDC,
  getStaminaForCharacter,
  getTechniqueCountForCharacter
} ;
