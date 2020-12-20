

const defaultCraftingCharacter = {
  name: 'Crafter',
  tier: 1,
  class: '',
  mediaPrimary: '',
  mediaSecondary: '',
  proficiencyBonus: 2,
  techniques: [],
  techniqueDetails: {},  // some techniques require selecting one or more options
  workshop: '',
  linguaFranca: '',
  toolProficiency: '',
  projectIDs: []
}

const defaultRollData = {
  rolls: [],
  bonuses: [],     // Flat increases e.g. proficiency bonus
  flawCount: 0,
  boonCount: 0,
}

const defaultProject = {
  stage: 'preparing',   // preparing | tuning | success | failure
  name: 'new~project',  // Bit of a magic value; this name has to be treated as blank
  blueprint: '',
  difficulty: 'simple',
  size: 'small',
  preparations: [],
  techniques: [],        // Techniques applied during the action or fine-tuning stage
  techniqueDetails: {},  // Sometimes need to store some temporary data during the fine-tuning stage
  staminaSpent: 0,
  rollData: defaultRollData,  // Rolled results
  insightRollData: null,      // Insightful Talent lets us roll twice
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

function projectHasPreparation(projectData, preparation) {
  return (projectData.preparations.indexOf(preparation) >= 0);
}

function getStaminaCostForProject(projectData, includeTechniques = true) {
  let cost = allSizes[projectData.size] * allDifficulties[projectData.difficulty];
  cost = Math.floor(cost);
  cost = Math.max(cost, 1);

  if (includeTechniques) {
    if (projectUsedTechnique(projectData, 'slowAndSteady')) { cost *= 2 }
    if (projectUsedTechnique(projectData, 'insightfulTalent')) { cost *= 2 }
  }

  return cost;
}

function getBonusDiceForProject(characterData, projectData) {
  return characterData.tier + projectData.preparations.length;
}

function getProjectDC(projectData) {
  return (allDifficulties[projectData.difficulty] * 5) + 5;
}

function getProjectResult(rollData, crafterData) {
  var result = 0;
  result += rollData.rolls.reduce((a, b) => a + b, 0);
  result += rollData.bonuses.reduce((a, b) => a + b, 0);
  return result;
}

function didProjectSucceed(projectData, crafterData) {
  return (getProjectResult(projectData.rollData, crafterData) >= getProjectDC(projectData))
}

function getStaminaForCharacter(characterData) {
  return (characterData.tier + 2);
}

function crafterHasTechnique(crafterData, technique) {
  const selected = (crafterData.techniques.indexOf(technique) >= 0)
  const automatic =
    (technique === 'finishingTouches' && crafterData.tier >= 2) ||
    (technique === 'secondNature'     && crafterData.tier >= 3) ||
    (technique === 'insightfulTalent' && crafterData.tier >= 5)

  return (selected || automatic)
}

function projectUsedTechnique(projectData, technique) {
  return (projectData.techniques.indexOf(technique) >= 0)
}


function buildFinishedDescription(projectData, crafterData) {
  var desc = '';

  if (!didProjectSucceed(projectData, crafterData)) {
    desc += "This project didn't quite come together. The crafting roll was only "
    desc += `${getProjectResult(projectData.rollData, crafterData)} against a DC of ${getProjectDC(projectData)}.\n\n`
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


function buildTechniqueSentences(projectData, crafterData) {
  const tier = crafterData.tier;
  var string = '';

  if (crafterHasTechnique(crafterData, 'evergreen')) {
    string +=
      "*Evergreen:* This object mends itself. As long as it hasn't been completely destroyed " +
      'or disintegrated, it begins to mend itself at 1 hit point per minute. \n\n'
  }

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

  if (projectUsedTechnique(projectData, 'symbol')) {
    string +=
      "*Symbol:* This object serves as a symbol to others, granting them comfort and guidance. " +
      "Creatures within 600 feet that can see " +
      "or hear it, any creature that directly follows the " +
      "leadership of a creature that wields it, or any creature " +
      "that acts in the object’s preservation gains the benefit " +
      "of its symbolism. The symbol grants immunity to " +
      "fear, immunity to the first two steps of exhaustion, " +
      "and allows the creature to restore up to two levels of " +
      "exhaustion and all lost hit dice on a long rest. You may " +
      "only have one such symbol empowered at any one " +
      "time, however you may have up to three duplicates of " +
      "the same symbol. \n\n"
  }

  if (projectUsedTechnique(projectData, 'spellweaver')) {
    const school = crafterData.techniqueDetails.spellweaver;

    string +=
      '*Spellweaver:* This work is interlaced with the very fabric of domestic magic. ' +
      `It can be used to cast a level 1 **${school} spell** (chosen during creation) once. \n\n`
  }

  if (crafterHasTechnique(crafterData, 'resonance')) {
    string +=
      "*Resonance:* This vibrates with a familiar hum of magic, " +
      "capable of absorbing and storing energy. Each time " +
      "a spell (of a level equal to or higher than half the " +
      "item’s difficulty level, rounded up) is cast within 60 " +
      "feet, this item gains a charge " +
      "of resonance. Once it reaches three charges, " +
      "they can be unleashed as a bonus action, resulting in " +
      "the casting of a spell from the list below. The spell is " +
      "chosen by the GM or rolled on a d6. \n" +
      "- beacon of hope \n" +
      "- conjure animals \n" +
      "- haste (target is the item’s user) \n" +
      "- hypnotic pattern (DC 18) \n" +
      "- magic circle \n" +
      "- mass healing word (+4) \n\n" +
      "Once the spell effect is ended, this item can begin " +
      "absorbing new charges once again. These effects can " +
      "only be activated by its rightful owner. " +
      "In cases of immovable, standing structures " +
      "(as stonemasons might make), then the charges can " +
      "be activated by touching the frame of the nearest " +
      "doorway or window. This item’s creator is " +
      "arbiter of who qualifies as an item’s rightful owner. \n\n"
  }

  if (crafterHasTechnique(crafterData, 'smallDelights')) {
    string +=
      "*Small Delights:* The impermanent nature of your work empowers " +
      "it during its brief time in the world. This consumable " +
      `project has a pool of **${getStaminaCostForProject(projectData, false)*5}** ` +
      "temporary hit points. Whenever it is consumed " +
      "(by eating or wearing, as the case might be) by a " +
      "creature, that creature can gain temporary health " +
      "from the project’s pool up to the points remaining in " +
      "the pool. If a project produces a yield greater than one " +
      "(i.e. a batch of cupcakes), then the temporary health " +
      "pool is shared across every creature who partook of " +
      "the entire yield. Furthermore, whenever a creature " +
      "with these temporary hit points makes an attack roll, " +
      "ability check, or saving throw it can spend 3 temp " +
      "HP to add +1 to the roll. A creature can perform this " +
      "exchange multiple times per roll as long as it has 3 or " +
      "more of these temporary hit points remaining. \n\n"
  }

  if (crafterHasTechnique(crafterData, 'dazzlefly')) {
    string +=
      '*Dazzlefly:* As an action whenever you use an item of your creation for an ability check, ' +
      'or as a reaction whenever someone else is using your creation within 30 feet of you, ' +
      'the item catches the light and begins to dazzle, adding +1d4 to the associated ' +
      'ability check roll. Once you have used this feature you must complete a short or long ' +
      'rest before you can do so again. \n\n'
  }

  if (projectUsedTechnique(projectData, 'alloy')) {
    // decompose from the weird select.value format to just a normal array
    const alloys = crafterData.techniqueDetails.alloys.map((option) => option.value);

    string += "*Alloy:* This object was made with a unique alloy of three metals: \n"

    if (alloys.indexOf('Illuminium') >= 0) {
      string +=
        "- **Illuminium:** If this metal is exposed to " +
        "sunlight or moonlight for one minute it " +
        "will begin to glow, replicating the type of " +
        "light, and casting bright light for 30 feet. As " +
        "a bonus action you can change the color of " +
        "the glow, but it will always have the quality of " +
        "whatever light it was most recently charged " +
        "by. Furthermore, the metal can be used in " +
        "conjunction with any light-creating spell " +
        "or effect to double the spell’s light radius. " +
        "Striking this metal in a way known only to " +
        "you will cause it to stop glowing until it is " +
        "exposed to light once again. \n"
    }
    if (alloys.indexOf('Realm Silver') >= 0) {
      string +=
        "- **Realm Silver:** The metal is considered either " +
        "holy or unholy and cannot be willingly " +
        "touched by two of the following creature " +
        "types of your choice: fiends, celestials, fey, or " +
        "undead. \n"
    }
    if (alloys.indexOf('Adamantine') >= 0) {
      string +=
        "- **Adamantine:** Objects made of this metal have AC 23 and a damage threshold of 10. \n"
    }
    if (alloys.indexOf('Deep Mountain Brass') >= 0) {
      string +=
        "- **Deep Mountain Brass:** Sound produced by " +
        "anything made from this metal can be three " +
        "times louder or three times quieter. You may " +
        "choose which quality you prefer every time " +
        "you craft with your alloy. \n"
    }
    if (alloys.indexOf('Stained Glass Steel') >= 0) {
      string +=
        "- **Stained Glass Steel:** The surface of this metal " +
        "is covered with shifting patterns. During the " +
        "craft action, you can manipulate the patterns " +
        "to make a static shape, or a constantly moving " +
        "one, like a holograph. The image and its state " +
        "are set once the craft action is complete. \n"
    }
    if (alloys.indexOf('Morphing Mercury') >= 0) {
      string +=
        "- **Morphing Mercury:** You have a secret method " +
        "of converting this metal between liquid, " +
        "bendable, or completely rigid. You can " +
        "activate this phase change as an action even " +
        "after the item has been crafted. If the metal " +
        "was separated during the liquid or bendable " +
        "phase, it will magically rejoin the item when " +
        "it’s returned to its rigid state. \n"
    }

    string += "\n";
  }

  if (crafterHasTechnique(crafterData, 'signature')) {
    string +=
      "*Signature:* This is enchanted with an arcane mark that responds to your command and " +
      "proves you're the creator. Additionally, you're instantly aware of the presence of any " +
      `item of your creation within ${tier >= 5 ? '1000' : tier >= 3 ? '500' : '100'} feet. ` +
      "The arcane mark is magical and can be seen with " +
      "spells such as *detect magic* and *true sight*, or any other means that reveal hidden magic. \n\n"
  }

  if (crafterHasTechnique(crafterData, 'toolsmithOfTheTrade')) {
    string +=
      "*Toolsmith of the Trade:* Whenever this object faces an " +
      "opposed ability check to undo, open, or discern it (such " +
      "as locks or disguises) you may add an ability modifier " +
      "of your choice to the object’s DC. Additionally, whenever " +
      "you perform an ability check that uses both your " +
      "expertise and this item, you may add an ability modifier of your choice to the roll. \n\n"
  }

  if (crafterHasTechnique(crafterData, 'smellOfSuccess')) {
    string +=
      '*Smell of Success:* This can be smelled from up to ' +
      '100 feet away, though airtight environments and wind ' +
      'patterns may alter this radius. A creatures’ like (or ' +
      'dislike) of that scent is doubled within 10 feet. \n\n'
  }

  if (projectUsedTechnique(projectData, 'subtext')) {
    const subtextSelection = projectData.techniqueDetails.subtext;
    if (subtextSelection === 'Animated') {
      string += '*Subtext, Animated:* Some part of the drafted work moves or otherwise animates. '
    } else if (subtextSelection === 'Hidden Message') {
      string += '*Subtext, Hidden Message:* A layer of text or image not seen in the orignal work reveals itself. '
    } else if (subtextSelection === 'Emotion') {
      string += '*Subtext, Emotion:* The drafted work conveys a strong emotion to the viewer. '
    }
    string +=
      "\n\n" +
      "You choose the trigger that will activate these effects, " +
      "whether it be simple (e.g. “someone looks at it”) or " +
      "complicated (“someone who has their doubts about " +
      "the current regime wants to meet like-minded people " +
      "walks by”). The trigger must be something tangible " +
      "within the setting, and cannot be based off character " +
      "level, CR, or hit points. The GM will intercede to " +
      "determine what triggers are reasonable. \n\n" +
      "When you create this object, you may also choose " +
      "to affix a Persuasion, Deception, or Intimidation " +
      "ability check to it, either using your passive total or rolling " +
      "with advantage. You must choose before making the " +
      "roll. This check will be made against anyone who " +
      "triggers the subtextual content. \n\n"
  }

  if (projectUsedTechnique(projectData, 'manufacturer') && getManufacturerCount(projectData) > 1) {
    string +=
      `*Manufacturer:* This item was created in a batch of ${getManufacturerCount(projectData)}. \n\n`
  }

  if (projectData.techniques.length > 0) {
    string += `*Created using `

    const techniques = projectData.techniques;
    techniques.forEach(function (tech, i) {
        if (allTechniques[tech]) {
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
      }
    );

    string += '* '
  }

  return string;
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

function getDefaultClass(primary, secondary) {
  var className = 'Crafter'; // to put SOMETHING in so we don't get stuck in an infinite loop

  if (primary === 'Crystals') {
    switch(secondary) {
      case 'Wood': className = 'Mason'; break;
      case 'Drafting': className = 'Potter'; break;
      case 'Living Arts': className = 'Bonecarver'; break;
      case 'Metals': className = 'Glassblower'; break;
      case 'Textiles': className = 'Bead Stringer'; break;
      default: break;
    }

  } else if (primary === 'Wood') {
    switch(secondary) {
      case 'Crystals': className = 'Wandmaker'; break;
      case 'Drafting': className = 'Carpenter'; break;
      case 'Living Arts': className = 'Carver'; break;
      case 'Metals': className = 'Fletcher'; break;
      case 'Textiles': className = 'Shipwright'; break;
      default: break;
    }

  } else if (primary === 'Drafting') {
    switch(secondary) {
      case 'Crystals': className = 'Architect'; break;
      case 'Wood': className = 'Writer'; break;
      case 'Living Arts': className = 'Painter'; break;
      case 'Metals': className = 'Counterfeiter'; break;
      case 'Textiles': className = 'Mapmaker'; break;
      default: break;
    }

  } else if (primary === 'Living Arts') {
    switch(secondary) {
      case 'Crystals': className = 'Alchemist'; break;
      case 'Drafting': className = 'Beautician'; break;
      case 'Wood': className = 'Gardener'; break;
      case 'Metals': className = 'Chef'; break;
      case 'Textiles': className = 'Doula'; break;
      default: break;
    }

  } else if (primary === 'Metals') {
    switch(secondary) {
      case 'Crystals': className = 'Clockmaker'; break;
      case 'Drafting': className = 'Locksmith'; break;
      case 'Living Arts': className = 'Gilder'; break;
      case 'Wood': className = 'Weaponsmith'; break;
      case 'Textiles': className = 'Blacksmith'; break;
      default: break;
    }

  } else if (primary === 'Textiles') {
    switch(secondary) {
      case 'Crystals': className = 'Taxidermist'; break;
      case 'Drafting': className = 'Tailor'; break;
      case 'Living Arts': className = 'Leatherworker'; break;
      case 'Metals': className = 'Embroiderer'; break;
      case 'Wood': className = 'Weaver'; break;
      default: break;
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
  subtleTouch: {name: 'Subtle Touch', desc: 'Take three additional tier 1 techniques.', prereq: [3]},

  arcaneCrafter: {name: 'Arcane Crafter', desc: 'Spend spell slots to instantly complete projects.', prereq: [4, 'Spellcasting']},
  blessedCreation: {name: 'Blessed Creation', desc: 'Gain bonuses and a boon through prayer 1/month', prereq: [4, 'Serve a god, deity, patron, or other higher cosmic power']},
  homegrown: {name: 'Homegrown', desc: 'Can cast the word of recall spell to return to your plants.', prereq: [4, 'An innate bond to nature']},
  manufacturer: {name: 'Manufacturer', desc: 'Quadruple crafting time to make larger batches.', prereq: [4, 'No spell slots higher than 5th level']},
  toolsmithOfTheTrade: {name: 'Toolsmith of the Trade', desc: 'Higher DCs to undo your work and a bonus to use your expertise.', prereq: [4, 'Expertise']},

  alloy: {name: 'Alloy', desc: 'Gain knowledge of three special alloys.', prereq: [5, 'Metals']},
  evergreen: {name: 'Evergreen', desc: 'Your items mend themselves and you can awaken them.', prereq: [5, 'Wood']},
  heirloom: {name: 'Heirloom', desc: 'Can add additional boons to an item over time.', prereq: [5]},
  resonance: {name: 'Resonance', desc: 'Your items can store and release magic.', prereq: [5, '']},
  smallDelights: {name: 'Small Delights', desc: 'Your consumables grant temporary hit points.', prereq: [5, 'Living Arts']},
  spellweaver: {name: 'Spellweaver', desc: 'Projects can store a spell from the chosen school.', prereq: [5, 'Textiles']},
  subtext: {name: 'Subtext', desc: 'Can imbue your items with hidden, animated, or emotional effects.', prereq: [5, 'Drafting']},
  symbol: {name: 'Symbol', desc: 'Your projects protect and refresh the minds of your allies.', prereq: [5]},
}



function getManufacturerCount(projectData) {
  const difficultyLevel = allDifficulties[projectData.difficulty];

  const manufacturerTable = {
    tiny:   [100,50,25,16,12,3],
    small:  [50, 25,16,12,3, 1],
    medium: [25, 16,12,3, 1, 1],
    large:  [12, 6, 3, 1, 1, 1],
    huge:   [6,  3, 1, 1, 1, 1],
  }

  var count = 1;
  if (difficultyLevel <= 6) {
    count = manufacturerTable[projectData.size][difficultyLevel-1];
  }

  return count
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
  getManufacturerCount,
} ;
