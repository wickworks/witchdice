import React from 'react';
import { NpcCardFull, NpcCardGrunt, NpcCardInactive } from './NpcCard.jsx';

import './ActiveNpcBox.scss';

const ActiveNpcBox = ({
  label,

  npcList,
  setNpcStatus,
  activeNpcFingerprint,
  setActiveNpcFingerprint,
  updateNpcState,
  currentRound,
  setCurrentRound,
}) => {


  return (
    <div className='ActiveNpcBox full'>
      <div className='title-bar full'>
        <div className='spacer' />
        <h2>{label}</h2>
        <button
          className='end-round'
          onClick={() => setCurrentRound(currentRound+1)}
          onContextMenu={(e) => { e.preventDefault(); setCurrentRound(Math.max(1,currentRound-1)); } }
        >
          <div className='finish'>Finish</div>
          <div className='round-count'>Round {currentRound}</div>
        </button>
      </div>

      <div className='npcs-container full'>
        {npcList.map((npc, i) => {
          if (npc.templates.includes('npct_grunt')) {
            return (
              <NpcCardGrunt
                key={npc.fingerprint}
                npc={npc}
                updateNpcState={updateNpcState}
                onClickDie={() => setNpcStatus(npc.fingerprint, 'casualties')}
                onClickReserve={() => setNpcStatus(npc.fingerprint, 'reinforcements')}
                onSelect={() => setActiveNpcFingerprint(npc.fingerprint)}
                isSelected={npc.fingerprint === activeNpcFingerprint}
              />
            )
          } else {
            return (
              <NpcCardFull
                key={npc.fingerprint}
                npc={npc}
                updateNpcState={updateNpcState}
                onClickDie={() => setNpcStatus(npc.fingerprint, 'casualties')}
                onClickReserve={() => setNpcStatus(npc.fingerprint, 'reinforcements')}
                onSelect={() => setActiveNpcFingerprint(npc.fingerprint)}
                isSelected={npc.fingerprint === activeNpcFingerprint}
              />
            )
          }
        })}

      </div>
    </div>
  );
}

const CondensedNpcBox = ({
  label,

  npcList,
  setNpcStatus,
  activeNpcFingerprint,
  setActiveNpcFingerprint,
}) => {

  let npcCountByID = {}
  let condensedNpcList = []
  npcList.forEach(npc => {
    if (npc.id in npcCountByID) {
      npcCountByID[npc.id] += 1
    } else {
      npcCountByID[npc.id] = 1
      condensedNpcList.push(npc)
    }
  });

  condensedNpcList = condensedNpcList.sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  })

  return (
    <div className='ActiveNpcBox condensed'>
      <div className='title-bar condensed'>
        <h2>{label}</h2>
      </div>

      <div className='npcs-container condensed'>
        {condensedNpcList.map((npc, i) =>
          <NpcCardInactive
            key={npc.id}
            npc={npc}
            count={npcCountByID[npc.id]}
            onClick={() => setNpcStatus(npc.fingerprint, 'active')}
          />
        )}

      </div>
    </div>
  );
}




export { ActiveNpcBox, CondensedNpcBox };
