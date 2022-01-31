import React, { useState, useEffect } from 'react';
import BigRollButton from '../shared/BigRollButton.jsx';
import Roll from './Roll.jsx';
import { deepCopy } from '../../utils.js';
import { abilityTypes, allDamageTypes, anyDamageSourceContains } from './data.js';
import './Roller.scss';



const Roller = ({
  rollData,
  rollFunctions,
  attackSourceData,
  handleNewRoll,
  handleClear,
  characterName,
  setRollSummaryData
}) => {

  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [evasion, setEvasion] = useState(false);
  const [toHitAC, setToHitAC] = useState(10); // only used for massive attacks

  // outcomes of calculateDamage
  const [damageTotal, setDamageTotal] = useState(false);
  const [damageBreakdown, setDamageBreakdown] = useState(false);

  // when the roll data changes, figure out what's a hit & send up the summary
  useEffect(() => {
    // only calculate damge if we changed what hit
    if (!autoCalculateHits()) calculateDamage()
  }, [rollData, advantage, disadvantage, evasion, toHitAC]);

  // figure out what whether to show evasion checkbox & to hit AC or not
  let showEvasionOption = false;
  let showToHitAC = false;
  attackSourceData.forEach((attackSource) => {
    if (attackSource.type === 'save' && attackSource.savingThrowType === 0 && attackSource.dieCount > 0) {
      showEvasionOption = true;
    }
    if (attackSource.dieCount >= 10) showToHitAC = true
  });

  // figure out what's a hit -- automatically make crits and fumbles go appropriately & handle large-attack to-hit-acs.
  function autoCalculateHits() {
    let newRollData = deepCopy(rollData);// so we can update the whole thing in one go
    let madeChange = false;

    for (let rollID = 0; rollID < newRollData.length; rollID++) {
      const roll = newRollData[rollID];
      const attackSource = attackSourceData[roll.attackID];

      // only attacks/abilities can crit
      if (attackSource.type === 'attack' || attackSource.type === 'ability') {
        const critFumble = getCritOrFumble(roll)

        // all critical hits are hits
        if (critFumble.isCrit) {
          if (!roll.hit) {
            newRollData[rollID].hit = true
            madeChange = true;
          }

        // all critical fumbles are misses
        } else if (critFumble.isFumble) {
          if (roll.hit) {
            newRollData[rollID].hit = false
            madeChange = true;
          }

        // are we auto-calculating hits?
        } else if (showToHitAC && toHitAC > 0) {
          const rollUse = getRollUseDiscard(roll).rollUse
          const newHit = rollUse >= toHitAC
          madeChange = madeChange || (newRollData[rollID].hit !== newHit)
          newRollData[rollID].hit = newHit
        }
      }
    }

    if (madeChange) {
      rollFunctions.setRollData(newRollData);
    }
    return madeChange;
  }

  function getRollUseDiscard(attackRoll) {
    let {rollUse, rollDiscard} = 0;
    const rollSorted = [attackRoll.rollOne, attackRoll.rollTwo].sort((a,b)=>a-b);

    if (advantage && !disadvantage) {
      rollUse = rollSorted[1];
      rollDiscard = rollSorted[0];
    } else if (disadvantage && !advantage) {
      rollUse = rollSorted[0];
      rollDiscard = rollSorted[1];
    } else {
      rollUse = attackRoll.rollOne;
      rollDiscard = -100;
    }

    // add the attack modifier
    rollUse = rollUse + attackRoll.attackBonus;
    rollDiscard = rollDiscard + attackRoll.attackBonus;

    return { rollUse: rollUse, rollDiscard: rollDiscard }
  }


  function getCritOrFumble(roll) {
    let isCrit = false;
    let isFumble = false;

    // only attacks can crit
    const source = attackSourceData[roll.attackID]
    const type = source.type
    if (type !== 'attack' && type !== 'ability') { return false; }

    // allow for expanded crit ranges
    let rollCritMinimum = 20
    if (anyDamageSourceContains(source, 'expandedcrit1')) rollCritMinimum = 19
    if (anyDamageSourceContains(source, 'expandedcrit2')) rollCritMinimum = 18

    const rollSorted = [roll.rollOne, roll.rollTwo].sort((a,b)=>a-b);

    // ADVANTAGE: use the higher roll's crit
    if (advantage && !disadvantage) {
      if (roll.rollOne === rollSorted[1]) {
        isCrit = roll.rollOne >= rollCritMinimum;
        isFumble = roll.rollOne === 1;
      } else {
        isCrit = roll.rollTwo >= rollCritMinimum;
        isFumble = roll.rollTwo === 1;
      }

    // DISADVANTAGE: use the lower roll's crit
    } else if (disadvantage && !advantage) {
      if (roll.rollOne === rollSorted[1]) {
        isCrit = roll.rollTwo >= rollCritMinimum;
        isFumble = roll.rollTwo === 1;
      } else {
        isCrit = roll.rollOne >= rollCritMinimum;
        isFumble = roll.rollOne === 1;
      }

    // NEUTRAL: use the first roll's crit
    } else {
      isCrit = roll.rollOne >= rollCritMinimum;
      isFumble = roll.rollOne === 1;
    }

    return {isCrit: isCrit, isFumble: isFumble};
  }


  function calculateDamage() {
    let startingBreakdown = {};
    allDamageTypes.forEach((type) => { startingBreakdown[type] = 0 })

    // calculate damage total & breakdown by type
    let newDamageTotal = 0;
    let newDamageBreakdown = deepCopy(startingBreakdown);
    let rollSummaryData = {
      characterName: characterName,
      conditions: [],
      rolls: []
    };

    for (let rollID = 0; rollID < rollData.length; rollID++) {
      const roll = rollData[rollID];
      const attackSource = attackSourceData[roll.attackID]
      const damageSourceData = attackSource.damageData
      const critFumble = getCritOrFumble(roll);
      let subtotal = 0;
      let subtotalBreakdown = deepCopy(startingBreakdown);
      let appliedCondition = null;

      // get both CRIT and REGULAR dice
      for (let dicePoolIndex = 0; dicePoolIndex < 2; dicePoolIndex++) {
        const dicePool = [roll.damageRollData, roll.critRollData][dicePoolIndex]

        // skip adding up the crit dice pool unless this **was** a critical hit
        if (dicePoolIndex === 0 || critFumble.isCrit) {
          const damageRollData = dicePool;
          for (let damageRollID = 0; damageRollID < damageRollData.length; damageRollID++) {
            const damageRoll = damageRollData[damageRollID];
            const damageSource = damageSourceData[damageRoll.sourceID];
            let amount = damageRoll.amount;
            if (damageRoll.rerolled) { amount = damageRoll.rerolledAmount}

            let applyDamage = false;
            if (roll.hit || critFumble.isCrit) { applyDamage = true; }

            if (damageSource.tags.includes("savehalf")) {
              // has evasion
              if (evasion && attackSource.savingThrowType === 0) {
                if (roll.hit) {
                  applyDamage = true;
                  amount = amount * .5;
                } else {
                  applyDamage = false;
                }
              // no evasion
              } else {
                if (!roll.hit) {
                  applyDamage = true;
                  amount = amount * .5;
                }
              }
            }

            if (roll.gatedByRollID >= 0) {
              const gatingAttackRoll = rollData[roll.gatedByRollID];
              if (!gatingAttackRoll.hit) { applyDamage = false; }
            }

            if (attackSource.type === 'attack' && critFumble.isFumble) { applyDamage = false; }
            if (!damageSource.enabled) { applyDamage = false; }

            if (applyDamage && damageSource.tags.includes("condition")) { appliedCondition = damageSource.condition }
            if (applyDamage && amount !== 0) {
              subtotal = subtotal + amount;
              subtotalBreakdown[damageRoll.type] = subtotalBreakdown[damageRoll.type] + amount
            }
          }
        }
      }

      // save summary data for the Party Panel so we don't have to go through this again
      let includeInSummary = true;
      if (roll.gatedByRollID >= 0 && !rollData[roll.gatedByRollID].hit) { includeInSummary = false; }
      if (attackSource.type === 'ability' && !roll.hit) { includeInSummary = false; }

      if (includeInSummary) {
        let summary = { ...subtotalBreakdown }
        // filter out 0-damage types
        Object.keys(summary).forEach(type => {
          if (summary[type] <= 0) delete summary[type];
        });

        summary.name = attackSource.name;
        if (appliedCondition) { summary.applies = appliedCondition }
        if (attackSource.type === 'save' || roll.gatedByRollID >= 0) {
          summary.save = `DC ${attackSource.savingThrowDC} ${abilityTypes[attackSource.savingThrowType]}`;
          summary.didsave = !roll.hit;
        } else if (attackSource.type === 'ability') {
          summary.attack = -100; // abilities marked by a big negative
        } else {
          summary.attack = getRollUseDiscard(roll).rollUse;
        }

        rollSummaryData.rolls.push(summary)
      }

      subtotal = Math.max( Math.floor(subtotal), 0);
      newDamageTotal = newDamageTotal + subtotal;
      allDamageTypes.forEach((type) => {
        newDamageBreakdown[type] = newDamageBreakdown[type] + Math.floor(subtotalBreakdown[type]);
      })
    }

    // filter out 0-damage types
    Object.keys(newDamageBreakdown).forEach(type => {
      if (newDamageBreakdown[type] <= 0) delete newDamageBreakdown[type];
    });

    // collate the roll conditions
    if (advantage && !disadvantage) rollSummaryData.conditions.push('advantage')
    if (!advantage && disadvantage) rollSummaryData.conditions.push('disadvantage')
    if (evasion) rollSummaryData.conditions.push('evasion')

    setDamageTotal(newDamageTotal);
    setDamageBreakdown(newDamageBreakdown);
    setRollSummaryData(rollSummaryData);
  }




  let currentAttackName = '';//used in the render attack title loop, dunno why I can't declare there
  return (
    <div className="Roller">

      <div className="controls-and-results">

        <div className="conditions">
          <label>
            <input
              name="advantage"
              type="checkbox"
              checked={advantage}
              onChange={() => setAdvantage(!advantage)}
            />
            Advantage
          </label>

          <label>
            <input
              name="disadvantage"
              type="checkbox"
              checked={disadvantage}
              onChange={() => setDisadvantage(!disadvantage)}
            />
            Disadvantage
          </label>

          {showEvasionOption &&
            <label className="has-evasion">
              <input
                name="evasion"
                type="checkbox"
                checked={evasion}
                onChange={() => setEvasion(!evasion)}
              />
              Evasion
            </label>
          }

          {showToHitAC &&
            <label className="to-hit-ac">
              <input
                type="number"
                value={toHitAC}
                onChange={e => setToHitAC(Math.max(Math.min(parseInt(e.target.value), 30), 0))}
              />
              AC
            </label>
          }
        </div>

        <BigRollButton handleNewRoll={handleNewRoll} />

        <div className="results">
          <div className="type-breakdown">
            { Object.keys(damageBreakdown).map((type, i) => {
              return (
                <div className="damage-type" key={i}>
                  <div className='amount'>{damageBreakdown[type]}</div>
                  <div className={`asset ${type}`} />
                </div>
              )
            })}

          </div>
          <div className="total">
            <div className="label">Total Damage:</div>
            <div className="count">{damageTotal}</div>
          </div>
        </div>
      </div>

      {rollData.length > 0 && <>
        <div className="rolls">
          {/* <div className="hit-label">Hit?</div>*/}

          {
            rollData.map((attackRoll, rollID) => {
              let {rollUse, rollDiscard} = getRollUseDiscard(attackRoll);
              const critFumble = getCritOrFumble(attackRoll);

              const attackSource = attackSourceData[attackRoll.attackID];
              let rollName = attackSource.name;
              let rollSavingThrow = attackSource.type === 'save';
              let rollSavingThrowDC = attackSource.savingThrowDC;
              let rollSavingThrowType = attackSource.savingThrowType;

              // handle gated rolls; the gated roll ID must have hit for us to show up, Otherwise, RETURN EARLY.
              if (attackRoll.gatedByRollID >= 0) {
                const gatingAttackRoll = rollData[attackRoll.gatedByRollID];
                if (!gatingAttackRoll.hit) { return (<React.Fragment key={rollID}></React.Fragment>) }

                // also, force the roll to be its own thing & a saving throw
                rollName = rollName + " saving throw";
                rollSavingThrow = true;
              }

              let renderAttackName = false;
              if (currentAttackName !== rollName) {
                currentAttackName = rollName;
                renderAttackName = true;
              }

              return (
                <div className='roll-container' key={`roll-container-${rollID}`}>
                  { renderAttackName &&
                    <>
                      <h4>
                        {currentAttackName}
                        {rollSavingThrow && ` — DC ${rollSavingThrowDC} ${abilityTypes[rollSavingThrowType]}`}
                      </h4>
                      { (attackSource.type !== 'ability') &&
                        <div className='roll-type-hint'>
                          {rollSavingThrow ? 'Saved?' : 'Hit?'}
                        </div>
                      }
                    </>
                  }
                  <Roll
                    rollID={rollID}
                    rollUse={rollUse}
                    rollDiscard={rollDiscard}
                    isCrit={critFumble.isCrit}
                    isFumble={critFumble.isFumble}
                    evasion={evasion && attackSource.savingThrowType === 0}
                    type={rollSavingThrow ? 'save' : attackSource.type}
                    damageSourceData={attackSourceData[attackRoll.attackID].damageData}
                    attackRollData={attackRoll}
                    rollFunctions={rollFunctions}
                    key={`${attackRoll.attackID}-${rollID}`}
                  />
                </div>
              )
            })
          }

        </div>

        <div className="clear-roll-container">
          <button className="clear-rolls" onClick={() => {handleClear()}}>
            Clear
          </button>
        </div>
      </>}
    </div>
  );
}
export default Roller ;
