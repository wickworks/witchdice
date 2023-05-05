import React, { useState } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';

import './MainOwlbear.scss';

const MainOwlbear = ({
  addNewDicebagPartyRoll,
  distantDicebagData,
  allPartyActionData,
  partyConnected,
  partyRoom,
}) => {



  // instead of changing the URL, change them in state here
  const allPageModes = ['Dice','History','Clocks','?']

  const [pageMode, setPageMode] = useState('Dice');
  const [triggerRerender, setTriggerRerender] = useState(false);

  return (
    <div className='MainOwlbear'>

      <div className='pagemode-switcher'>
        {allPageModes.map(mode =>
          <button
            onClick={() => setPageMode(mode)}
            className={pageMode === mode ? 'active' : ''}
            key={mode}
          >
            {mode}
          </button>
        )}
      </div>


      { pageMode === 'Dice' ?
        <DiceBag
          addNewDicebagPartyRoll={addNewDicebagPartyRoll}
          distantDicebagData={distantDicebagData}
          bookmarksEnabled={false}
        />
      : pageMode === 'History' ?
        <RollHistory
          allPartyActionData={allPartyActionData}
        />
      : pageMode === 'Clocks' ?
        <SquadClockPanel
          partyConnected={partyConnected}
          partyRoom={partyRoom}
          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}
        />
      : pageMode === '?' &&
        <TipsAndTricks
          abbreviated={true}
        />
      }

    </div>
  )
}

export default MainOwlbear ;
