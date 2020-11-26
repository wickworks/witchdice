
const allMediaTypes = [
  'crystals',
  'wood',
  'drafting',
  'living arts',
  'metals',
  'textiles'
]

const allFeatures = [

]

const defaultCraftingCharacter = {
  name: 'Character',
  tier: 1,
  class: 'Class',
  mediaPrimary: '',
  mediaSecondary: '',
  proficiencyBonus: 2,
  features: []
}

function getStaminaForCharacter(characterData) {
  return (characterData.tier + 2)
}

export {
  allMediaTypes,
  defaultCraftingCharacter,
  getStaminaForCharacter
} ;
