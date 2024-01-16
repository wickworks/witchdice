import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';
import PlayerTeam from './PlayerTeam.jsx';
import OpponentTeams from './OpponentTeams.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import { blankPlayerTeam } from './MainDraft.jsx';

import './DraftDecks.scss';


const DraftDecks = ({
  undrawnDeck,
  updateDraftState,
  currentPicks,
  allTeams,
  partyName,
}) => {
  const playerTeam = {...deepCopy(blankPlayerTeam), ...allTeams[partyName]}
  const setPlayerTeam = (newPlayerTeam) => {
    const newAllTeams = {...allTeams}
    newAllTeams[partyName] = newPlayerTeam
    updateDraftState({allTeams: newAllTeams})
  }

  // get an object with all the opponent teams
  const opponentTeams = {}
  Object.keys(allTeams).forEach(teamName => {
    if (teamName !== partyName) opponentTeams[teamName] = {...deepCopy(blankPlayerTeam), ...allTeams[teamName]}
  });

  // get the next empty slot
  const nextEmptySlot = currentPicks.indexOf('')

  const handleDrawCard = () => {
    if (nextEmptySlot >= 0 && undrawnDeck.length > 0) {
      const newUndrawnDeck = [...undrawnDeck]
      const drawIndex = getRandomInt(undrawnDeck.length) - 1 // 0-51
      const drawnNpcID = newUndrawnDeck[drawIndex]
      newUndrawnDeck.splice(drawIndex, 1)

      const newCurrentPicks = [...currentPicks]
      newCurrentPicks[nextEmptySlot] = drawnNpcID

      updateDraftState({undrawnDeck: newUndrawnDeck, currentPicks: newCurrentPicks})
    }
  }

  const handlePickCard = (currentPicksIndex) => {
    const pickedNpcID = currentPicks[currentPicksIndex]
    if (pickedNpcID) {
      const newCurrentPicks = [...currentPicks]
      newCurrentPicks[currentPicksIndex] = ''

      const newPlayerTeam = {...deepCopy(blankPlayerTeam), ...playerTeam}
      newPlayerTeam.unallocated.push(pickedNpcID)

      updateDraftState({allTeams: {...allTeams, [partyName]: newPlayerTeam}, currentPicks: newCurrentPicks})
    }
  }

  return (
    <div className='DraftDecks panel'>
      <h3>Drafting</h3>

      <OpponentTeams
        opponentTeams={opponentTeams}
      />

      <NouveauDivider />

      <div className='central-pool'>
        <div className='undrawn'>
          <button className='asset ssc-watermark' onClick={() => handleDrawCard()} disabled={nextEmptySlot < 0}>
            {undrawnDeck.length}
          </button>
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
