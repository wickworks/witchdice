import React, { useState, useEffect } from 'react';
import ChooseHitMiss from './ChooseHitMiss.jsx';
import HitCheckbox from '../../../shared/HitCheckbox.jsx';
import AttackRollOutput from './AttackRollOutput/AttackRollOutput.jsx';
import DamageRollPool from './DamageRollPool.jsx';
import DamageSubtotal from './DamageSubtotal.jsx';
import BrToParagraphs from '../../../shared/BrToParagraphs.jsx';

import {
  summateAllDamageByType,
  getReliableDamage,
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
  isTechAttack,
  setAttackSummary,
}) => {
  const [isChoosingHitMiss, setIsChoosingHitMiss] = useState(true);
  const [isHit, setIsHit] = useState(false);

  const [invertCrit, setInvertCrit] = useState(false);
  const [isRerolled, setIsRerolled] = useState(false);
  const [manualRoll, setManualRoll] = useState(0);

  const finalResult = isRerolled ? attackData.toHitReroll.finalResult : attackData.toHit.finalResult
  const finalFinalResult = manualRoll > 0 ? manualRoll : finalResult
  var isCrit = isHit && finalFinalResult >= 20 && !isTechAttack;
  if (invertCrit) isCrit = !isCrit

  const isReliable = attackData.reliable && attackData.reliable.val > 0;
  const convertedBonusToBurn = damageModifiers.bonusToBurn && bonusDamageData.rolls.length > 0;
  var selfHeat = attackData.selfHeat;
  const consumedLock = attackData.consumedLock;

  // Flip MAXIMIZED to FALSE unless it was a nat 20.
  if (damageModifiers.maximized) {
    const rolledResult = isRerolled ? attackData.toHitReroll.baseRoll : attackData.toHit.baseRoll
    const finalRolledResult = manualRoll > 0 ? manualRoll : rolledResult
    damageModifiers = {...damageModifiers, maximized: (finalRolledResult === 20)}
  }

  // ==================================== EFFECTS ====================================
  function addTraitSummary(summary, onWhat, consumedLock) {
    bonusDamageData.traits.forEach(trait => {
      // onCrit, etc        either doesn't require a lock or we consumed one
      if (trait[onWhat] && (!trait.requiresLockon || consumedLock)) {
        summary.push(trait[onWhat])
      }
    });
  }

  var summary = [];
  if (consumedLock)                     summary.push('Consumed lock.')
  if (isFirstRoll) {
    if (attackData.onAttack)              summary.push(attackData.onAttack)
    addTraitSummary(summary, 'onAttack');
    if (selfHeat)                         summary.push(`Heat ${selfHeat} (Self).`)
  }
  if (isHit) {
    if (attackData.onHit)               summary.push(attackData.onHit)
    addTraitSummary(summary, 'onHit', consumedLock);

    if (isCrit) {
                                        summary.push('Critical hit.')
      if (attackData.onCrit)            summary.push(attackData.onCrit)
      addTraitSummary(summary, 'onCrit', consumedLock);
      if (damageModifiers.maximized)    summary.push('Natural 20. Maximum possible damage and bonus damage.')
    }
    if (damageModifiers.half)           summary.push('Half damage.')
    if (damageModifiers.double)         summary.push('Double damage (Exposed).')
    if (damageModifiers.average)        summary.push('Rolls averaged.')
    if (convertedBonusToBurn)           summary.push('Bonus damage converted to burn.')

    if (attackData.isArmorPiercing)     summary.push('Armor piercing.')
    if (attackData.knockback > 0)       summary.push(`Knockback ${attackData.knockback}.`)
    if (attackData.isOverkill) {
      const overkillCount = countOverkillTriggers(attackData.damage, bonusDamageData, isCrit, damageModifiers)
      if (overkillCount > 0)            summary.push(`Overkill x${overkillCount}.`)
      selfHeat += overkillCount;
    }

  } else {
    if (isReliable)                     summary.push('Reliable.')
    addTraitSummary(summary, 'onMiss', consumedLock);
  }
  if (isRerolled)                       summary.push('Rerolled.')
  if (manualRoll > 0)                   summary.push('Manual roll.')

  const totalsByType = summateAllDamageByType(
    attackData.damage,
    bonusDamageData,
    isCrit,
    halveBonusDamage,
    damageModifiers,
    isFirstRoll,
  )

  const reliableDamage = getReliableDamage(attackData, damageModifiers);

  // Apply if-you-hit-and-rolled-less reliable damage
  Object.keys(reliableDamage).forEach(type => {
    if (!(type in totalsByType) || totalsByType[type] < reliableDamage[type]) {
      totalsByType[type] = reliableDamage[type]
      summary.push('Reliable.')
    }
  });

  // separate normal bonus damage and sources that only apply to the first roll (aka NucCav)
  const [trimmedBonusDamageRolls, firstBonusDamageRolls] = pullOutFirstRollBonusDamage(bonusDamageData);

  const toHitData = isRerolled ? attackData.toHitReroll : attackData.toHit;

  // ====== ROLL SUMMARY PANEL ======
  const stringifiedDamageModifiers = JSON.stringify(damageModifiers)
  useEffect(() => {
    sendAttackToRollSummary(attackData);
  }, [isHit, invertCrit, isRerolled, manualRoll, summary.length, bonusDamageData.rolls.length, stringifiedDamageModifiers]);

  function sendAttackToRollSummary(newAttack) {
    let rollConditions = [];
    if (toHitData.accuracyBonus > 0) {
      rollConditions.push(`${toHitData.accuracyRolls.length} Accuracy`)
    } else if (toHitData.accuracyBonus < 0) {
      rollConditions.push(`${toHitData.accuracyRolls.length} Difficulty`)
    }

    let attackRollSummary = {
      name: rollConditions.join(' '),
      attack: finalFinalResult,
      applies: summary.join('<br>'),
    }

    if (isHit) {
      attackRollSummary = {...attackRollSummary, ...totalsByType}
    } else if (isReliable) {
      attackRollSummary = {...attackRollSummary, ...reliableDamage}
    }

    setAttackSummary(attackRollSummary)
  }

  const damageRollCount =
    attackData.damage.rolls.length +
    trimmedBonusDamageRolls.length +
    (isFirstRoll ? firstBonusDamageRolls.length : 0)

  return ( isChoosingHitMiss ?
    <ChooseHitMiss
      rollBonusLabel={isTechAttack ? 'Tech' : 'Grit'}
      attackData={attackData}
      isRerolled={isRerolled}
      setIsRerolled={setIsRerolled}
      setIsHit={setIsHit}
      setIsChoosingHitMiss={setIsChoosingHitMiss}
    />
  :
    <div className="WeaponAttack">
      <div className="damage-container">

        <HitCheckbox
          isHit={isHit}
          handleHitClick={() => setIsHit(!isHit)}
        />

        <AttackRollOutput
          toHitData={toHitData}
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
            { damageRollCount > 1 &&
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
            }

            { Object.keys(totalsByType).length > 0 && <DamageSubtotal totalsByType={totalsByType} /> }
          </>
        : isReliable ?
          <>
            <DamageSubtotal totalsByType={ {...reliableDamage} } />
          </>
        :
          <div className="miss-message">Missed.</div>
        }
      </div>

      <div className="effects-container">
        <BrToParagraphs stringWithBrs={summary.join('<br>')}/>
      </div>
    </div>
  )
}

export default WeaponAttack;
