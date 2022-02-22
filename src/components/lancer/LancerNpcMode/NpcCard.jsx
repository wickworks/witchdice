import React, { useState } from 'react';
import { capitalize } from '../../../utils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
} from '../lancerData.js';

import './NpcCard.scss';


function getClassNames(npc, npcData) {
  let classNames = [ capitalize(npcData.name.toLowerCase()) ]

  let templateData = npc.templates.map(template => findNpcTemplateData(template))
  templateData.forEach(template => classNames.push(
    capitalize(template.name.toLowerCase())
  ))

  return classNames.join(' ')
}

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
        {getClassNames(npc, npcData)}
      </div>

      <div className={`portrait asset ${npcData.class} striker`} />

      <div className={`role asset ${npcData.role.toLowerCase()}`} />
      <div className={`tier asset npc-tier-${npc.tier}`} />
    </button>
  );
}


const NpcCardGrunt = ({
  npc,
  onClickDie,
  onClickReserve,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardGrunt'>

      <div className='activations'>
        <input type='checkbox' />
      </div>

      <div className={`tier asset npc-tier-${npc.tier}`} />


      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className={`portrait asset ${npcData.class} striker`} />

      <div className='class'>
        {npc.conditions.join(', ')}
      </div>


      <button className='DieOrReserveButton die' onClick={onClickDie}>
        <div className='asset necrotic' />
      </button>

      <button className='DieOrReserveButton reserve' onClick={onClickReserve}>
        <div className='asset force' />
      </button>

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
