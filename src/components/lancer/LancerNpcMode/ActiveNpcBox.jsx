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
        <div className="title-bar">
          <h2>{label}</h2>
        </div>

        <div className={`active-npc-container ${condensedClass}`}>
          {npcList.map((npc, i) => {
            const key = `${npc.id}-${i}`

            if (condensed) {
              return (<NpcCardInactive npc={npc} key={key} onClick={() => setNpcStatus(i, 'active')}/>)
            } else if (npc.templates.includes('npct_grunt')) {
              return (<NpcCardGrunt npc={npc} key={key}/>)
            } else {
              return (<NpcCardFull npc={npc} key={key}/>)
            }
          })}

        </div>
      </div>
    </div>
  );
}




export default ActiveNpcBox;
