import React, { useState } from 'react';
import HitCheckbox from '../../shared/HitCheckbox.jsx';
import AttackRollOutput from './AttackRollOutput.jsx';
import DamageRollPool from './DamageRollPool.jsx';
import DamageSubtotal from './DamageSubtotal.jsx';

import {
  summateAllDamageByType,
  countOverkillTriggers,
} from './damageUtils.js';

import './WeaponAttack.scss';


const WeaponAttack = ({
  attackData,
  bonusDamageData,
  halveBonusDamage,
}) => {
  const [isHit, setIsHit] = useState(true);
  const [isCritForced, setIsCritForced] = useState(true);
  const isCrit = isHit && attackData.toHit.finalResult >= 20;
  const isReliable = attackData.reliable.val > 0;

  // console.log('activeBonusDamageData', bonusDamageData);

  var effectsList = [];
  if (attackData.effect)              effectsList.push(attackData.effect)

  if (isHit) {
    if (attackData.onHit)             effectsList.push(attackData.onHit)
    if (isCrit)                       effectsList.push('Critical hit')
    if (isCrit && attackData.onCrit)  effectsList.push(attackData.onCrit)

    if (attackData.knockback > 0)     effectsList.push(`Knockback ${attackData.knockback}`)

    if (attackData.isOverkill) {
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

        <AttackRollOutput
          isCrit={isCrit}
          finalResult={attackData.toHit.finalResult}
        />

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
