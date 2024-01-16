import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';

import './TeamSlot.scss';

// const blankTeamSlot = {
//   npcs: [],
//   upgrades: []
// }

const TeamSlot = ({
  slotData,
  setPlayerCards,
  onPressSlot,
  onUnallocateSlot,
  isDisabled = false
}) => {

  return (
    <div className='TeamSlot'>

      <div className='npcs'>
        <button className='slot-section' onClick={() => onPressSlot('npcs')} disabled={isDisabled}>
          NPC
        </button>
        {slotData.npcs.map((npcID, i) =>
          <DraftCard npcID={npcID} onClick={() => onUnallocateSlot('npcs', i)} key={i} />
        )}
      </div>


      <div className='upgrades'>
        <button className='slot-section' onClick={() => onPressSlot('upgrades')} disabled={isDisabled}>
          Upgrades
        </button>
        {slotData.upgrades.map((npcID, i) =>
          <DraftCard npcID={npcID} onClick={() => onUnallocateSlot('upgrades', i)} key={i} />
        )}
      </div>

    </div>
  )
}

export default TeamSlot ;
