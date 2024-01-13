import React, { useState } from 'react';
import { findNpcClassData } from '../lancer/lancerData.js';

import './DraftCard.scss';


const DraftCard = ({
  npcID
}) => {

  const npcData = findNpcClassData(npcID)

  return (
    <div className='DraftCard'>
      {npcData.name}
    </div>
  )
}

export default DraftCard ;
