import React, { useState } from 'react';
import HitCheckbox from '../shared/HitCheckbox.jsx';

import './WeaponAttack.scss';


function getSortedTotalPool(rollData, isCrit) {
  var totalPool = [...rollData.rollPool];
  if (isCrit) totalPool.push(...rollData.critPool);
  totalPool.sort((a, b) => { return a - b });

  return totalPool;
}

function getHighestRolls(sortedTotalPool, highestCount) {
  const highest = sortedTotalPool.slice(Math.max(sortedTotalPool.length - highestCount, 0));
  return highest;
}

function summateAllDamageByType(damageData, bonusDamageData, isCrit, halveBonusDamage) {
  var totalsByType = {};

  // BASE damage rolls
  damageData.rolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = totalsByType[rollData.type] || 0;
    totalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });

  // BONUS damage rolls
  var bonusTotalsByType = {}; // have to tally these separately so we can optionally halve just bonus damage
  bonusDamageData.rolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = bonusTotalsByType[rollData.type] || 0;
    bonusTotalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });

  // Bonus damage gets halved once it targets multiple characters
  if (halveBonusDamage) {
    Object.keys(bonusTotalsByType).forEach(type => bonusTotalsByType[type] = Math.ceil(bonusTotalsByType[type] * .5));
  }

  // Add the bonus damage totals to the base totals
  Object.keys(bonusTotalsByType).forEach(type => {
    const prevTypeTotal = totalsByType[type] || 0;
    totalsByType[type] = prevTypeTotal + bonusTotalsByType[type];
  });

  return totalsByType;
}

function countOverkillTriggers(damageData, bonusDamageData, isCrit) {
  var overkillCount = 0;

  [damageData, bonusDamageData].forEach(deedeeData => {
    deedeeData.rolls.forEach(rollData => {

      const totalPool = getSortedTotalPool(rollData, isCrit)

      if (totalPool.length > 1) { // Skip "+1" die rolls
        overkillCount += totalPool.reduce((a, v) => (v === 1 ? a + 1 : a), 0);
      }

    });
  });

  return overkillCount;
}


const WeaponAttack = ({
  attackData,
  bonusDamageData,
  halveBonusDamage,
}) => {
  const [isHit, setIsHit] = useState(true);
  const isCrit = isHit && attackData.toHit.finalResult >= 20;
  const isReliable = attackData.damage.reliable.val > 0
  const isOverkill = attackData.damage.isOverkill;

  console.log('activeBonusDamageData', bonusDamageData);

  var effectsList = [];
  if (isHit) {
    if (attackData.onHit)             effectsList.push(attackData.onHit)
    if (isCrit)                       effectsList.push('Critical hit')
    if (isCrit && attackData.onCrit)  effectsList.push(attackData.onCrit)

    if (isOverkill) {
      const overkillCount = countOverkillTriggers(attackData.damage, bonusDamageData, isCrit)
      if (overkillCount > 0) effectsList.push(`Heat ${overkillCount} (Self) — Overkill`)
    }

  } else {
    if (isReliable)                   effectsList.push('Reliable')
  }

  const totalsByType = summateAllDamageByType(attackData.damage, bonusDamageData, isCrit, halveBonusDamage)

  return (
    <div className="WeaponAttack">
      <div className="damage-container">

        <HitCheckbox
          isHit={isHit}
          handleHitClick={() => setIsHit(!isHit)}
        />

        { isCrit ?
          <div className='die-icon asset d20_frame'>
            <div className='asset necrotic' />
          </div>
        :
          <div className='die-icon asset d20' />
        }

        <div className='die-icon result-roll'>
          {attackData.toHit.finalResult}
        </div>

        { isHit ?
          <>
            <div className="damage-line">
              { attackData.damage.rolls.map((rollData, i) =>
                <DamageRollPool
                  rollData={rollData}
                  isCrit={isCrit}
                  key={i}
                />
              )}

              { bonusDamageData.rolls.map((rollData, i) =>
                <DamageRollPool
                  rollData={rollData}
                  isCrit={isCrit}
                  isBonusDamage={true}
                  halveBonusDamage={halveBonusDamage}
                  key={i}
                />
              )}
            </div>

            <div className="subtotal-container">
              { Object.keys(totalsByType).map((type, i) =>
                <div className='subtotal' key={type}>
                  <div className='amount'>{totalsByType[type]}</div>
                  <div className={`asset-lancer ${type.toLowerCase()}`} />
                </div>
              )}
            </div>
          </>
        : isReliable ?
          <>
            <div className="miss-line" />
            <div className="subtotal-container">
              <div className='subtotal'>
                <div className='amount'>{attackData.damage.reliable.val}</div>
                <div className={`asset-lancer ${attackData.damage.reliable.type.toLowerCase()}`} />
              </div>
            </div>
          </>
        :
          <div className="miss-line" />
        }
      </div>

      <div className="effects-container">
        { effectsList.map((effect, i) =>
          <div key={i}>
            {effect}
          </div>
        )}
      </div>
    </div>
  )
}

const DamageRollPool = ({
  rollData,
  isCrit,
  isBonusDamage = false,
  halveBonusDamage = false,
}) => {

  var totalPool = getSortedTotalPool(rollData, isCrit)
  var highest = getHighestRolls(totalPool, rollData.keep)

  // remove the highest rolls from the total pool; everything in there will be grey
  highest.forEach(highroll => totalPool.splice(totalPool.indexOf(highroll), 1))

  // Bonus damage gets halved once it targets multiple characters
  if (isBonusDamage && halveBonusDamage) {
    totalPool.forEach((roll, i) => totalPool[i] = (totalPool[i] * .5));
    highest.forEach((roll, i) => highest[i] = (highest[i] * .5));
  }

  const discardedString = totalPool.join(', ')
  const usedString = highest.join(', ')

  return (
    <div className={`damage-roll ${isBonusDamage ? 'bonus' : ''}`}>
      <span className={`asset-lancer ${rollData.type.toLowerCase()}`} />

      { discardedString &&
        <span className='amount discarded'>
          {`(${discardedString},`}
        </span>
      }

      { usedString &&
        <span className='amount used'>
          {usedString}
        </span>
      }

      { discardedString &&
        <span className='amount discarded'>{')'}</span>
      }

    </div>
  )
}


export default WeaponAttack;
