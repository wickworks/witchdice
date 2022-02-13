import React, { useState, useEffect } from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

// import './LancerNpcMode.scss';

const LancerNpcMode = ({
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

  const activeNpc = {}

  const updateNpcState = () => {

  }

  return (
    <div className='LancerNpcMode'>

      <MechSheet
        activeMech={activeNpc}
        activePilot={null}
        updateMechState={updateNpcState}

        setPartyLastAttackKey={setPartyLastAttackKey}
        setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
        setRollSummaryData={setRollSummaryData}
      />

    </div>
  );
}




export default LancerNpcMode;
