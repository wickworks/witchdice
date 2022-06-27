
import { allActions } from './lancerData.js'

function getActionCard(action) {
  return {
    name: action.name.toLowerCase(),
    activation: action.activation,
    trigger: '',
    description: action.detail,
    isTitleCase: true,
  }
}

function getActionCardsOfType(activation) {
  return Object.values(allActions)
    .filter(action => action.activation === activation)
    .map(action => getActionCard(action))
}

export const genericActionTraits = [
  ...getActionCardsOfType('Quick'),
  ...getActionCardsOfType('Quick Tech'),
  // ...getActionCardsOfType('Invade'),
  ...getActionCardsOfType('Full'),
  ...getActionCardsOfType('Reaction'),
  ...getActionCardsOfType('Free'),
  ...getActionCardsOfType('Move'),
]
