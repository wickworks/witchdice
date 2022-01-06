import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponRollerSetup from './WeaponRollerSetup.jsx';
import './TechRoller.scss';
import './WeaponRoller.scss';

import {
  createNewTechAttack,
} from './weaponRollerUtils.js';

const TechRoller = ({
  invadeData,
  techAttackBonus,
  sensorRange,
  setRollSummaryData,
  onClear,
}) => {

  const [techAttackRoll, setTechAttackRoll] = useState(null);
  const [bonusDamageData, setBonusDamageData] = useState(null);

  const [isSettingUpAttack, setIsSettingUpAttack] = useState(true);

  const createNewAttackRoll = () => {

    const accuracyMod = 0;
    const newAttack = createNewTechAttack(invadeData, techAttackBonus, accuracyMod)

    var bonusDamage = {};
    bonusDamage.rolls = []
    // bonusDamage.rolls = rollBonusDamage(
    //   [...availableBonusSources, GENERIC_BONUS_SOURCE],
    //   defaultWeaponDamageType(currentWeaponProfile),
    //   newAttack.isOverkill
    // );
    bonusDamage.traits = [] // getBonusTraits(availableBonusSources)

    setBonusDamageData(bonusDamage);
    setTechAttackRoll(newAttack)
    setIsSettingUpAttack(false);

  }

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    clearAttacks()
    // clearActiveBonusSources()
  }, [JSON.stringify(invadeData)]);


  const clearAttacks = () => {
    // setAllAttackSummaries([]);
    setIsSettingUpAttack(true);
    setTechAttackRoll(null);
    setBonusDamageData(null);
    onClear();
  }

  // ====== ROLL SUMMARY PANEL ======
  const setRollSummaryDataWithTechName = (invadeSummaryData) => {
    setRollSummaryData({
      conditions: [invadeData.name],
      rolls: [invadeSummaryData],
      skipTotal: true,
    })
  }

  return (
    <div className='TechRoller WeaponRoller'>
      <h3 className='name'>{invadeData.name}</h3>

      <div className="top-bar">
        <div className='effect-row base-tech-stats'>
          <div>Tech Attack: {techAttackBonus >= 0 ? '+' : ''}{techAttackBonus}</div>
          <div>Sensor range: {sensorRange}</div>
        </div>

        <div className='effect-row'>
          {invadeData.detail}
        </div>
      </div>

      <div className="attacks-bar">
        { techAttackRoll &&
          <WeaponAttack
            attackData={techAttackRoll}
            bonusDamageData={bonusDamageData}
            halveBonusDamage={false}
            damageModifiers={[]}
            manualBaseDamage={0}
            isFirstRoll={true}
            isTechAttack={true}
            setAttackSummary={setRollSummaryDataWithTechName}
          />
        }

        { isSettingUpAttack &&
          <WeaponRollerSetup
            invadeData={invadeData}
            rollBonus={techAttackBonus}
            rollBonusLabel='Tech'
            createNewAttackRoll={createNewAttackRoll}
          />
        }
      </div>


      <div className='status-bar'>

        { !isSettingUpAttack &&
          <div className='action-buttons-container'>
            <button className='clear-attacks' onClick={clearAttacks} >
              <div className='asset x' />
              Clear
            </button>
          </div>
        }
      </div>
    </div>
  )
}


export default TechRoller;
