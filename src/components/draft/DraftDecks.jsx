import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';

import './DraftDecks.scss';


const DraftDecks = ({
  totalNpcDeck
}) => {
  const [undrawnDeck, setUndrawnDeck] = useState(totalNpcDeck)
  const [currentPicks, setCurrentPicks] = useState(['','','','','','','',''])

  const [playerCards, setPlayerCards] = useState([])

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
      setPlayerCards([...playerCards, pickedNpcID])
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
            <DraftCard npcID={npcID} onClick={() => handlePickCard(i)} disabled={!npcID} />
          )}
        </div>
      </div>

      <div className='player-picks'>
        {playerCards.map((npcID, i) =>
          <DraftCard npcID={npcID} onClick={() => {}} />
        )}
      </div>

    </div>
  )
}

export default DraftDecks ;
