import React, { useState } from 'react';
import { capitalize } from '../../../utils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
} from '../lancerData.js';

import './NpcCard.scss';


const NpcCardInactive = ({
  npc,
  onClick,
}) => {
  const npcData = findNpcClassData(npc.class)
  // console.log('npcData',npcData);

  return (
    <button className='NpcCardInactive' onClick={onClick}>
      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {capitalize(npcData.name.toLowerCase())}
      </div>

      <div className={`portrait asset ${npcData.class} striker`} />

      <div className={`role asset ${npcData.role.toLowerCase()}`} />
      <div className={`tier asset npc-tier-${npc.tier}`} />
    </button>
  );
}


const NpcCardGrunt = ({
  npc,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardGrunt'>


    </div>
  );
}


const NpcCardFull = ({
  npc,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardFull'>


    </div>
  );
}



export { NpcCardFull, NpcCardGrunt, NpcCardInactive };
