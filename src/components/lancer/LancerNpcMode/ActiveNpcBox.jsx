import React, { useState } from 'react';
import { NpcCardFull, NpcCardGrunt, NpcCardInactive } from './NpcCard.jsx';

import './ActiveNpcBox.scss';

const ActiveNpcBox = ({
  label,

  npcList,
  setNpcStatus,
  activeNpcFingerprint,
  setActiveNpcFingerprint,
}) => {


  return (
    <div className='ActiveNpcBox full'>
      <div className='title-bar full'>
        <h2>{label}</h2>
      </div>

      <div className='npcs-container full'>
        {npcList.map((npc, i) => {
          if (npc.templates.includes('npct_grunt')) {
            return (
              <NpcCardGrunt
                key={npc.fingerprint}
                npc={npc}
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
