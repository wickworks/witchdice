import React, { useState, useEffect } from 'react';
import NpcMechSheet from './NpcMechSheet.jsx';

// import npcJson from './GRAVITYOFTHESITUATION.json';
import npcJson from './THEWORMS.json';

// import './LancerNpcMode.scss';

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
  // const [activeNpcID, setActiveNpcID] = useState(null);
  //
  // const activeNpc = activeNpcID && loadNpcData(activeNpcID); // load the pilot data from local storage

  const activeNpc = npcJson

  const updateNpcState = () => {

  }

  return (
    <div className='LancerNpcMode'>

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
