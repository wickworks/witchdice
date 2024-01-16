import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';
import TeamSlot from './TeamSlot.jsx';
import { blankPlayerTeam } from './MainDraft.jsx';
import { deepCopy } from '../../utils.js';

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
      const newPlayerTeam = {...deepCopy(blankPlayerTeam), ...playerTeam}

      newPlayerTeam.unallocated.splice(selectedUnallocated, 1)
      // if (!newPlayerTeam.slots[slotIndex][npcOrUpgrade]) newPlayerTeam.slots[slotIndex][npcOrUpgrade] = []
      newPlayerTeam.slots[slotIndex][npcOrUpgrade].push(selectedNpcID)
      setPlayerTeam(newPlayerTeam)
      setSelectedUnallocated(Math.max(selectedUnallocated-1, 0))
    }
  }

  const unallocateSlot = (slotIndex, npcOrUpgrade, innerIndex) => {
    const unallocatingNpcID = playerTeam.slots[slotIndex][npcOrUpgrade][innerIndex]

    console.log('unallocateSlot slotIndex', slotIndex, '   npcOrUpgrade ',npcOrUpgrade, '   innerIndex', innerIndex);

    // const newPlayerTeam = {...blankPlayerTeam, ...playerTeam}
    const newPlayerTeam = deepCopy(playerTeam)
    newPlayerTeam.unallocated.push(unallocatingNpcID)
    console.log('      start: ', newPlayerTeam.slots[slotIndex][npcOrUpgrade])
    newPlayerTeam.slots[slotIndex][npcOrUpgrade].splice(innerIndex, 1)
    console.log('      end: ', newPlayerTeam.slots[slotIndex][npcOrUpgrade])

    setPlayerTeam(newPlayerTeam)
    setSelectedUnallocated(newPlayerTeam.unallocated.length-1)
  }

  return (
    <div className='PlayerTeam'>
      <p>Unallocated</p>
      <p>Your Team</p>

      <div className='unallocated'>
        {playerTeam.unallocated.map((npcID, i) =>
          <DraftCard
            npcID={npcID}
            onClick={() => setSelectedUnallocated(i)}
            isSelected={i == selectedUnallocated}
            key={`unallocated-${npcID}-${i}`}
          />
        )}
      </div>
      <div className='slots'>
        {playerTeam.slots.map((slot, i) =>
          <TeamSlot
            slotData={slot}
            onPressSlot={(npcOrUpgrade) => setSelectedToSlot(i, npcOrUpgrade)}
            onUnallocateSlot={(npcOrUpgrade, innerIndex) => unallocateSlot(i, npcOrUpgrade, innerIndex)}
            isDisabled={!canAllocate}
            key={`playerslot-${i}`}
          />
        )}
      </div>

    </div>
  )
}

export default PlayerTeam ;
