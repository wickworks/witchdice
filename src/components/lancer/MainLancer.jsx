import React, { useState } from 'react';
import PilotAndMechList from './PilotAndMechList.jsx';
import { processPilotJson } from './process_pilot_json.js';
import { deepCopy } from '../../utils.js';

import './MainLancer.scss';

const MainLancer = ({

}) => {
  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

  const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const allMechEntries = activePilot ? activePilot.mechs : [];

  const createNewPilot = (pilot) => {
    let newData = deepCopy(allPilotEntries);
    newData.push(pilot);
    setAllPilotEntries(newData);
    setActivePilotID(pilot.id);
    setActiveMechID(0);
  }

  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( processPilotJson(e.target.result) )
    };
  }

  return (
    <div className='MainLancer'>

      <input type="file" onChange={uploadPilotFile} />

      <PilotAndMechList
        allPilotEntries={allPilotEntries}
        setActivePilotID={setActivePilotID}
        activePilotID={activePilotID}
        deleteActivePilot={() => {}}
        createNewPilot={() => {}}

        allMechEntries={allMechEntries}
        setActiveMechID={setActiveMechID}
        activeMechID={activeMechID}
      />
    </div>
  )
}

export default MainLancer;
