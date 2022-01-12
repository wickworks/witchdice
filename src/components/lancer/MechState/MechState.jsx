import React, { useState, useEffect } from 'react';
import MechCentralDiamond from './MechCentralDiamond.jsx';
import MechNumberLabel from './MechNumberLabel.jsx';
import MechNumberBar from './MechNumberBar.jsx';
import MechNumberIcon from './MechNumberIcon.jsx';
import MechSingleStat from './MechSingleStat.jsx';

import {
  OVERCHARGE_SEQUENCE,
} from '../lancerData.js';


import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMoveSpeed,
  getMechEvasion,
  getMechEDef,
  getMechSaveTarget,
} from './mechStateUtils.js';

import './MechState.scss';

const MAX_OVERSHIELD = 12
const MAX_BURN = 30

const burnTooltip = {
  title: 'BURN',
  content: 'At the end of their turn, characters with ' +
    'burn roll an ENGINEERING check. On a ' +
    'success, it clears; otherwise, ' +
    'take damage equal to the amount of ' +
    'burn currently marked.',
  hint: 'Click to add 1. Right-click to subtract 1.'
}

const overshieldTooltip = {
  title: 'OVERSHIELD',
  content: 'Damage is dealt to OVERSHIELD first, then HP. ' +
    'Retain only the highest value ' +
    '– it does not stack. ' +
    'It benefits normally from resistance, armor, etc. ',
  hint: 'Click to add 1. Right-click to subtract 1.'
}

const overchargeTooltip = {
  title: 'OVERCHARGE',
  content: 'Pilots can overcharge their mech, allowing them to ' +
    'make an additional quick action at the cost of heat.',
  hint: 'Click to tick up. Right-click to tick down.'
}

const coreTooltip = {
  title: 'CORE POWER',
  content: 'CP refers to a reservoir of high-efficiency reactor ' +
    'power, designed to be used in a quick burst. You only get CP when ' +
    'you start a mission or your mech receives a FULL REPAIR. ',
  hint: 'Click to expend. Right-click to recharge.'
}

