import React from 'react';

import './MainView.scss';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';

const MainView = ({
  allPartyActionData,
}) => {

  return (
    <div className='MainView'>
      <RollHistory
        allPartyActionData={allPartyActionData}
      />
    </div>
  )
}

export default MainView ;
