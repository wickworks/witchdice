import React, { useState } from 'react';

import {
  findFrameData,
} from './lancerData.js';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMoveSpeed,
  getMechEvasion,
  getMechEDef,
  getMechSaveTarget,
  getMechMaxRepairCap,
} from './MechState/mechStateUtils.js';

import './FullRepairButton.scss';

const FullRepairButton = ({
  activeMech,
  activePilot,
  updateMechState
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [fullRepairComplete, setFullRepairComplete] = useState(false);

  function onFullRepair() {
    const frameData = findFrameData(activeMech.frame)

    updateMechState({
      // systemUses: ,
      // systemDestroyed: ,
      // weaponDestroyed: ,
      repairAllWeaponsAndSystems: true,
      conditions: [],
      custom_counters: [],
      counter_data: [],
      overshield: 0,
      current_hp: getMechMaxHP(activeMech, activePilot, frameData),
      current_heat: 0,
      burn: 0,
      current_overcharge: 0,
      current_core_energy: 1,
      current_repairs: getMechMaxRepairCap(activeMech, activePilot, frameData),
      current_structure: 4,
      current_stress: 4,
    })

    setIsConfirming(false)
    setFullRepairComplete(true)
  }

  return (
    <div className='FullRepairButton'>
      {isConfirming ?
        <button onClick={onFullRepair}>
          Confirm FULL REPAIR.
        </button>
      :
        <button className='initial-tab' onClick={() => setIsConfirming(true)}>
          Full Repair
        </button>
      }
    </div>
  );
}




export default FullRepairButton;
