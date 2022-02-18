import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import ActiveNpcBox from './ActiveNpcBox.jsx';
import NpcMechSheet from './NpcMechSheet.jsx';
import NpcRoster from './NpcRoster.jsx';

import { deepCopy } from '../../../utils.js';


// import npcJson from './GRAVITYOFTHESITUATION.json';
import npcJson from './THEWORMS.json';

import './LancerNpcMode.scss';

const emptyEncounter = { active: [], reinforcements: [], casualties: [], npcData: {} }

const LancerNpcMode = ({
  setTriggerRerender,
  triggerRerender,

  partyConnected,
  partyRoom,
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  //
  const [activeEncounter, setActiveEncounter] = useState(emptyEncounter)
  //
  // const activeNpc = activeNpcID && loadNpcData(activeNpcID); // load the pilot data from local storage
  const activeNpc = npcJson

  const updateNpcState = () => {

  }

  const loadNpcData = (npcId) => {
    return npcJson;
  }

  const addNpcToEncounter = (npcId) => {
    console.log('Adding npc to encounter', npcId);
    const npcData = loadNpcData(npcId)

    if (npcData) {
      let newEncounter = deepCopy(activeEncounter)
      newEncounter.reinforcements.push(npcId)
      newEncounter.npcData[npcId] = npcData

      setActiveEncounter(newEncounter)
    }
  }

  const npcListActive = activeEncounter.active.map(id => activeEncounter.npcData[id])
  const npcListReinforcements = activeEncounter.reinforcements.map(id => activeEncounter.npcData[id])
  const npcListCasualties = activeEncounter.casualties.map(id => activeEncounter.npcData[id])

  return (
    <div className='LancerNpcMode'>

      <div className='encounter-and-roster-container'>
        <NpcRoster
          addNpcToEncounter={addNpcToEncounter}
        />

        <PlainList title='Encounter' extraClass='encounters'>
          <EntryList
            entries={[]}
            handleEntryClick={()=>{}}
            activeCharacterID={null}
            deleteEnabled={true}
          />
        </PlainList>
      </div>

      <div className='active-npc-boxes-container'>
        <ActiveNpcBox
          label={'Reinforcements'}
          condensed={true}
          npcList={npcListReinforcements}
        />
        <ActiveNpcBox
          label={'Casualties'}
          condensed={true}
          npcList={npcListCasualties}
        />
        <ActiveNpcBox
          label={'Active Combatants'}
          condensed={false}
          npcList={npcListActive}
        />

      </div>


      <NpcMechSheet
        activeNpc={activeNpc}

        setTriggerRerender={setTriggerRerender}
        triggerRerender={triggerRerender}

        setPartyLastAttackKey={setPartyLastAttackKey}
        setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
        setRollSummaryData={setRollSummaryData}
      />

    </div>
  );
}




export default LancerNpcMode;
