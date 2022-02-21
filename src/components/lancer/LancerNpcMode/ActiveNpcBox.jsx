import React, { useState } from 'react';

import './ActiveNpcBox.scss';

const ActiveNpcBox = ({
  label,
  condensed = true,

  npcList,
}) => {
  // const [activeNpcID, setActiveNpcID] = useState(null);

  // const npcEntries = [
  //   {name: 'THE WORMS', class: 'Hornet', role: 'Controller', tier: 1, id: '123'},
  //   {name: 'THE EARLY', class: 'Ronin', role: 'Striker', tier: 1, id: '321'},
  //   {name: 'THE BIRDS', class: 'Cataphract', role: 'Striker', tier: 1, id: '222'},
  // ]

  console.log(label,'npcList',npcList);

  return (
    <div className={`ActiveNpcBox ${condensed ? 'condensed' : 'full'}`}>
      <div className='panel'>
        <div className="title-bar">
          <h2>{label}</h2>
        </div>

        <div className="active-npc-container">
          {npcList.map((npcData, i) =>
            <div key={`${npcData.id}-${i}`}>
              {npcData.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




export default ActiveNpcBox;
