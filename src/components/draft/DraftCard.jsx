import React, { useState } from 'react';
import { findNpcClassData } from '../lancer/lancerData.js';

import './DraftCard.scss';


const DraftCard = ({
  npcID,
  onClick = null,
  disabled = false,
  isSelected = false,
}) => {

  const npcData = findNpcClassData(npcID)

  return (
    <button
      className={`DraftCard ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {(npcID && npcData) ?
        npcData.name
      :
        '<blank>'
      }
    </button>
  )
}

export default DraftCard ;
