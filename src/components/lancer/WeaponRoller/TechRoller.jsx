import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponRollerSetup from './WeaponRollerSetup.jsx';
import BonusDamageBar from './BonusDamageBar.jsx';
import RechargeBar from '../MechSheet/RechargeBar.jsx'
import BrToParagraphs from '../../shared/BrToParagraphs.jsx';
import { deepCopy } from '../../../utils.js';

import './TechRoller.scss';
import './WeaponRoller.scss';

import {
  rollBonusDamage,
  getActiveBonusDamageData,
  createNewTechAttack,
  setAccuracyMod,
} from './weaponRollerUtils.js';

const TechRoller = ({
  invadeData,
  techAttackBonus,
  sensorRange,

  availableBonusSources,
  accuracyAndDamageSourceInputs,

  setRechargedForSystem,

  setRollSummaryData,
  onClear,
}) => {
  const [techAttackRoll, setTechAttackRoll] = useState(null);
  const [isSettingUpAttack, setIsSettingUpAttack] = useState(true);

  const [bonusDamageData, setBonusDamageData] = useState(null);
  const [activeBonusSources, setActiveBonusSources] = useState([]);

  const isInvade = invadeData.activation === 'Invade'

  const createNewAttackRoll = (flatBonus, accuracyMod, consumedLock) => {

    const newAttack = createNewTechAttack(invadeData, flatBonus, accuracyMod, consumedLock, isInvade)

    var bonusDamage = {};
    bonusDamage.rolls = []

    // do we need to roll bonus damage?
    if (bonusDamageData === null) {
      bonusDamage.rolls = rollBonusDamage(availableBonusSources, 'Heat', false)
      bonusDamage.traits = availableBonusSources.filter(source => source.trait).map(source => source.trait)
      setBonusDamageData(bonusDamage);
    }

    setTechAttackRoll(newAttack)
    setIsSettingUpAttack(false);

  }

  const changeAccuracyMod = (change) => {
    let newAttackData = deepCopy(techAttackRoll)
    setAccuracyMod(newAttackData.toHit, newAttackData.toHit.accuracyMod + change)
    setAccuracyMod(newAttackData.toHitReroll, newAttackData.toHitReroll.accuracyMod + change)

    setTechAttackRoll(newAttackData)
  }

  // Add or remove the name of a bonus damage to the active list
  const toggleBonusDamage = (sourceID) => {
    let newBonusDamages = [...activeBonusSources];
    const bonusIndex = newBonusDamages.indexOf(sourceID);
    if (bonusIndex >= 0) {
      newBonusDamages.splice(bonusIndex, 1) // REMOVE source
    } else {
      newBonusDamages.push(sourceID);          // ADD source
    }
    setActiveBonusSources(newBonusDamages);
  }

  // the actual data for all the currently active bonus damages
  var activeBonusDamageData = getActiveBonusDamageData(bonusDamageData, activeBonusSources, 0,0,false);

  // ====== Many NPC weapons have an inherent attack bonus instead of using their Systems score ======
  const finalAttackBonus = invadeData.attack_bonus ? invadeData.attack_bonus : techAttackBonus

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

  // console.log('TECH availableBonusSources',availableBonusSources);
  // console.log('TECH activeBonusDamageData',activeBonusDamageData);

  return (
    <div className='TechRoller WeaponRoller'>
      <h3 className='name'>{invadeData.name}</h3>

      <div className="top-bar">
        <div className='effect-row base-tech-stats'>
          <div className='tech-stat'>
            <div className='bracket'>[</div>
            <div className='label'>Tech Attack</div>
            <div className='value'>{finalAttackBonus >= 0 ? '+' : ''}{finalAttackBonus}</div>
            <div className='bracket'>]</div>
          </div>
          <div className='tech-stat'>
            <div className='bracket'>[</div>
            <div className='label'>Sensor range</div>
            <div className='value'>{sensorRange}</div>
            <div className='bracket'>]</div>
          </div>
          {isInvade &&
            <div className="tech-stat">
              <div className='bracket'>[</div>
              <div className='value'>2</div>
              <div className='asset heat' />
              <div className='bracket'>]</div>
            </div>
          }
          <div className="tags">
            <span className='size'>{invadeData.activation}</span>
          </div>
        </div>

        <div className='effect-row'>
          <BrToParagraphs stringWithBrs={invadeData.detail}/>
        </div>

        { invadeData.recharge &&
          <RechargeBar
            recharge={invadeData.recharge}
            setRecharged={(charged) => setRechargedForSystem(charged, invadeData.systemIndex)}
          />
        }

        {availableBonusSources.length > 0 &&
          <BonusDamageBar
            availableBonusSources={availableBonusSources}
            activeBonusSources={activeBonusSources}
            toggleBonusDamage={toggleBonusDamage}
          />
        }
      </div>

      <div className="attacks-bar">
        { techAttackRoll &&
          <WeaponAttack
            attackData={techAttackRoll}
            changeAccuracyMod={changeAccuracyMod}
            bonusDamageData={activeBonusDamageData}
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
            rollBonus={finalAttackBonus}
            rollBonusLabel='Tech'
            createNewAttackRoll={createNewAttackRoll}
            accuracySourceInputs={accuracyAndDamageSourceInputs}
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
