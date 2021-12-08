import React, { useState } from 'react';
import MechCentralDiamond from './MechCentralDiamond.jsx';
import MechNumberLabel from './MechNumberLabel.jsx';
import MechNumberBar from './MechNumberBar.jsx';
import MechSingleStat from './MechSingleStat.jsx';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
  tickUpOvercharge,
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
  const [currentBurn, setCurrentBurn] = useState(activeMech.burn);
  const [currentOverchargeDie, setCurrentOverchargeDie] = useState('1');
  const [currentCore, setCurrentCore] = useState(!!activeMech.current_core_energy);

  const [currentStructure, setCurrentStructure] = useState(4);
  const [currentStress, setCurrentStress] = useState(4);

  // console.log('activemech', activeMech);
  // console.log('frameData', frameData);

  const maxHP = 20 // getMechMaxHP(activeMech, activePilot, frameData)

  const overshieldPlusHP = parseInt(currentHP) + parseInt(currentOvershield)
  const overshieldPlusMaxHP = maxHP + parseInt(currentOvershield)

  const handleHPBarClick = (newValue) => {
    var change = parseInt(newValue) - overshieldPlusHP
    changeHealth(change)
  }

  function changeHealth(change) {
    const overshield = parseInt(currentOvershield)
    const hp = parseInt(currentHP)
    var newHP = hp;

    // DAMAGE
    if (change <= 0) {
      // overshield takes all of it
      if (Math.abs(change) <= overshield) {
        setCurrentOvershield(overshield + change)

      // overshield takes some, rest goes to HP
      } else {
        change += overshield
        setCurrentOvershield(0)
        newHP = hp + change
      }
    // HEALING
    } else if (change > 0) {
      newHP = hp + change
    }

    newHP = Math.min(Math.max(newHP, 0), maxHP)
    setCurrentHP(newHP)
  }

  // dunno, just tick it up or something
  const handleOvershieldIconClick = () => {
    setCurrentOvershield(parseInt(currentOvershield) + 1)
  }

  // do the current burn to HP
  const handleBurnIconClick = () => {
    changeHealth(parseInt(currentBurn) * -1)
  }

  // roll the current for heat, increase the counter
  const handleOverchargeClick = () => {
    console.log('ROLL overcharge ', currentOverchargeDie);
    setCurrentOverchargeDie( tickUpOvercharge(currentOverchargeDie) );
  }

  const burnTooltip = {
    title: 'BURN',
    content: 'At the end of their turn, characters with ' +
      'burn roll an ENGINEERING check. On a ' +
      'success, it clears; otherwise, ' +
      'take damage equal to the amount of ' +
      'burn currently marked.',
    hint: 'Click to take your current BURN as damage.'
  }

  const overshieldTooltip = {
    title: 'OVERSHIELD',
    content: 'Damage is dealt to OVERSHIELD first, then HP. ' +
      'Retain only the highest value of ' +
      'OVERSHIELD applied – it does not stack. ' +
      'It benefits normally from anything that would affect ' +
      'damage (e.g. resistance, armor, etc).',
    hint: 'Click to gain +1 overshield.'
  }

  const overchargeTooltip = {
    title: 'OVERCHARGE',
    content: 'Pilots can overcharge their mech, allowing them to ' +
      'make an additional quick action at the cost of heat.',
    hint: 'Click to increase heat cost. Right-click to decrease.'
  }

  return (
    <div className='MechState asset butterfly-watermark'>

      <MechCentralDiamond
        activeMech={activeMech}
        activePilot={activePilot}
        frameData={frameData}

        currentCore={currentCore}
        setCurrentCore={setCurrentCore}
      />

      <div className='hull-and-engineering'>
        <div className='hull-container'>

          <div className='hp-label'>
            <MechNumberLabel
              icon={parseInt(currentOvershield) > 0 ? "overshield" : 'overshield-outline'}
              onIconClick={handleOvershieldIconClick}
              iconTooltipData={overshieldTooltip}
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
              maxNumber={getMechMaxHeatCap(activeMech, activePilot, frameData)}
              currentNumber={currentHeat}
              setCurrentNumber={setCurrentHeat}
              leftToRight={true}
            />

            <MechNumberLabel
              icon='burn'
              onIconClick={handleBurnIconClick}
              iconTooltipData={burnTooltip}
              extraClass={`condensed ${parseInt(currentBurn) > 0 ? 'burning' : ''}`}
              maxNumber={null}
              currentNumber={parseInt(currentBurn)}
              setCurrentNumber={setCurrentBurn}
              leftToRight={false}
            />
          </div>

          <MechNumberBar
            maxNumber={getMechMaxHeatCap(activeMech, activePilot, frameData)}
            currentNumber={currentHeat}
            setCurrentNumber={setCurrentHeat}
            overchargeDie={currentOverchargeDie}
            handleOverchargeClick={handleOverchargeClick}
            overchargeTooltip={overchargeTooltip}
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
