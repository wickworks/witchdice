
import { allActions } from './lancerData.js'

function getActionCard(action) {
  return {
    name: action.name.toLowerCase(),
    activation: action.activation,
    frequency: (action.pilot && !action.mech) ? 'Pilot' : '',
    description: action.detail,
    isTitleCase: true,
  }
}

function getActionCardsOfType(activation, pilotActions = false) {
  return Object.values(allActions)
    .filter(action => (
      action.activation === activation &&
      ((action.pilot && !action.mech) ? pilotActions : !pilotActions) &&
      action.id !== 'act_activate_quick' && // these are dumb
      action.id !== 'act_activate_full'
    ))
    .map(action => getActionCard(action))
}

export const genericActionTraits = [
  ...getActionCardsOfType('Quick'),
  ...getActionCardsOfType('Quick', true),
  ...getActionCardsOfType('Quick Tech'),
  ...getActionCardsOfType('Full'),
  ...getActionCardsOfType('Full', true),
  ...getActionCardsOfType('Reaction'),
  ...getActionCardsOfType('Free'),
  ...getActionCardsOfType('Move'),
]
