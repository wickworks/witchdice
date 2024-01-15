import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';
import PlayerTeam from './PlayerTeam.jsx';
import OpponentTeams from './OpponentTeams.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';

import './DraftDecks.scss';


const DraftDecks = ({
  undrawnDeck,
  setUndrawnDeck,
  currentPicks,
  setCurrentPicks,
  allTeams,
  setTeamData,
  partyName,
}) => {
  // const [currentPicks, setCurrentPicks] = useState(['','','','','','','',''])
  //
  // const [allTeams, setAllTeams] = useState({
  //   [partyName]: deepCopy(blankPlayerTeam),
  //   'opponent': deepCopy(blankPlayerTeam),
  //   'hii': deepCopy(blankPlayerTeam),
  // })

  const playerTeam = allTeams[partyName]

  // get an object with all the opponent teams
  const opponentTeams = {...allTeams}
  delete opponentTeams[partyName]

  // get the next empty slot
  const nextEmptySlot = currentPicks.indexOf('')

  const handleDrawCard = () => {
    if (nextEmptySlot >= 0 && undrawnDeck.length > 0) {
      const newUndrawnDeck = [...undrawnDeck]
      const drawIndex = getRandomInt(undrawnDeck.length) - 1 // 0-51
      const drawnNpcID = newUndrawnDeck[drawIndex]
      newUndrawnDeck.splice(drawIndex, 1)
      setUndrawnDeck(newUndrawnDeck)

      const newCurrentPicks = [...currentPicks]
      newCurrentPicks[nextEmptySlot] = drawnNpcID
      setCurrentPicks(newCurrentPicks)
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
      setTeamData(partyName, newPlayerTeam)
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
        setPlayerTeam={(teamData) => setTeamData(partyName, teamData)}
      />

    </div>
  )
}

export default DraftDecks ;
