import React, { useState } from 'react';
import { capitalize } from '../../../utils.js';

import { getStat } from './npcUtils.js';

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
  count,
  onClick,
}) => {
  const npcData = findNpcClassData(npc.class)
  // console.log('npcData',npcData);

  return (
    <button className='NpcCardInactive' onClick={onClick}>
      <div className='count'>
        {count}
      </div>

      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className={`portrait asset ${npcData.class} mf_standard_pattern_i_everest`} />

      <div className={`role asset ${npcData.role.toLowerCase()}`} />
      <div className={`tier asset npc-tier-${npc.tier}`} />
    </button>
  );
}


const NpcCardGrunt = ({
  npc,
  onClickDie,
  onClickReserve,
  onSelect,
  isSelected,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardGrunt' id={isSelected ? 'selected-npc-card' : ''}>

      <button className='ClickToSelect' onClick={onSelect} disabled={isSelected}/>

      <div className='ActivationsTracker'>
        <input type='checkbox' />
      </div>

      {/*<div className={`tier asset npc-tier-${npc.tier}`} />*/}

      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className={`portrait asset ${npcData.class} mf_standard_pattern_i_everest`} />

      <div className='conditions'>
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
  onClickDie,
  onClickReserve,
  onSelect,
  isSelected,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardFull' id={isSelected ? 'selected-npc-card' : ''}>
      <button className='ClickToSelect' onClick={onSelect} disabled={isSelected} />

      <div className='ActivationsTracker'>
        <input type='checkbox' />
      </div>

      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className='structure'>
        {[...Array(getStat('structure',npc))].map((undef, i) => {
          const filledClass = (i < npc.currentStats.structure) ? 'filled' : 'empty'
          return (<div className={`asset structure ${filledClass}`} key={i} />)
        })}
      </div>

      <div className='hp'>
        <span className='numbers'>
          {npc.currentStats.hp}/{getStat('hp',npc)}
        </span>
        <span className='label'>HP</span>
      </div>

      <div className={`portrait asset ${npcData.class} mf_standard_pattern_i_everest`} />

      <div className='conditions'>
        {npc.conditions.join(', ')}
      </div>

      <div className='stress'>
        {[...Array(getStat('stress',npc))].map((undef, i) => {
          const filledClass = (i < (npc.currentStats.stress || 1)) ? 'filled' : 'empty'
          return (<div className={`asset reactor ${filledClass}`} />)
        })}
      </div>

      <div className='heat'>
        <span className='label'>Heat</span>
        <span className='numbers'>
          {npc.currentStats.heatcap}/{getStat('heatcap',npc)}
        </span>

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


export { NpcCardFull, NpcCardGrunt, NpcCardInactive };
