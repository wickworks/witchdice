import React, { useState } from 'react';

import './NpcRoster.scss';

const NpcRoster = ({

}) => {
  // const [activeNpcID, setActiveNpcID] = useState(null);

  const npcEntries = [
    {name: 'THE WORMS', class: 'Hornet', role: 'Controller', tier: 1, id: '123'},
    {name: 'THE EARLY', class: 'Ronin', role: 'Striker', tier: 1, id: '321'},
    {name: 'THE BIRDS', class: 'Cataphract', role: 'Striker', tier: 1, id: '222'},
  ]

  return (
    <div className='NpcRoster'>
      <div className='roster-container'>

        <div className="title-bar">
          <h2>NPC Roster</h2>
        </div>

        <table className="roster-table">
          <thead>
            <tr className='headers'>
              <th className='name'>Name</th>
              <th className='class'>Class</th>
              <th className='role'>Role</th>
              <th className='tier'>Tier</th>
            </tr>
          </thead>

          <tbody>
            {npcEntries.map(entry =>
              <tr className='entry' key={entry.id}>
                <td className='name'>{entry.name}</td>
                <td className='class'>{entry.class}</td>
                <td className='role'><div className={`asset ${entry.role.toLowerCase()}`}/></td>
                <td className='tier'>{entry.tier}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}




export default NpcRoster;
