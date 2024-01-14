import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';
import PlayerTeam from './PlayerTeam.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import { deepCopy } from '../../utils.js';

import './DraftDecks.scss';

const blankTeamSlot = {
  npcs: [],
  upgrades: []
}

const blankPlayerTeam = {
  unallocated: [],
  slots: [
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
  ]
}


const DraftDecks = ({
  totalNpcDeck
}) => {
  const [undrawnDeck, setUndrawnDeck] = useState(totalNpcDeck)
  const [currentPicks, setCurrentPicks] = useState(['','','','','','','',''])

  const [playerTeam, setPlayerTeam] = useState(deepCopy(blankPlayerTeam))

  // get the next empty slot
  const nextEmptySlot = currentPicks.indexOf('')

  const handleDrawCard = () => {
    if (nextEmptySlot >= 0 && undrawnDeck.length > 0) {
      const shuffledDeck = undrawnDeck // TODO: SHUFFLE IT
      console.log('TODO: SHUFFLE THE DECK');
      const drawnNpcID = shuffledDeck.pop()

      const newCurrentPicks = [...currentPicks]
      newCurrentPicks[nextEmptySlot] = drawnNpcID
      setCurrentPicks(newCurrentPicks)
      setUndrawnDeck(shuffledDeck)
    }
  }

  const handlePickCard = (currentPicksIndex) => {
    const pickedNpcID = currentPicks[currentPicksIndex]
    if (pickedNpcID) {
      const newCurrentPicks = [...currentPicks]
      newCurrentPicks[currentPicksIndex] = ''
      setCurrentPicks(newCurrentPicks)

      const newPlayerTeam = {...playerTeam}
      newPlayerTeam.unallocated.push(pickedNpcID)
      setPlayerTeam(newPlayerTeam)
    }
  }

  return (
    <div className='DraftDecks panel'>
      <h3>Drafting</h3>

      <div className='central-pool'>
        <div className='undrawn'>
          <DraftCard npcID={''} onClick={() => handleDrawCard()} disabled={nextEmptySlot === -1} />
          ({undrawnDeck.length})
        </div>

        <div className='current-picks'>
          {currentPicks.map((npcID, i) =>
            <DraftCard npcID={npcID} onClick={() => handlePickCard(i)} disabled={!npcID} key={i} />
          )}
        </div>
      </div>

      <NouveauDivider />


      <PlayerTeam
        playerTeam={playerTeam}
        setPlayerTeam={setPlayerTeam}
      />

    </div>
  )
}

export default DraftDecks ;
