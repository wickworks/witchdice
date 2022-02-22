import React, { useState } from 'react';
import { capitalize } from '../../../utils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
} from '../lancerData.js';

import './NpcRoster.scss';

const NpcRoster = ({
  npcLibrary,
  addNpcToEncounter,
  setIsUploadingNewFile,
}) => {

  return (
    <div className='NpcRoster'>
      <div className='roster-container'>

        <div className="title-bar">
          <h2>NPCs</h2>
          <button className="new-character" onClick={() => setIsUploadingNewFile(true)}>
            New
            <div className="asset plus"/>
          </button>
        </div>

        <table className="roster-table">
          <thead>
            <tr className='headers'>
              <th className='add'></th>
              <th className='name'>Name</th>
              <th className='class'>Class</th>
              <th className='role'>Role</th>
              <th className='tier'>Tier</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(npcLibrary).map((npcID,i) => {
              console.log('npcID',npcID);
              const npc = npcLibrary[npcID]
              const npcData = findNpcClassData(npc.class)

              return (
                <tr className='npc' key={`${npc.id}-${i}`}>
                  <td className='add'><button onClick={() => addNpcToEncounter(npc.id)}>+</button></td>
                  <td className='name'>{npc.name}</td>
                  <td className='class'>{capitalize(npcData.name.toLowerCase())}</td>
                  <td className='role'><div className={`asset ${npcData.role.toLowerCase()}`}/></td>
                  <td className='tier'>{npc.tier}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}


export default NpcRoster;
