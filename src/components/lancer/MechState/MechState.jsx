import React from 'react';
import MechCentralDiamond from './MechCentralDiamond.jsx';
import MechNumberLabel from './MechNumberLabel.jsx';
import MechNumberBar from './MechNumberBar.jsx';
import MechNumberIcon from './MechNumberIcon.jsx';
import MechSingleStat from './MechSingleStat.jsx';

import {
  OVERCHARGE_SEQUENCE,
} from '../lancerData.js';


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
  robotState,
  robotStats,
  robotInfo,

  updateMechState,
}) => {
  const currentOvershield = robotState.overshield;
  const setCurrentOvershield = (overshield) => updateMechState({overshield: overshield})

  const currentHP = robotState.hp;
  const setCurrentHP = (current_hp) => updateMechState({current_hp: current_hp})

  const currentHeat = robotState.heat;
  const setCurrentHeat = (current_heat) => updateMechState({current_heat: current_heat})

  const currentBurn = robotState.burn;
  const setCurrentBurn = (burn) => updateMechState({burn: burn})

  const currentOverchargeIndex = robotState.overcharge;
  const setCurrentOverchargeIndex = (current_overcharge) => updateMechState({current_overcharge: current_overcharge})

  const currentCore = !!robotState.coreEnergy;
  const setCurrentCore = (hasCoreEnergy) => updateMechState({current_core_energy: hasCoreEnergy ? 1 : 0})

  const currentRepairs = robotState.repairs;
  const setCurrentRepairs = (current_repairs) => updateMechState({current_repairs: current_repairs})

  const currentStructure = robotState.structure;
  const setCurrentStructure = (current_structure) => updateMechState({current_structure: current_structure})

  const currentStress = robotState.stress;
  const setCurrentStress = (current_stress) => updateMechState({current_stress: current_stress})


  const overshieldPlusHP = parseInt(currentHP) + parseInt(currentOvershield)
  const overshieldPlusMaxHP = robotStats.maxHP + parseInt(currentOvershield)

  const overchargeDie = OVERCHARGE_SEQUENCE[currentOverchargeIndex]

  const isInDangerZone = parseInt(currentHeat) >= Math.ceil(robotStats.maxHeat * .5)

  const handleHPBarClick = (newValue) => {
    var change = parseInt(newValue) - overshieldPlusHP
    changeHealth(change)
  }

  function changeHealth(change) {
    const overshield = parseInt(currentOvershield)
    const hp = parseInt(currentHP)
    var newHP = hp;
    var newOvershield = overshield;

    // DAMAGE
    if (change <= 0) {
      // overshield takes all of it
      if (Math.abs(change) <= overshield) {
        newOvershield =overshield + change

      // overshield takes some, rest goes to HP
      } else {
        change += overshield
        newOvershield = 0
        newHP = hp + change
      }
    // HEALING
    } else if (change > 0) {
      newHP = hp + change
    }

    newHP = Math.min(Math.max(newHP, 0), robotStats.maxHP)
    updateMechState({overshield: newOvershield, current_hp: newHP})
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

  // player mechs default to frame images, npcs have blank image
  const defaultPortrait = robotInfo.frameID.startsWith('mf_') ? robotInfo.frameID : 'mf_standard_pattern_i_everest'

  return (
    <div className='MechState asset butterfly-watermark'>

      <MechCentralDiamond
        maxRepairCap={robotStats.maxRepairCap}
        mechPortraitCloud={robotInfo.cloud_portrait}
        mechPortraitDefault={defaultPortrait}
        mechSize={robotStats.size}

        maxStress={robotStats.maxStress}
        currentStress={currentStress}
        setCurrentStress={setCurrentStress}

        maxStructure={robotStats.maxStructure}
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
              maxNumber={robotStats.maxHP}
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
            armor={robotStats.armor}
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

            {robotStats.maxHP > 1 && <MechNumberIcon
              extraClass={`burning ${parseInt(currentBurn) > 0 ? 'active' : ''}`}
              icon='burn'
              onIconClick={() => handleBurnIconClick(false)}
              onIconRightClick={() => handleBurnIconClick(true)}
              iconTooltipData={burnTooltip}
              maxNumber={MAX_BURN}
              currentNumber={parseInt(currentBurn)}
              setCurrentNumber={setCurrentBurn}
              leftToRight={false}
            />}
          </div>
        </div>

        <div className='engineering-container'>
          { robotStats.maxHeat > 0 && <>

            <div className={`heat-label ${isInDangerZone ? 'danger-zone' : ''}`}>
              <MechNumberLabel
                label="Heat"
                maxNumber={robotStats.maxHeat}
                currentNumber={currentHeat}
                setCurrentNumber={setCurrentHeat}
                leftToRight={true}
              />

              <div className='danger-zone-container'>
                { isInDangerZone &&
                  <>
                    <span className='decor'>!</span>
                    <span className='words'>Danger<br/>Zone</span>
                    <span className='decor'>!</span>
                  </>
                }
              </div>
            </div>

            <MechNumberBar
              maxNumber={robotStats.maxHeat}
              currentNumber={currentHeat}
              setCurrentNumber={setCurrentHeat}
              leftToRight={true}
            />

            <div className='overcharge-and-core'>
              {robotState.coreEnergy >= 0 &&
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
              }

              {overchargeDie >= 0 &&
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
              }
            </div>
          </>}
        </div>
      </div>

      <div className='agility-and-systems'>
        <div className='agility-container'>
          <MechSingleStat
            label="Evasion"
            extraClass='evasion'
            number={robotStats.evasion}
            leftToRight={false}
          />

          <MechSingleStat
            label="Move Speed"
            extraClass='speed condensed'
            number={robotStats.moveSpeed}
            leftToRight={false}
          />
        </div>

        <div className='systems-container'>
          <MechSingleStat
            label="E-Defense"
            extraClass='e-def'
            number={robotStats.eDef}
            leftToRight={true}
          />

          <MechSingleStat
            label="Sensor Range"
            extraClass='sensors condensed'
            number={robotStats.sensorRange}
            leftToRight={true}
          />
        </div>
      </div>

      <div className='save-target'>
        <div className='label'>
          Save Target
        </div>

        <div className='number'>
          {robotStats.saveTarget}
        </div>
      </div>
    </div>
  );
}




export default MechState;
