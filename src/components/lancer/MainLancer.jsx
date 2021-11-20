import React, { useState, useEffect } from 'react';
import PilotAndMechList from './PilotAndMechList.jsx';


import './MainLancer.scss';

const MainLancer = ({

}) => {

  return (
    <div className='MainLancer'>
      <PilotAndMechList
        allPilotEntries={[]}
        setActivePilotID={() => {}}
        activePilotID={null}
        deleteActivePilot={() => {}}
        createNewPilot={() => {}}

        allMechEntries={[]}
        setActiveMechID={() => {}}
        activeMechID={null}
      />
    </div>
  )
}

export default MainLancer;
