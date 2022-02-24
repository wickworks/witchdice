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

const NpcPortrait = ({ npc, npcData }) => {
  return ( npc.cloudImage ?
    <div className='NpcPortrait'>
      <img src={npc.cloudImage} alt={'mech portrait'} />
    </div>
  :
    <div className={`NpcPortrait asset ${npcData.class} mf_standard_pattern_i_everest`} />
  )
}

const ActivationsTracker = ({ npc, updateNpcState }) => {
  const current = npc.currentStats.activations
  const max = getStat('activations',npc)
  return (
    <div className='ActivationsTracker'>
      {[...Array(max)].map((undef, i) => {
        const isFilled = (i >= current)
        const onClickSetActivations = current + (isFilled ? 1 : -1)
        return (
          <input
            type='checkbox'
            checked={isFilled}
            onChange={() => updateNpcState({activations: onClickSetActivations}, npc.fingerprint)}
            key={i}
          />
        )
      })}
    </div>
  )
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

      <NpcPortrait npc={npc} npcData={npcData} />

      <div className={`role asset ${npcData.role.toLowerCase()}`} />
      <div className={`tier asset npc-tier-${npc.tier}`} />
    </button>
  );
}


const NpcCardGrunt = ({
  npc,
  updateNpcState,
  onClickDie,
  onClickReserve,
  onSelect,
  isSelected,
}) => {
  const npcData = findNpcClassData(npc.class)

  return (
    <div className='NpcCardGrunt' id={isSelected ? 'selected-npc-card' : ''}>

      <button className='ClickToSelect' onClick={onSelect} disabled={isSelected}/>

      <ActivationsTracker npc={npc} updateNpcState={updateNpcState} />

      {/*<div className={`tier asset npc-tier-${npc.tier}`} />*/}

      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <NpcPortrait npc={npc} npcData={npcData} />

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
  updateNpcState,
  onClickDie,
  onClickReserve,
  onSelect,
  isSelected,
}) => {
  const npcData = findNpcClassData(npc.class)

  const maxStress = getStat('stress',npc)
  const maxStructure = getStat('structure',npc)

  return (
    <div className='NpcCardFull' id={isSelected ? 'selected-npc-card' : ''}>
      <button className='ClickToSelect' onClick={onSelect} disabled={isSelected} />

      <ActivationsTracker npc={npc} updateNpcState={updateNpcState} />

      <div className='name'>
        {npc.name}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className='hp-label'>HP</div>

      <div className='hp'>
        {npc.currentStats.hp}/{getStat('hp',npc)}
      </div>

      <div className='structure-bar'>
        {(maxStructure > 1) && [...Array(getStat('structure',npc))].map((undef, i) => {
          const filledClass = (i < npc.currentStats.structure) ? 'filled' : 'empty'
          return (<div className={`asset structure ${filledClass}`} key={i} />)
        })}
      </div>

      <NpcPortrait npc={npc} npcData={npcData} />

      <div className='conditions'>
        {npc.conditions.join(', ')}
      </div>

      <div className='stress-bar'>
        {(maxStress > 1) && [...Array(getStat('stress',npc))].map((undef, i) => {
          const filledClass = (i < (npc.currentStats.stress || 1)) ? 'filled' : 'empty'
          return (<div className={`asset reactor ${filledClass}`} key={i} />)
        })}
      </div>

      <div className='heat-label'>Heat</div>

      <div className='heat'>
        {npc.currentStats.heatcap}/{getStat('heatcap',npc)}
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
