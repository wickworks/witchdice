import React, { useState } from 'react';
import MechNumberBar from './MechNumberBar.jsx';
import MechSingleStat from './MechSingleStat.jsx';

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

      <div className='hull-and-engineering'>
        <div className='hull-container'>
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

        <div className='engineering-container'>
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

      <div className='agility-and-systems'>
        <div className='agility-container'>
          <MechSingleStat
            label="Evasion"
            extraClass='evasion'
            number={10}
            leftToRight={false}
          />

          <MechSingleStat
            label="speed"
            extraClass='speed condensed'
            number={4}
            leftToRight={false}
          />

        </div>
        <div className='systems-container'>

          <MechSingleStat
            label="E-Defense"
            extraClass='e-def'
            number={8}
            leftToRight={true}
          />

          <div className='sensors-and-save'>
            <MechSingleStat
              label="Sensor Range"
              extraClass='sensors'
              number={15}
              leftToRight={true}
            />

            <MechSingleStat
              label="Save Target"
              extraClass='save-target'
              number={10}
              leftToRight={true}
            />
          </div>
        </div>
      </div>


    </div>
  );
}




export default MechState;
