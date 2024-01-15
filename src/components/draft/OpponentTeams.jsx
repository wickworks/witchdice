import React, { useState } from 'react';
import { findNpcClassData } from '../lancer/lancerData.js';

import './OpponentTeams.scss';


const OpponentTeams = ({
  opponentTeams
}) => {

  return (
    <div className='OpponentTeams'>
      {Object.keys(opponentTeams).map(opponentName =>
        <SpecificOpponent
          opponentName={opponentName}
          team={opponentTeams[opponentName]}
          key={opponentName}
        />
      )}
    </div>
  )
}


// const blankTeamSlot = {
//   npcs: [],
//   upgrades: []
// }
//
// const blankPlayerTeam = {
//   unallocated: [],
//   slots: [
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//   ]
// }

const SpecificOpponent = ({
  opponentName,
  team
}) => {

  const cardCounts = {}

  const addToCardCount = (npcID) => {
    if (npcID in cardCounts) {
      cardCounts[npcID] += 1
    } else {
      cardCounts[npcID] = 1
    }
  }

  team.unallocated.forEach(npcID => addToCardCount(npcID))
  team.slots.forEach(slot => {
    slot.npcs.forEach(npcID => addToCardCount(npcID))
    slot.upgrades.forEach(npcID => addToCardCount(npcID))
  });

  return (
    <div className='SpecificOpponent'>
      <p>{opponentName}'s Cards</p>
      <div className='opponent-cards-container'>
        {Object.keys(cardCounts).toSorted().map(npcID =>
          <div className='npc-type-and-count' key={npcID}>
            {findNpcClassData(npcID).name} x {cardCounts[npcID]}
          </div>
        )}
      </div>
    </div>
  )
}

export default OpponentTeams ;
