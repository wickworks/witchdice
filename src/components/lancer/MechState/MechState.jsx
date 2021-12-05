import React, { useState } from 'react';
import MechCentralDiamond from './MechCentralDiamond.jsx';
import MechNumberLabel from './MechNumberLabel.jsx';
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
  frameData,
}) => {
  const [currentHP, setCurrentHP] = useState(activeMech.current_hp);
  const [currentHeat, setCurrentHeat] = useState(activeMech.current_heat);

  const [currentStructure, setCurrentStructure] = useState(4);
  const [currentStress, setCurrentStress] = useState(4);

  console.log('activemech', activeMech);
  console.log('frameData', frameData);

  console.log('frameData.stats.repcap', frameData.stats.repcap);

  return (
    <div className='MechState asset butterfly-watermark'>

      <MechCentralDiamond
        activeMech={activeMech}
        activePilot={activePilot}
        frameData={frameData}
      />

      <div className='hull-and-engineering'>
        <div className='hull-container'>

          <div className='hp-label'>
            <MechNumberLabel
              label="HP"
              maxNumber={getMechMaxHP(activeMech, activePilot)}
              currentNumber={currentHP}
              setCurrentNumber={setCurrentHP}
              leftToRight={false}
            />
          </div>

          <MechNumberBar
            maxNumber={getMechMaxHP(activeMech, activePilot)}
            currentNumber={currentHP}
            setCurrentNumber={setCurrentHP}
            leftToRight={false}
          />

          <div className='structure-container'>
            <MechNumberBar
              extraClass='condensed'
              maxNumber={4}
              currentNumber={currentStructure}
              setCurrentNumber={setCurrentStructure}
              leftToRight={false}
            />
            <div className='mini-label structure'>
              <span>{currentStructure}</span>
              Structure
            </div>
          </div>
        </div>

        <div className='engineering-container'>

          <div className='heat-label'>
            <MechNumberLabel
              label="Heat"
              maxNumber={getMechMaxHeatCap(activeMech, activePilot)}
              currentNumber={currentHeat}
              setCurrentNumber={setCurrentHeat}
              leftToRight={true}
            />
          </div>

          <MechNumberBar
            maxNumber={getMechMaxHeatCap(activeMech, activePilot)}
            currentNumber={currentHeat}
            setCurrentNumber={setCurrentHeat}
            leftToRight={true}
          />

          <div className='stress-container'>
            <MechNumberBar
              extraClass='condensed'
              maxNumber={4}
              currentNumber={currentStress}
              setCurrentNumber={setCurrentStress}
              leftToRight={true}
            />
            <div className='mini-label stress'>
              Stress
              <span>{currentStress}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='agility-and-systems'>
        <div className='agility-container'>
          <MechSingleStat
            label="Evasion"
            extraClass='evasion'
            number={frameData.stats.evasion}
            leftToRight={false}
          />

          <MechSingleStat
            label="Move Speed"
            extraClass='speed condensed'
            number={frameData.stats.speed}
            leftToRight={false}
          />

        </div>
        <div className='systems-container'>

          <MechSingleStat
            label="E-Defense"
            extraClass='e-def'
            number={frameData.stats.edef}
            leftToRight={true}
          />

          <MechSingleStat
            label="Sensor Range"
            extraClass='sensors condensed'
            number={frameData.stats.sensor_range}
            leftToRight={true}
          />
        </div>
      </div>

      <div className='save-target'>
        <div className='label'>
          Save Target
        </div>

        <div className='number'>
          {frameData.stats.save}
        </div>
      </div>


    </div>
  );
}




export default MechState;
