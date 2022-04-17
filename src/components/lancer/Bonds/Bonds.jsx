import React, { useState } from 'react';
import BondSheet from './BondSheet.jsx';
import ChooseNewBond from './ChooseNewBond.jsx';
import './Bonds.scss';


const Bonds = ({
  activePilot,
  triggerRerender,
  setTriggerRerender,
}) => {
  const [isChoosingNewBond, setIsChoosingNewBond] = useState(!!activePilot.bondId)

  const setPilotBond = (bondID) => {
    // ???
    setTriggerRerender(!triggerRerender)
    setIsChoosingNewBond(false)
  }

  return (
    <div className='Bonds'>
      <div className='bonds-page'>
        {isChoosingNewBond ?
          <ChooseNewBond setPilotBond={setPilotBond} />
        :
          <BondSheet
            activePilot={activePilot}
            triggerRerender={triggerRerender}
            setTriggerRerender={setTriggerRerender}
          />
        }
      </div>
    </div>
  );
}

export default Bonds ;
