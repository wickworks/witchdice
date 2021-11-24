import React, { useState } from 'react';
import HitCheckbox from '../../shared/HitCheckbox.jsx';
import AttackRollOutput from './AttackRollOutput.jsx';
import DamageRollPool from './DamageRollPool.jsx';
import DamageSubtotal from './DamageSubtotal.jsx';

import {
  summateAllDamageByType,
  countOverkillTriggers,
  pullOutFirstRollBonusDamage,
} from './damageTotalUtils.js';

import './WeaponAttack.scss';


const WeaponAttack = ({
  attackData,
  bonusDamageData,
  halveBonusDamage,
  damageModifiers,
  isFirstRoll,
}) => {
  const [isHit, setIsHit] = useState(true);

  const [invertCrit, setInvertCrit] = useState(false);
  const [isRerolled, setIsRerolled] = useState(false);
  const [manualRoll, setManualRoll] = useState(0);

  const rollResult = isRerolled ? attackData.toHitReroll.finalResult : attackData.toHit.finalResult
  const finalFinalResult = manualRoll > 0 ? manualRoll : rollResult
  var isCrit = isHit && finalFinalResult >= 20;
  if (invertCrit) isCrit = !isCrit

  const isReliable = attackData.reliable.val > 0;

  // console.log('activeBonusDamageData', bonusDamageData);

  var effectsList = [];
  if (attackData.effect)              effectsList.push(attackData.effect)
  if (isHit) {
    if (attackData.onHit)             effectsList.push(attackData.onHit)
    if (isCrit)                       effectsList.push('Critical hit.')
    if (isCrit && attackData.onCrit)  effectsList.push(attackData.onCrit)
    if (attackData.knockback > 0)     effectsList.push(`Knockback ${attackData.knockback}.`)
    if (attackData.isOverkill) {
      const overkillCount = countOverkillTriggers(attackData.damage, bonusDamageData, isCrit, damageModifiers.average)
      if (overkillCount > 0) effectsList.push(`Heat ${overkillCount} (Self) — Overkill.`)
    }
  } else {
    if (isReliable)                   effectsList.push('Reliable.')
  }
  if (isRerolled)              effectsList.push('Rerolled.')


  const totalsByType = summateAllDamageByType(
    attackData.damage,
    bonusDamageData,
    isCrit,
    halveBonusDamage,
    damageModifiers,
    isFirstRoll,
  )

  // separate normal bonus damage and sources that only apply to the first roll (aka NucCav)
  const [trimmedBonusDamageRolls, firstBonusDamageRolls] = pullOutFirstRollBonusDamage(bonusDamageData);

  return (
    <div className="WeaponAttack">

      <div className="damage-container">

        <HitCheckbox
          isHit={isHit}
          handleHitClick={() => setIsHit(!isHit)}
        />

        <AttackRollOutput
          toHitData={isRerolled ? attackData.toHitReroll : attackData.toHit}
          manualRoll={manualRoll}
          setManualRoll={setManualRoll}
          isCrit={isCrit}
          invertCrit={invertCrit}
          setInvertCrit={setInvertCrit}
          isRerolled={isRerolled}
          setIsRerolled={setIsRerolled}
        />

        { isHit ?
          <>
            <div className="damage-line">
              { attackData.damage.rolls.map((rollData, i) =>
                <DamageRollPool
                  rollData={rollData}
                  isCrit={isCrit}
                  damageModifiers={damageModifiers}
                  key={i}
                />
              )}

              { trimmedBonusDamageRolls.map((rollData, i) =>
                <DamageRollPool
                  rollData={rollData}
                  isCrit={isCrit}
                  isBonusDamage={true}
                  halveBonusDamage={halveBonusDamage}
                  damageModifiers={damageModifiers}
                  key={i}
                />
              )}

              { isFirstRoll && firstBonusDamageRolls.map((rollData, i) =>
                <DamageRollPool
                  rollData={rollData}
                  isCrit={isCrit}
                  isBonusDamage={true}
                  halveBonusDamage={false}
                  damageModifiers={damageModifiers}
                  key={i}
                />
              )}
            </div>

            <DamageSubtotal totalsByType={totalsByType} />
          </>
        : isReliable ?
          <>
            <div className="miss-line" />

            <DamageSubtotal totalsByType={ {[attackData.reliable.type]: attackData.reliable.val} } />
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


export default WeaponAttack;