const MechState = ({
  activeMech,
  activePilot,
  frameData,
  updateMechState,
}) => {
  const currentOvershield = activeMech.overshield;
  const setCurrentOvershield = (overshield) => updateMechState({overshield: overshield})

  const currentHP = activeMech.current_hp;
  const setCurrentHP = (current_hp) => updateMechState({current_hp: current_hp})

  const currentHeat = activeMech.current_heat;
  const setCurrentHeat = (current_heat) => updateMechState({current_heat: current_heat})

  const currentBurn = activeMech.burn;
  const setCurrentBurn = (burn) => updateMechState({burn: burn})

  const currentOverchargeIndex = activeMech.current_overcharge;
  const setCurrentOverchargeIndex = (current_overcharge) => updateMechState({current_overcharge: current_overcharge})

  const currentCore = !!activeMech.current_core_energy;
  const setCurrentCore = (hasCoreEnergy) => updateMechState({current_core_energy: hasCoreEnergy ? 1 : 0})

  const currentRepairs = activeMech.current_repairs;
  const setCurrentRepairs = (current_repairs) => updateMechState({current_repairs: current_repairs})

  const currentStructure = activeMech.current_structure;
  const setCurrentStructure = (current_structure) => updateMechState({current_structure: current_structure})

  const currentStress = activeMech.current_stress;
  const setCurrentStress = (current_stress) => updateMechState({current_stress: current_stress})

  // console.log('activemech', activeMech);
  // console.log('frameData', frameData);
  // console.log('customCounters', customCounters);

  const maxHP = getMechMaxHP(activeMech, activePilot, frameData)

  const overshieldPlusHP = parseInt(currentHP) + parseInt(currentOvershield)
  const overshieldPlusMaxHP = maxHP + parseInt(currentOvershield)

  const overchargeDie = OVERCHARGE_SEQUENCE[currentOverchargeIndex]

  const maxHeat = getMechMaxHeatCap(activeMech, activePilot, frameData)
  const isInDangerZone = parseInt(currentHeat) >= Math.ceil(parseInt(maxHeat) * .5)

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

  // tick overshield up/down
  const handleOvershieldIconClick = (rightClick) => {
    var newShield = parseInt(currentOvershield)
    if (rightClick) { newShield -= 1 } else { newShield += 1 }
    newShield = Math.min(Math.max(newShield, 0), MAX_OVERSHIELD)
    setCurrentOvershield(newShield)
  }

  // tick burn up/down
  const handleBurnIconClick = (rightClick) => {
    var newBurn = parseInt(currentBurn)
    if (rightClick) { newBurn -= 1 } else { newBurn += 1 }
    newBurn = Math.min(Math.max(newBurn, 0), MAX_BURN)
    setCurrentBurn(newBurn)
  }

  // roll the current for heat, increase the counter
  const handleOverchargeClick = (rightClick) => {
    var direction = rightClick ? -1 : 1
    var newIndex = Math.max(Math.min(currentOverchargeIndex + direction, OVERCHARGE_SEQUENCE.length-1), 0);
    setCurrentOverchargeIndex( newIndex );
  }

  return (
    <div className='MechState asset butterfly-watermark'>

      <MechCentralDiamond
        activeMech={activeMech}
        activePilot={activePilot}
        frameData={frameData}

        currentStress={currentStress}
        setCurrentStress={setCurrentStress}

        currentStructure={currentStructure}
        setCurrentStructure={setCurrentStructure}

        currentRepairs={currentRepairs}
        setCurrentRepairs={setCurrentRepairs}
      />

      <div className='hull-and-engineering'>
        <div className='hull-container'>

          <div className='hp-label'>
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
            burn={parseInt(currentBurn)}
            leftToRight={false}
          />


          <div className='overshield-and-burn'>
            <MechNumberIcon
              extraClass={`overshield ${parseInt(currentOvershield) > 0 ? 'active' : ''}`}
              icon={'overshield-outline'}
              onIconClick={() => handleOvershieldIconClick(false)}
              onIconRightClick={() => handleOvershieldIconClick(true)}
              iconTooltipData={overshieldTooltip}
              maxNumber={MAX_OVERSHIELD}
              currentNumber={parseInt(currentOvershield)}
              setCurrentNumber={setCurrentOvershield}
              leftToRight={false}
            />

            <MechNumberIcon
              extraClass={`burning ${parseInt(currentBurn) > 0 ? 'active' : ''}`}
              icon='burn'
              onIconClick={() => handleBurnIconClick(false)}
              onIconRightClick={() => handleBurnIconClick(true)}
              iconTooltipData={burnTooltip}
              maxNumber={MAX_BURN}
              currentNumber={parseInt(currentBurn)}
              setCurrentNumber={setCurrentBurn}
              leftToRight={false}
            />
          </div>
        </div>

        <div className='engineering-container'>

          <div className='heat-label'>
            <div className='danger-zone-container'>
              { isInDangerZone && '!! Danger Zone !!' }
            </div>

            <MechNumberLabel
              label="Heat"
              maxNumber={getMechMaxHeatCap(activeMech, activePilot, frameData)}
              currentNumber={currentHeat}
              setCurrentNumber={setCurrentHeat}
              leftToRight={true}
            />
          </div>

          <MechNumberBar
            maxNumber={getMechMaxHeatCap(activeMech, activePilot, frameData)}
            currentNumber={currentHeat}
            setCurrentNumber={setCurrentHeat}
            leftToRight={true}
          />

          <div className='overcharge-and-core'>
            <MechNumberIcon
              extraClass={`core-power ${currentCore ? 'active' : ''}`}
              icon='core-power'
              onIconClick={() => setCurrentCore(false)}
              onIconRightClick={() => setCurrentCore(true)}
              iconTooltipData={coreTooltip}
              maxNumber={null}
              leftToRight={true}
              buttonOnly={true}
            />

            <MechNumberIcon
              extraClass='overcharge'
              icon='heat'
              onIconClick={() => handleOverchargeClick(false)}
              onIconRightClick={() => handleOverchargeClick(true)}
              iconTooltipData={overchargeTooltip}
              maxNumber={null}
              currentNumber={overchargeDie}
              setCurrentNumber={() => {}}
              leftToRight={true}
              buttonOnly={true}
            />
          </div>
        </div>
      </div>

      <div className='agility-and-systems'>
        <div className='agility-container'>
          <MechSingleStat
            label="Evasion"
            extraClass='evasion'
            number={getMechEvasion(activeMech, activePilot, frameData)}
            leftToRight={false}
          />

          <MechSingleStat
            label="Move Speed"
            extraClass='speed condensed'
            number={getMechMoveSpeed(activeMech, activePilot, frameData)}
            leftToRight={false}
          />
        </div>

        <div className='systems-container'>
          <MechSingleStat
            label="E-Defense"
            extraClass='e-def'
            number={getMechEDef(activeMech, activePilot, frameData)}
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
          {getMechSaveTarget(activeMech, activePilot, frameData)}
        </div>
      </div>
    </div>
  );
}




export default MechState;
