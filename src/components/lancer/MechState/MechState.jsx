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
  const [currentOvershield, setCurrentOvershield] = useState(activeMech.overshield);
  const [currentHP, setCurrentHP] = useState(activeMech.current_hp);
  const [currentHeat, setCurrentHeat] = useState(activeMech.current_heat);

  const [currentStructure, setCurrentStructure] = useState(4);
  const [currentStress, setCurrentStress] = useState(4);

  console.log('activemech', activeMech);
  console.log('frameData', frameData);

  const maxHP = getMechMaxHP(activeMech, activePilot)

  const overshieldPlusHP = parseInt(currentHP) + parseInt(currentOvershield)
  const overshieldPlusMaxHP = maxHP + parseInt(currentOvershield)

  const handleHPBarClick = (newValue) => {
    const overshield = parseInt(currentOvershield)
    const hp = parseInt(currentHP)
    var change = parseInt(newValue) - overshieldPlusHP

    // if change is 0, that means they clicked the end of the bar; do 1 damage
    if (change === 0 && overshieldPlusHP >= 1) {
      change = -1;
    }


    // DAMAGE
    if (change <= 0) {
      // overshield takes all of it
      if (Math.abs(change) <= overshield) {
        setCurrentOvershield(overshield + change)

      // overshield takes some, rest goes to HP
      } else {
        change += overshield
        setCurrentOvershield(0)
        setCurrentHP(hp + change)
      }

    // HEALING
    } else if (change > 0) {
      setCurrentHP(hp + change)
    }
  }

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
              icon={parseInt(currentOvershield) > 0 ? "overshield" : 'overshield-outline'}
              extraClass={`condensed ${parseInt(currentOvershield) > 0 ? 'overshield' : ''}`}
              maxNumber={null}
              currentNumber={parseInt(currentOvershield)}
              setCurrentNumber={setCurrentOvershield}
              leftToRight={true}
            />


            <MechNumberLabel
              label="HP"
              maxNumber={maxHP}
              currentNumber={parseInt(currentHP)}
              setCurrentNumber={setCurrentHP}
              leftToRight={false}
            />
          </div>

          <MechNumberBar
            maxNumber={overshieldPlusMaxHP}
            currentNumber={overshieldPlusHP}
            setCurrentNumber={handleHPBarClick}
            overshield={parseInt(currentOvershield)}
            armor={parseInt(frameData.stats.armor)}
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
