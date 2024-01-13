import React, { useState } from 'react';
import DraftCard from './DraftCard.jsx';

import './DraftDecks.scss';


const DraftDecks = ({
  totalNpcDeck
}) => {

  return (
    <div className='DraftDecks panel'>
      Drafting
      {totalNpcDeck.map(npcID =>
        <DraftCard npcID={npcID} />
      )}
    </div>
  )
}

export default DraftDecks ;
