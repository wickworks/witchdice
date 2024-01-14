import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';
import TeamSlot from './TeamSlot.jsx';

import './PlayerTeam.scss';

// const blankPlayerTeam = {
//   unallocated: [],
//   slots: [
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//     deepCopy(blankTeamSlot),
//   ]
// }

const PlayerTeam = ({
  playerTeam,
  setPlayerTeam,
}) => {
  const [selectedUnallocated, setSelectedUnallocated] = useState(0)

  const canAllocate = selectedUnallocated >= 0 && playerTeam.unallocated.length > 0

  const setSelectedToSlot = (slotIndex, npcOrUpgrade) => {
    if (selectedUnallocated >= 0) {
      const selectedNpcID = playerTeam.unallocated[selectedUnallocated]
      const newPlayerTeam = {...playerTeam}
      newPlayerTeam.unallocated.splice(selectedUnallocated, 1)
      newPlayerTeam.slots[slotIndex][npcOrUpgrade].push(selectedNpcID)
      setPlayerTeam(newPlayerTeam)
      setSelectedUnallocated(Math.max(selectedUnallocated-1, 0))
    }
  }

  const unallocateSlot = (slotIndex, npcOrUpgrade, innerIndex) => {
    const unallocatingNpcID = playerTeam.slots[slotIndex][npcOrUpgrade][innerIndex]

    const newPlayerTeam = {...playerTeam}
    newPlayerTeam.unallocated.push(unallocatingNpcID)
    newPlayerTeam.slots[slotIndex][npcOrUpgrade].splice(innerIndex, 1)

    setPlayerTeam(newPlayerTeam)
    setSelectedUnallocated(playerTeam.unallocated.length-1)
  }

  return (
    <div className='PlayerTeam'>
      <p>Unallocated</p>
      <p>Your Team</p>

      <div className='unallocated'>
        {playerTeam.unallocated.map((npcID, i) =>
          <div className='unallocated-card-container'>
            <DraftCard npcID={npcID} onClick={() => setSelectedUnallocated(i)} isSelected={i == selectedUnallocated} key={i} />
          </div>
        )}
      </div>
      <div className='slots'>
        {playerTeam.slots.map((slot, i) =>
          <TeamSlot
            slotData={slot}
            onPressSlot={(npcOrUpgrade) => setSelectedToSlot(i, npcOrUpgrade)}
            onUnallocateSlot={(npcOrUpgrade, innerIndex) => unallocateSlot(i, npcOrUpgrade, innerIndex)}
            isDisabled={!canAllocate}
            key={i}
          />
        )}
      </div>

    </div>
  )
}

export default PlayerTeam ;
