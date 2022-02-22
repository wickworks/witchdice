import React, { useState } from 'react';
import { NpcCardFull, NpcCardGrunt, NpcCardInactive } from './NpcCard.jsx';

import './ActiveNpcBox.scss';

const ActiveNpcBox = ({
  label,
  condensed = true,

  npcList,
  setNpcStatus,
  setActiveNpcFingerprint,
}) => {
  const condensedClass = condensed ? 'condensed' : 'full'

  return (
    <div className={`ActiveNpcBox ${condensedClass}`}>
      <div className={`panel ${condensedClass}`}>
        <div className={`title-bar ${condensedClass}`}>
          <h2>{label}</h2>
        </div>

        <div className={`active-npc-container ${condensedClass}`}>
          {npcList.map((npc, i) => {

            if (condensed) {
              return (
                <NpcCardInactive
                  key={npc.fingerprint}
                  npc={npc}
                  onClick={() => setNpcStatus(npc.fingerprint, 'active')}
                />
              )
            } else if (npc.templates.includes('npct_grunt')) {
              return (
                <NpcCardGrunt
                  key={npc.fingerprint}
                  npc={npc}
                  onClickDie={() => setNpcStatus(npc.fingerprint, 'casualties')}
                  onClickReserve={() => setNpcStatus(npc.fingerprint, 'reinforcements')}
                  onSelect={() => setActiveNpcFingerprint(npc.fingerprint)}
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
                />
              )
            }
          })}

        </div>
      </div>
    </div>
  );
}




export default ActiveNpcBox;
