import React, { useState } from 'react';
import MechNumberBar from './MechNumberBar.jsx';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
} from './mechStateUtils.js';


import './MechState.scss';

const MechState = ({
  activeMech,
  activePilot,
}) => {
  const [currentHP, setCurrentHP] = useState(activeMech.current_hp);
  const [currentHeat, setCurrentHeat] = useState(activeMech.current_heat);

  console.log('activemech', activeMech);

  return (
    <div className='MechState'>

      <div className="central-diamond-portrait asset ssc-watermark">
        <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
      </div>

      <div className='health-and-heat'>

        <MechNumberBar
          label="HP"
          extraClass='hp-bar'
          maxNumber={getMechMaxHP(activeMech, activePilot)}
          currentNumber={currentHP}
          setCurrentNumber={setCurrentHP}
          leftToRight={false}
        />

        <MechNumberBar
          label="Heat Cap"
          extraClass='heat-bar'
          maxNumber={getMechMaxHeatCap(activeMech, activePilot)}
          currentNumber={currentHeat}
          setCurrentNumber={setCurrentHeat}
          leftToRight={true}
        />
      </div>



    </div>
  );
}




export default MechState;
