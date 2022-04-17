import React, { useState } from 'react';
import { savePilotData } from '../lancerLocalStorage.js';
import { deepCopy } from '../../../utils.js';
import BondSheet from './BondSheet.jsx';
import ChooseNewBond from './ChooseNewBond.jsx';
import './Bonds.scss';


const Bonds = ({
  activePilot,
  triggerRerender,
  setTriggerRerender,
}) => {
  const [isChoosingNewBond, setIsChoosingNewBond] = useState(!activePilot.bondId)

  const setPilotBond = (bondID) => {
    let newPilotData = deepCopy(activePilot);
    newPilotData.bondId = bondID
    savePilotData(newPilotData)
    setIsChoosingNewBond(false)
    setTriggerRerender(!triggerRerender)
  }

  return (
    <div className='Bonds'>
      <div className='bonds-page'>
        {isChoosingNewBond ?
          <ChooseNewBond setPilotBond={setPilotBond} currentBondId={activePilot.bondId} />
        :
          <BondSheet
            activePilot={activePilot}
            setIsChoosingNewBond={setIsChoosingNewBond}
            triggerRerender={triggerRerender}
            setTriggerRerender={setTriggerRerender}
          />
        }
      </div>
    </div>
  );
}

export default Bonds ;
