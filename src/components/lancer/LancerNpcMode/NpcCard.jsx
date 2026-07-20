import React from 'react';
import { capitalize } from '../../../utils.js';

import { getStat, getMarkerFromFingerprint } from './npcUtils.js';

import {
  findNpcClassData,
  findNpcTemplateData,
  getAllTemplateIds,
  getNpcName,
  getClassNames,
} from '../lancerData.js';

import './NpcCard.scss';





const NpcPortrait = ({ npc, npcData }) => {
  return ( npc.cloud_portrait ?
    <div className='NpcPortrait'>
      <img src={npc.cloud_portrait} alt={'mech portrait'} />
    </div>
  :
    <div className={`NpcPortrait asset ${npcData.class} mf_standard_pattern_i_everest`} />
  )
}

const ActivationsTracker = ({ npc, updateNpcState }) => {
  const current = npc.combat_data.stats.current.activations
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
  onDelete,
}) => {
  const npcData = findNpcClassData(npc.class)
  // console.log('npcData',npcData);

  return (
    <div className='NpcCardInactive'>
      <button className='card' onClick={onClick}>
        <div className='count' key={count}>
          {count}
        </div>

        <div className='name'>
          {getNpcName(npc)}
        </div>

        <div className='class'>
          {getClassNames(npc, npcData)}
        </div>

        <NpcPortrait npc={npc} npcData={npcData} />

        <div className={`role asset ${npcData.role.toLowerCase()}`} />
        <div className={`tier asset npc-tier-${npc.tier}`} />
      </button>
      <button className='delete' onClick={onDelete}>
        <div className='asset trash' />
      </button>
    </div>
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

      <div className='name-banner' />

      <div className='marker'>
        {getMarkerFromFingerprint(npc.fingerprint)}
      </div>

      {/*<div className={`tier asset npc-tier-${npc.tier}`} />*/}

      <div className='name'>
        {getNpcName(npc)}
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

      <div className='name-banner' />

      <div className='marker'>
        {getMarkerFromFingerprint(npc.fingerprint)}
      </div>

      <div className='name'>
        {getNpcName(npc)}
      </div>

      <div className='class'>
        {getClassNames(npc, npcData)}
      </div>

      <div className='hp-label'>HP</div>

      <div className='hp'>
        {npc.combat_data.stats.current.hp}/{getStat('hp',npc)}
      </div>

      <div className='structure-bar'>
        {(maxStructure > 1) && [...Array(getStat('structure',npc))].map((undef, i) => {
          const filledClass = (i < npc.combat_data.stats.current.structure) ? 'filled' : 'empty'
          return (<div className={`asset structure ${filledClass}`} key={i} />)
        })}
      </div>

      <NpcPortrait npc={npc} npcData={npcData} />

      <div className='conditions'>
        {npc.conditions.join(', ')}
      </div>

      <div className='stress-bar'>
        {(maxStress > 1) && [...Array(getStat('stress',npc))].map((undef, i) => {
          const filledClass = (i < (npc.combat_data.stats.current.stress || 1)) ? 'filled' : 'empty'
          return (<div className={`asset reactor ${filledClass}`} key={i} />)
        })}
      </div>

      <div className='heat-label'>Heat</div>

      <div className='heat'>
        {npc.combat_data.stats.current.heat}/{getStat('heat',npc)}
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
