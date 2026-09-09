import React from 'react';
import MechCentralDiamond from './MechCentralDiamond';
import MechNumberLabel from './MechNumberLabel';
import MechNumberBarUntyped from './MechNumberBar';
import MechNumberIconUntyped from './MechNumberIcon';
import MechSingleStat from './MechSingleStat';
import AbilityRollButton from './AbilityRollButton';

const MechNumberBar: any = MechNumberBarUntyped;
const MechNumberIcon: any = MechNumberIconUntyped;

import { capitalize } from '../../../utils';
import { blankDice } from '../../shared/DiceBag/DiceBagData';
import {
  OVERCHARGE_SEQUENCE,
  processDiceString,
} from '../lancerData';

import type { RobotState, RobotStats, RobotInfo, UpdateMechState } from '../types';

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
  setDistantDicebagData,
  setRollSummaryData,
}: {
  robotState: RobotState,
  robotStats: RobotStats,
  robotInfo: RobotInfo,
  updateMechState: UpdateMechState,
  setDistantDicebagData: (data: any) => void,
  setRollSummaryData: (data: any) => void,
}) => {
  const currentOvershield = parseInt(String(robotState.overshield));
  const setCurrentOvershield = (overshield: number) => updateMechState({overshield: overshield})

  const currentHP = parseInt(String(robotState.hp));
  const setCurrentHP = (current_hp: number) => updateMechState({current_hp: current_hp})

  const currentHeat = parseInt(String(robotState.heat));
  const setCurrentHeat = (current_heat: number) => updateMechState({current_heat: current_heat})

  const currentBurn = parseInt(String(robotState.burn));
  const setCurrentBurn = (burn: number) => updateMechState({burn: burn})

  const currentOverchargeIndex = robotState.overcharge;

  const currentCore = !!robotState.coreEnergy;
  const setCurrentCore = (hasCoreEnergy: boolean) => updateMechState({current_core_energy: hasCoreEnergy ? 1 : 0})

  const currentRepairs = robotState.repairs;
  const setCurrentRepairs = (current_repairs: number) => updateMechState({current_repairs: current_repairs})

  const currentStructure = robotState.structure;
  const setCurrentStructure = (current_structure: number) => updateMechState({current_structure: current_structure})

  const currentStress = robotState.stress;
  const setCurrentStress = (current_stress: number) => updateMechState({current_stress: current_stress})


  const overshieldPlusHP = currentHP + currentOvershield
  const overshieldPlusMaxHP = robotStats.maxHP + currentOvershield

  const overchargeDie = OVERCHARGE_SEQUENCE[currentOverchargeIndex]

  const isInDangerZone = currentHeat >= Math.ceil(robotStats.maxHeat * .5)

  const handleHPBarClick = (newValue: number) => {
    var change = parseInt(String(newValue)) - overshieldPlusHP
    changeHealth(change)
  }

  function changeHealth(change: number) {
    const overshield = currentOvershield
    const hp = currentHP
    var newHP = hp;
    var newOvershield = overshield;

    if (change <= 0) {
      if (Math.abs(change) <= overshield) {
        newOvershield =overshield + change

      } else {
        change += overshield
        newOvershield = 0
        newHP = hp + change
      }
    } else if (change > 0) {
      newHP = hp + change
    }

    newHP = Math.min(Math.max(newHP, 0), robotStats.maxHP)
    updateMechState({overshield: newOvershield, current_hp: newHP})
  }

  const handleOvershieldIconClick = (rightClick: boolean) => {
    var newShield = currentOvershield
    if (rightClick) { newShield -= 1 } else { newShield += 1 }
    newShield = Math.min(Math.max(newShield, 0), MAX_OVERSHIELD)
    setCurrentOvershield(newShield)
  }

  const handleBurnIconClick = (rightClick: boolean) => {
    var newBurn = currentBurn
    if (rightClick) { newBurn -= 1 } else { newBurn += 1 }
    newBurn = Math.min(Math.max(newBurn, 0), MAX_BURN)
    setCurrentBurn(newBurn)
  }

  const getOverchargeResultMessage = (result: number) => {
    let finalHeat = (currentHeat + result)
    let stressCount = 0
    while ((finalHeat > robotStats.maxHeat) && (stressCount < 4)) {
      finalHeat -= robotStats.maxHeat;
      stressCount += 1
    }
    let message = `Take ${result} heat; you have <b>${finalHeat}</b> heat total.`
    if (stressCount > 0) message += `<br>Take <b>${stressCount}</b> Stress damage.`
    return message
  }

  const handleOverchargeClick = (rightClick: boolean) => {
    var direction = rightClick ? -1 : 1
    var newIndex = Math.max(Math.min(currentOverchargeIndex + direction, OVERCHARGE_SEQUENCE.length-1), 0);

    var mechStatUpdate: Record<string, any> = {current_overcharge: newIndex}

    if (direction > 0) {
      const currentOvercharge = OVERCHARGE_SEQUENCE[currentOverchargeIndex]

      if (currentOverchargeIndex == 0) {
        setRollSummaryData({
      		type: 'text',
      		title: [robotInfo.frameSourceText, capitalize(robotInfo.frameName)].join(', '),
      		message: getOverchargeResultMessage(1)
      	})
        mechStatUpdate.current_heat = (currentHeat+1)

      } else if (currentOverchargeIndex > 0) {
        const overchargeDice = processDiceString(currentOvercharge)
        let diceData: Record<string, number> = {...blankDice}

        if (overchargeDice.dietype in diceData) {
          diceData[overchargeDice.dietype] = overchargeDice.count
        } else {
          delete diceData['x']
          diceData['x3'] = overchargeDice.count
        }
        diceData['plus'] = overchargeDice.bonus

        setDistantDicebagData({
          diceData: diceData,
          summaryMode: 'total',
          annotation: 'OVERCHARGE',
          postRollMessage: getOverchargeResultMessage,
        });
      }
    }

    updateMechState( mechStatUpdate );
  }

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
        hasIntactCustomPaintJob={robotState.hasIntactCustomPaintJob}

        currentRepairs={currentRepairs}
        setCurrentRepairs={setCurrentRepairs}

        setDistantDicebagData={setDistantDicebagData}
      />


      <div className='hp-label'>
        <MechNumberLabel
          label="HP"
          maxNumber={robotStats.maxHP}
          currentNumber={currentHP}
          setCurrentNumber={setCurrentHP}
          leftToRight={false}
        />
      </div>

      <div className='hull-container'>
        <MechNumberBar
          maxNumber={overshieldPlusMaxHP}
          currentNumber={overshieldPlusHP}
          setCurrentNumber={handleHPBarClick}
          overshield={currentOvershield}
          armor={robotStats.armor}
          burn={currentBurn}
          leftToRight={false}
        />

        <div className='overshield-and-burn'>
          <MechNumberIcon
            extraClass={`overshield ${currentOvershield > 0 ? 'active' : ''}`}
            icon={'overshield-outline'}
            onIconClick={() => handleOvershieldIconClick(false)}
            onIconRightClick={() => handleOvershieldIconClick(true)}
            iconTooltipData={overshieldTooltip}
            maxNumber={MAX_OVERSHIELD}
            currentNumber={currentOvershield}
            setCurrentNumber={setCurrentOvershield}
            leftToRight={false}
          />

          {robotStats.maxHP > 1 && <MechNumberIcon
            extraClass={`burning ${currentBurn > 0 ? 'active' : ''}`}
            icon='burn'
            onIconClick={() => handleBurnIconClick(false)}
            onIconRightClick={() => handleBurnIconClick(true)}
            iconTooltipData={burnTooltip}
            maxNumber={MAX_BURN}
            currentNumber={currentBurn}
            setCurrentNumber={setCurrentBurn}
            leftToRight={false}
          />}
        </div>
      </div>

      <AbilityRollButton
        label='HULL'
        extraClass='hull'
        flatBonus={robotStats.hull}
        accuracy={robotStats.hullAccuracy}
        setDistantDicebagData={setDistantDicebagData}
      />

      <AbilityRollButton
        label='ENGI'
        extraClass='engineering'
        flatBonus={robotStats.engineering}
        accuracy={robotStats.engineeringAccuracy}
        setDistantDicebagData={setDistantDicebagData}
      />

      <AbilityRollButton
        label='AGI'
        extraClass='agility'
        flatBonus={robotStats.agility}
        accuracy={robotStats.agilityAccuracy}
        setDistantDicebagData={setDistantDicebagData}
      />

      <AbilityRollButton
        label='SYS'
        extraClass='systems'
        flatBonus={robotStats.systems}
        accuracy={robotStats.systemsAccuracy}
        setDistantDicebagData={setDistantDicebagData}
      />

      { robotStats.maxHeat > 0 &&
        <>
          <div className={`heat-label ${isInDangerZone ? 'danger-zone' : ''}`}>
            <MechNumberLabel
              label="Heat"
              maxNumber={robotStats.maxHeat}
              currentNumber={currentHeat}
              setCurrentNumber={setCurrentHeat}
              leftToRight={true}
            />
          </div>

          <div className='engineering-container'>
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
                  showResetButton={!currentCore}
                />
              }

              {overchargeDie &&
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
                  showResetButton={overchargeDie !== OVERCHARGE_SEQUENCE[0]}
                />
              }
            </div>
          </div>

          { isInDangerZone &&
            <div className='danger-zone-container'>
              <span className='words'>!</span>
              <span className='decor'>!</span>
              <span className='words'>Danger Zone</span>
              <span className='decor'>!</span>
              <span className='words'>!</span>
            </div>
          }

        </>
      }

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
