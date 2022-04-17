import React, { useState } from 'react';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';

const MainSimple = ({
  partyConnected,
  partyRoom,
}) => {
  const [triggerRerender, setTriggerRerender] = useState(false);

  return (
    <div className='MainSimple'>
      <SquadClockPanel
        partyConnected={partyConnected}
        partyRoom={partyRoom}
        setTriggerRerender={setTriggerRerender}
        triggerRerender={triggerRerender}
      />
    </div>
  )
}

export default MainSimple ;
