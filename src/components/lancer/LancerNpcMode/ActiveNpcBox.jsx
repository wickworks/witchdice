import React, { useState } from 'react';
import { NpcCardFull, NpcCardGrunt, NpcCardInactive } from './NpcCard.jsx';

import './ActiveNpcBox.scss';

const ActiveNpcBox = ({
  label,
  condensed = true,

  npcList,
  setNpcStatus,
}) => {
  // const [activeNpcID, setActiveNpcID] = useState(null);

  // const npcEntries = [
  //   {name: 'THE WORMS', class: 'Hornet', role: 'Controller', tier: 1, id: '123'},
  //   {name: 'THE EARLY', class: 'Ronin', role: 'Striker', tier: 1, id: '321'},
  //   {name: 'THE BIRDS', class: 'Cataphract', role: 'Striker', tier: 1, id: '222'},
  // ]

  // console.log(label,'npcList',npcList);

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
                />
              )
            } else {
              return (
                <NpcCardFull
                  key={npc.fingerprint}
                  npc={npc}
                  onClickDie={() => setNpcStatus(npc.fingerprint, 'casualties')}
                  onClickReserve={() => setNpcStatus(npc.fingerprint, 'reinforcements')}
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
