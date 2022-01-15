import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponRollerSetup from './WeaponRollerSetup.jsx';
import BrToParagraphs from '../../shared/BrToParagraphs.jsx';
import './TechRoller.scss';
import './WeaponRoller.scss';

import {
  createNewTechAttack,
} from './weaponRollerUtils.js';

const TechRoller = ({
  activeMech,
  activePilot,

  invadeData,
  techAttackBonus,
  sensorRange,

  setRollSummaryData,
  onClear,
}) => {
  const [techAttackRoll, setTechAttackRoll] = useState(null);
  const [bonusDamageData, setBonusDamageData] = useState(null);
  const [isSettingUpAttack, setIsSettingUpAttack] = useState(true);

  const isInvade = invadeData.activation === 'Invade'

  const createNewAttackRoll = () => {

    const accuracyMod = 0;
    const newAttack = createNewTechAttack(invadeData, techAttackBonus, accuracyMod, isInvade)

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
  const stringifiedInvadeData = JSON.stringify(invadeData)

  const clearAttacks = () => {
    // setAllAttackSummaries([]);
    setIsSettingUpAttack(true);
    setTechAttackRoll(null);
    setBonusDamageData(null);
    onClear();
  }

  useEffect(() => {
    clearAttacks()
    // clearActiveBonusSources()
  }, [stringifiedInvadeData]);


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
          <div className='tech-stat'>
            <div className='bracket'>[</div>
            <div className='label'>Tech Attack</div>
            <div className='value'>{techAttackBonus >= 0 ? '+' : ''}{techAttackBonus}</div>
            <div className='bracket'>]</div>
          </div>
          <div className='tech-stat'>
            <div className='bracket'>[</div>
            <div className='label'>Sensor range</div>
            <div className='value'>{sensorRange}</div>
            <div className='bracket'>]</div>
          </div>
          <div className="tags">
            <span className='size'>{invadeData.activation}</span>
          </div>
        </div>

        <div className='effect-row'>
          <BrToParagraphs stringWithBrs={invadeData.detail}/>
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
            activeMech={activeMech}
            activePilot={activePilot}
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
