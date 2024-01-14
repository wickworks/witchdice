import React, { useState } from 'react';
import SetupDeck from './SetupDeck.jsx';
import DraftDecks from './DraftDecks.jsx';

import './MainDraft.scss';

const defaultDeck = [
    "npcc_ace",
    "npcc_ace",
    "npcc_ace",
    "npcc_ace",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_specter",
    "npcc_specter",
    "npcc_specter",
    "npcc_specter",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_archer",
    "npcc_archer",
    "npcc_archer",
    "npcc_archer",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_hive",
    "npcc_hive",
    "npcc_hive",
    "npcc_hive",
    "npcc_operator",
    "npcc_operator",
    "npcc_operator",
    "npcc_operator",
    "npcc_witch",
    "npcc_witch",
    "npcc_witch",
    "npcc_witch"
]


const MainDraft = ({
  partyName,
  partyConnected,
  partyRoom,
}) => {
  const [npcDeck, setNpcDeck] = useState(defaultDeck)

  return (
    <div className='MainDraft'>
      <SetupDeck setNpcDeck={setNpcDeck}/>

      {(npcDeck.length > 0) &&
        <DraftDecks totalNpcDeck={npcDeck} partyName={partyName}/>
      }
    </div>
  )
}

export default MainDraft ;
