

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
  toolProficiency: '',
  projectIDs: []
}

const defaultRollData = {
  rolls: [],
  flawCount: 0,
  boonCount: 0,
}

const defaultProject = {
  stage: 'preparing', // preparing | tuning | success | failure
  name: 'new~project', //bit of a magic value; this name has to be treated as blank
  blueprint: '',
  difficulty: 'simple',
  size: 'small',
  preparations: [],
  techniques: [], // techniques applied during the action or fine-tuning stage
  staminaSpent: 0,
  rollData: defaultRollData,
  cancelledCount: 0,
  desc: '',
}

const allMediaTypes = [
  'Crystals',
  'Wood',
  'Drafting',
  'Living Arts',
  'Metals',
  'Textiles'
]

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

function buildFinishedDescription(projectData, crafterData) {
  var desc = '';

  if (!didProjectSucceed(projectData, crafterData)) {
    desc += "This project didn't quite come together. The crafting roll was only "
    desc += `${getProjectResult(projectData, crafterData)} against a DC of ${getProjectDC(projectData)}.\n\n`
  }

  if (projectData.blueprint) {
    desc += projectData.blueprint + ".\n\n";
  }

  const flawStack = getTotalFlawBoonStack(projectData.rollData.flawCount, projectData);
  const boonStack = getTotalFlawBoonStack(projectData.rollData.boonCount, projectData);

  flawStack.forEach(flaw => desc += ('**' + allFlaws[flaw] + '**: \n\n'))
  boonStack.forEach(boon => desc += ('**' + allBoons[boon] + '**: \n\n'))

  desc += buildTechniqueSentences(projectData, crafterData);

  desc += buildPreparationSentence(projectData, crafterData.name);
  desc += '\n\n';

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

function buildTechniqueSentences(projectData, crafterData) {
  const tier = crafterData.tier;
  var string = '';

  if (crafterHasTechnique(crafterData, 'durableAssembly')) {
    string +=
      "*Durable Assembly:* This object's AC is +1 and has resistance to a " +
      'damage type of your choice. \n\n'
  }

  if (projectUsedTechnique(projectData, 'slowAndSteady')) {
    string +=
      "*Slow and Steady:* This is extremely durable and has double hit points " +
      'of other objects of its kind. Its flaws do not diminish its durability. \n\n'
  }

  if (crafterHasTechnique(crafterData, 'dazzlefly')) {
    string +=
      '*Dazzlefly:* As an action whenever you use an item of your creation for an ability check, ' +
      'or as a reaction whenever someone else is using your creation within 30 feet of you, ' +
      'the item catches the light and begins to dazzle, adding +1d4 to the associated ' +
      'ability check roll. Once you have used this feature you must complete a short or long ' +
      'rest before you can do so again. \n\n'
  }

  if (crafterHasTechnique(crafterData, 'smellOfSuccess')) {
    string +=
      '*Smell of Success:* This can be smelled from up to ' +
      '100 feet away, though airtight environments and wind ' +
      'patterns may alter this radius. A creatures’ like (or ' +
      'dislike) of that scent is doubled within 10 feet. \n\n'
  }

  if (crafterHasTechnique(crafterData, 'signature')) {
    string +=
      "*Signature:* This is enchanted with an arcane mark that responds to your command and " +
      "proves you're the creator. Additionally, you're instantly aware of the presence of any " +
      `item of your creation within ${tier >= 5 ? '1000' : tier >= 3 ? '500' : '100'} feet. ` +
      "The arcane mark is magical and can be seen with " +
      "spells such as *detect magic* and *true sight*, or any other means that reveal hidden magic. \n\n"
  }

  if (projectData.techniques.length > 0) {
    string += `Made using ${crafterData.name}'s `

    const techniques = projectData.techniques;
    techniques.forEach(function (tech, i) {
        string += allTechniques[tech].name.toLowerCase();
        if (i === (techniques.length-1)) {
          string += '.';
        } else if (i === (techniques.length-2)) {
          if (techniques.length === 2) {
            string += ' and ';
          } else {
            string += ', and ';
          }
        } else {
          string += ', ';
        }
      }
    );

    string += '\n\n'
  }

  return string;
}

function projectHasPreparation(projectData, preparation) {
  return (projectData.preparations.indexOf(preparation) >= 0);
}

function getStaminaCostForProject(projectData) {
  let cost = allSizes[projectData.size] * allDifficulties[projectData.difficulty];
  cost = Math.floor(cost);
  cost = Math.max(cost, 1);

  if (projectUsedTechnique(projectData, 'slowAndSteady')) { cost *= 2 }

  return cost;
}

function getBonusDiceForProject(characterData, projectData) {
  return characterData.tier + projectData.preparations.length;
}

function getProjectDC(projectData) {
  return (allDifficulties[projectData.difficulty] * 5) + 5;
}

function getProjectResult(projectData, crafterData) {
  var result = 0;
  result += projectData.rollData.rolls.reduce((a, b) => a + b, 0);
  result += crafterData.proficiencyBonus;
  return result;
}

function didProjectSucceed(projectData, crafterData) {
  return (getProjectResult(projectData, crafterData) >= getProjectDC(projectData))
}

function getStaminaForCharacter(characterData) {
  return (characterData.tier + 2);
}

function crafterHasTechnique(crafterData, technique) {
  return (crafterData.techniques.indexOf(technique) >= 0)
}

function projectUsedTechnique(projectData, technique) {
  return (projectData.techniques.indexOf(technique) >= 0)
}

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

  aStitchInTime: {name: 'A Stitch In Time', desc: 'Reduce the difficulty of repairs.', prereq: [1,'Textiles']},
  collector: {name: 'Collector', desc: 'Gifts also count as sacrifices.', prereq: [1,'Crystals']},
  connections: {name: 'Connections', desc: 'Trade favors for high-quality materials.', prereq: [1]},
  dazzlefly: {name: 'Dazzlefly', desc: 'Shiny creations dazzle for a small ability bonus.', prereq: [1,'Crystals','Living Arts']},
  durableAssembly: {name: 'Durable Assembly', desc: 'Created objects are more resistant to damage.', prereq: [1,'Metals','Wood']},
  eideticEnterprise: {name: 'Eidetic Enterprise', desc: 'Create perfect copies.', prereq: [1]},
  greenThumb: {name: 'Green Thumb', desc: 'Care for plants with supernatural effect.', prereq: [1,'Living Arts', 'Wood']},
  infectiousEnthusiasm: {name: 'Infectious Enthusiasm', desc: 'Gain advantage on Charisma checks involving your project.', prereq: [1]},
  inheritedTools: {name: 'Inherited Tools', desc: 'Gain dice to rescue a project 1/month.', prereq: [1]},
  juryRigger: {name: 'Jury Rigger', desc: 'Can use unorthidox items for your base materials.', prereq: [1]},
  maturity: {name: 'Maturity', desc: 'Food stays fresh, projects come to maturity much faster.', prereq: [1, 'Living Arts']},
  meTime: {name: 'Me Time', desc: 'Extended long rests grant additional stamina.', prereq: [1]},
  signature: {name: 'Signature', desc: 'Mark & sense objects with your arcane signature.', prereq: [1]},
  slowAndSteady: {name: 'Slow and Steady', desc: 'Spend additional stamina to double project hit points.', prereq: [1]},
  smellOfSuccess: {name: 'Smell of Success', desc: 'Aromas can be smelled from 100 feet away.', prereq: [1, 'Living Arts']},
  stickyFingers: {name: 'Sticky Fingers', desc: 'Gain advantage on Dexterity checks to gather materials.', prereq: [1]},
  survivalist: {name: 'Survivalist', desc: 'Guaranteed perfect materials when harvesting from nature.', prereq: [1]},

  appliedAppraisal: {name: 'Applied Appraisal', desc: 'Purchase non-magical materials at 1/10 the cost.', prereq: [2]},
  collaborator: {name: 'Collaborator', desc: 'Can gain the benefit of assistance multiple times.', prereq: [2]},
  counselledCrafter: {name: 'Counselled Crafter', desc: 'Can gain the benefit of knowledge multiple times.', prereq: [2]},
  eldritchWorkshop: {name: 'Eldritch Workshop', desc: '', prereq: [2, 'Spellcasting']},
  goodAsNew: {name: 'Good as New', desc: 'Reduce the difficulty of repairs.', prereq: [2]},
  houseMagic: {name: 'House Magic', desc: 'Learn either the mage hand or mending cantrip.', prereq: [2]},
  naturalBounty: {name: 'Natural Bounty', desc: 'Gain advantage on Wisdom checks to harvest high-quality materials.', prereq: [2]},
  routine: {name: 'Routine', desc: 'Reduce the difficulty of repeated small projects.', prereq: [2]},
  runeforgedWorkshop: {name: 'Runeforged Workshop', desc: 'Repurpose magical items as high-quality materials.', prereq: [2, 'Metals']},
  theGoodStuff: {name: 'The Good Stuff', desc: 'Can gain the benefit of high-quality materials multiple times.', prereq: [2]},
  welcomingWorkshop: {name: 'Welcoming Workshop', desc: 'Gain a shared bonus when working alongside another craftsperson.', prereq: [2]},
  workshopFamiliar: {name: 'Workshop Familiar', desc: 'Can cast the find familiar spell as a ritual in your workshop.', prereq: [2]},

  arcanist: {name: 'Arcanist', desc: 'Reduce the difficulty of magical projects.', prereq: [3]},
  comfortZone: {name: 'Comfort Zone', desc: 'Gain a +5 bonus or a boon to make items you are proficient with.', prereq: [3]},
  craftmaster: {name: 'Craftmaster', desc: 'Reduce the difficulty of non-magical projects.', prereq: [3]},
  noTimeToWaste: {name: 'No Time to Waste', desc: 'Finish a project in one hour 1/month.', prereq: [3]},
  salvagedArcanum: {name: 'Salvaged Arcanum', desc: 'Projects can inherit the magical properties of their materials.', prereq: [3]},
  subtleTouch: {name: 'Subtle Touch', desc: 'Take three tier 1 techniques.', prereq: [3]},

  arcaneCrafter: {name: 'Arcane Crafter', desc: 'Spend spell slots to instantly complete projects.', prereq: [4, 'Spellcasting']},
  blessedCreation: {name: 'Blessed Creation', desc: 'Gain bonuses and a boon through prayer 1/month', prereq: [4, 'Serve a god, deity, patron, or other higher cosmic power']},
  homegrown: {name: 'Homegrown', desc: 'Can cast the word of recall spell to return to your plants.', prereq: [4, 'An innate bond to nature']},
  manufacturer: {name: 'Manufacturer', desc: 'Quadruple crafting time to make larger batches.', prereq: [4, 'No spell slots higher than 5th level']},
  toolsmithOfTheTrade: {name: 'Toolsmith of the Trade', desc: 'Higher DCs to undo your work and a bonus to use your expertise.', prereq: [4, 'Expertise']},

  alloy: {name: 'Alloy', desc: 'Gain knowledge of a very special alloy.', prereq: [5, 'Metals']},
  evergreen: {name: 'Evergreen', desc: 'Your items mend themselves and you can awaken them.', prereq: [5, 'Wood']},
  heirloom: {name: 'Heirloom', desc: 'Can add additional boons to an item over time.', prereq: [5]},
  resonance: {name: 'Resonance', desc: 'Your items can store and release magic.', prereq: [5, '']},
  smallDelights: {name: 'Small Delights', desc: 'Your consumables grant temporary hit points.', prereq: [5, 'Living Arts']},
  spellweaver: {name: 'Spellweaver', desc: 'Your items can store a spell.', prereq: [5, 'Textiles']},
  subtext: {name: 'Subtext', desc: 'Can imbue your items with hidden, animated, or emotional effects.', prereq: [5, 'Drafting']},
  symbol: {name: 'Symbol', desc: 'Your projects protect and refresh the minds of your allies.', prereq: [5]},
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
  getProjectResult,
  getProjectDC,
  getStaminaForCharacter,
  crafterHasTechnique,
  projectUsedTechnique,
  didProjectSucceed,
} ;
