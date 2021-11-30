import React, { useState, useEffect } from 'react';
import ChooseHitMiss from './ChooseHitMiss.jsx';
import HitCheckbox from '../../../shared/HitCheckbox.jsx';
import AttackRollOutput from './AttackRollOutput.jsx';
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
  setAttackSummary,
}) => {
  const [isChoosingHitMiss, setIsChoosingHitMiss] = useState(true);
  const [isHit, setIsHit] = useState(false);

  const [invertCrit, setInvertCrit] = useState(false);
  const [isRerolled, setIsRerolled] = useState(false);
  const [manualRoll, setManualRoll] = useState(0);

  const rollResult = isRerolled ? attackData.toHitReroll.finalResult : attackData.toHit.finalResult
  const finalFinalResult = manualRoll > 0 ? manualRoll : rollResult
  var isCrit = isHit && finalFinalResult >= 20;
  if (invertCrit) isCrit = !isCrit

  const isReliable = attackData.reliable.val > 0;
  const convertedBonusToBurn = damageModifiers.bonusToBurn && bonusDamageData.rolls.length > 0;
  var selfHeat = attackData.selfHeat;

  // console.log('activeBonusDamageData', bonusDamageData);

  // ==================================== EFFECTS ====================================
  const traits = bonusDamageData.traits

  var effectsList = [];
  traits.forEach(trait => {
    if (trait.onAttack)               effectsList.push(trait.onAttack)
  });
  if (isHit) {
    if (attackData.onHit)             effectsList.push(attackData.onHit)
    traits.forEach(trait => {
      if (trait.onHit)                effectsList.push(trait.onHit)
    });

    if (isCrit) {
                                      effectsList.push('Critical hit.')
      if (attackData.onCrit)          effectsList.push(attackData.onCrit)
      traits.forEach(trait => {
        if (trait.onCrit)             effectsList.push(trait.onCrit)
      });
    }
    if (damageModifiers.half)         effectsList.push('Half damage.')
    if (damageModifiers.double)       effectsList.push('Double damage (Exposed).')
    if (damageModifiers.average)      effectsList.push('Rolls averaged.')
    if (convertedBonusToBurn)         effectsList.push('Bonus damage converted to burn.')

    if (attackData.isArmorPiercing)   effectsList.push('Armor piercing.')
    if (attackData.knockback > 0)     effectsList.push(`Knockback ${attackData.knockback}.`)
    if (attackData.isOverkill) {
      const overkillCount = countOverkillTriggers(attackData.damage, bonusDamageData, isCrit, damageModifiers.average)
      if (overkillCount > 0)          effectsList.push(`Overkill x${overkillCount}.`)
      selfHeat += overkillCount;
    }

  } else {
    if (isReliable)                   effectsList.push('Reliable.')
    traits.forEach(trait => {
      if (trait.onMiss)               effectsList.push(trait.onMiss)
    });
  }
  if (selfHeat)       effectsList.push(`Heat ${selfHeat} (Self).`)
  if (isRerolled)     effectsList.push('Rerolled.')
  if (manualRoll > 0) effectsList.push('Manual roll.')

  const totalsByType = summateAllDamageByType(
    attackData.damage,
    bonusDamageData,
    isCrit,
    halveBonusDamage,
    damageModifiers,
    isFirstRoll,
  )

  const reliableDamage = getReliableDamage(attackData, damageModifiers);

  // separate normal bonus damage and sources that only apply to the first roll (aka NucCav)
  const [trimmedBonusDamageRolls, firstBonusDamageRolls] = pullOutFirstRollBonusDamage(bonusDamageData);

  const toHitData = isRerolled ? attackData.toHitReroll : attackData.toHit;

  // ====== ROLL SUMMARY PANEL ======

  useEffect(() => {
    sendAttackToRollSummary(attackData);
  }, [isHit, invertCrit, isRerolled, manualRoll, bonusDamageData.rolls.length, JSON.stringify(damageModifiers)]);

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
      applies: effectsList.join('<br>'),
    }

    if (isHit) {
      attackRollSummary = {...attackRollSummary, ...totalsByType}
    } else if (isReliable) {
      attackRollSummary = {...attackRollSummary, ...reliableDamage}
    }

    setAttackSummary(attackRollSummary)
  }

  return ( isChoosingHitMiss ?
    <ChooseHitMiss
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
            <DamageSubtotal totalsByType={ {...reliableDamage} } />
          </>
        :
          <div className="miss-message">Missed.</div>
        }
      </div>

      <div className="effects-container">
        <BrToParagraphs stringWithBrs={effectsList.join('<br>')}/>
      </div>
    </div>
  )
}


export default WeaponAttack;
