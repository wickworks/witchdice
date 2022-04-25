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
  deleteNpc,
  deleteAllNpcsWithLabel,
  setIsUploadingNewFile,
  hasActiveEncounter,
}) => {
  const [openLabels, setOpenLabels] = useState([])

  const toggleLabelOpen = (label) => {
    const newOpenLabels = [...openLabels]
    const labelIndex = newOpenLabels.indexOf(label);
    if (labelIndex >= 0) {
      newOpenLabels.splice(labelIndex, 1) // REMOVE label
    } else {
      newOpenLabels.push(label);          // ADD label
    }
    setOpenLabels(newOpenLabels);
  }

  const buttonsDisabled = !hasActiveEncounter

  const sortedLibrary = Object.values(npcLibrary).sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  })

  // console.log('npcLibrary',npcLibrary);

  let noLabelNpcs = []
  let libraryByLabel = {}
  Object.values(sortedLibrary).forEach(npc => {
    if (npc.labels.length > 0) {
      npc.labels.forEach(label => {
        if (label in libraryByLabel) { libraryByLabel[label].push(npc) } else { libraryByLabel[label] = [npc] }
      })
    } else {
      noLabelNpcs.push(npc)
    }
  });


  function renderNpcRow(npc) {
    const npcData = findNpcClassData(npc.class)

    const onClickNpc = () => {
      if (!buttonsDisabled) addNpcToEncounter(npc.id)
    }

    return (
      <tr
        className={`npc ${buttonsDisabled ? 'disabled' : ''}`}
        key={npc.id}
      >
        <td className='name' onClick={onClickNpc}>
          {npc.name}
        </td>
        <td className='class' onClick={onClickNpc}>
          {capitalize(npcData.name.toLowerCase())}
        </td>
        <td className='role' onClick={onClickNpc}>
          <div className={`asset ${npcData.role.toLowerCase()}`}/>
        </td>
        <td className='tier' onClick={onClickNpc}>
          {npc.tier}
        </td>
        <td className='delete' onClick={() => deleteNpc(npc)}>
          <button className='asset trash' />
        </td>
      </tr>
    )
  }

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

        <div className='table-scrollable-area'>
          <table className="roster-table">
            <thead>
              <tr className='headers'>
                <th className='name'>Name</th>
                <th className='class'>Class</th>
                <th className='role'>Role</th>
                <th className='tier'>Tier</th>
                <th className='delete'></th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(libraryByLabel).map(label => {
                const isOpen = openLabels.includes(label)
                return (
                  <React.Fragment key={label}>
                    <tr
                      className={`group-label ${isOpen ? 'open' : 'closed'}`}
                    >
                      <td
                        colSpan={4}
                        onClick={() => toggleLabelOpen(label)}
                      >
                        <div className='label-container'>
                          <span className={`asset arrow-sharp ${isOpen ? '' : 'reversed'}`} />
                          {label}
                        </div>
                      </td>
                      <td className='delete' onClick={() => deleteAllNpcsWithLabel(label)}>
                        <button className='asset trash' />
                      </td>
                    </tr>

                    { isOpen && libraryByLabel[label].map(npc => renderNpcRow(npc)) }
                  </React.Fragment>
                )
              })}

              {noLabelNpcs.map(npc => renderNpcRow(npc))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}


export default NpcRoster;
