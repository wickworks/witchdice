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
          currentNumber={activeMech.current_hp}
          leftToRight={false}
        />

        <MechNumberBar
          label="Heat Cap"
          extraClass='heat-bar'
          maxNumber={getMechMaxHeatCap(activeMech, activePilot)}
          currentNumber={3 || activeMech.current_heat}
          leftToRight={true}
        />
      </div>



    </div>
  );
}




export default MechState;
