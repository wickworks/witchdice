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

  const [currentStructure, setCurrentStructure] = useState(4);
  const [currentStress, setCurrentStress] = useState(4);

  console.log('activemech', activeMech);

  return (
    <div className='MechState'>

      <div className="central-diamond-portrait asset ssc-watermark">
        <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
      </div>

      <div className='health-and-heat'>


        <div className='health-container'>
          <MechNumberBar
            label="Health"
            extraClass='hp-bar'
            maxNumber={getMechMaxHP(activeMech, activePilot)}
            currentNumber={currentHP}
            setCurrentNumber={setCurrentHP}
            leftToRight={false}
          />

          <MechNumberBar
            label="Structure"
            extraClass='structure condensed'
            maxNumber={4}
            currentNumber={currentStructure}
            setCurrentNumber={setCurrentStructure}
            leftToRight={false}
            skipManualInput={true}
          />
        </div>

        <div className='heat-container'>
          <MechNumberBar
            label="Heat"
            extraClass='heat-bar'
            maxNumber={getMechMaxHeatCap(activeMech, activePilot)}
            currentNumber={currentHeat}
            setCurrentNumber={setCurrentHeat}
            leftToRight={true}
          />

          <MechNumberBar
            label="Stress"
            extraClass='stress condensed'
            maxNumber={4}
            currentNumber={currentStress}
            setCurrentNumber={setCurrentStress}
            leftToRight={true}
            skipManualInput={true}
          />
        </div>
      </div>



    </div>
  );
}




export default MechState;
