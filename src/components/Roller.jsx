import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import Roll from './Roll.jsx';
import './Roller.scss';


const Roller = ({
  rollData,
  rollFunctions,
  attackSourceData,
  handleNewRoll
}) => {

  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [toHitAC, setToHitAC] = useState(0);

  // when ToHitAC or the roll data changes, figure out what's a hit
  useEffect(() => {
    autoCalculateHits();
  }, [toHitAC, rollData, advantage, disadvantage]);

  // figure out what's a hit
  function autoCalculateHits() {
    let newRollData = deepCopy(rollData);// so we can update the whole thing in one go
    let madeChange = false;

    for (let rollID = 0; rollID < newRollData.length; rollID++) {
      const roll = newRollData[rollID];
      const {rollUse, rollDiscard} = getRollUseDiscard(roll);

      // if we're given a to-hit AC, set all the hits automatically
      if (toHitAC > 0) {
        const didhit = (rollUse >= toHitAC)
        if (roll.hit !== didhit) {
          newRollData[rollID].hit = didhit
          madeChange = true;
        }
      }

      // all critical hits are hits
      const isCrit = isRollCrit(roll);
      if (isCrit && !roll.hit) {
        newRollData[rollID].hit = true
        madeChange = true;
      }
    }

    if (madeChange) {rollFunctions.setRollData(newRollData)}
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
      rollDiscard = 0;
    }

    return { rollUse: rollUse, rollDiscard: rollDiscard }
  }


  // calculate damage total & breakdown by type
  let damageTotal = 0;
  let damageBreakdown = {};
  let firstHitRollID = -1;

  for (let rollID = 0; rollID < rollData.length; rollID++) {
    const roll = rollData[rollID];
    const damageSourceData = attackSourceData[roll.attackID].damageData
    const isCrit = isRollCrit(roll);

    if (roll.hit || isCrit) {
      if (firstHitRollID === -1) { firstHitRollID = rollID; }
      const isFirstHit = (rollID === firstHitRollID);

      // get both CRIT and REGULAR dice
      [roll.damageRollData, roll.critRollData].forEach((dicePool, dicePoolIndex) => {
        // only include the crit dice pool if we got the critical hit
        if (dicePoolIndex === 0 || isCrit) {

          const damageRollData = dicePool;
          for (let damageRollID = 0; damageRollID < damageRollData.length; damageRollID++) {
            const type = damageRollData[damageRollID][0];
            const amount = damageRollData[damageRollID][1];
            const rerolled = damageRollData[damageRollID][2];
            const sourceID = damageRollData[damageRollID][3];
            const damageSource = damageSourceData[sourceID];

            let applyDamage = true;
            if (!damageSource.enabled) { applyDamage = false; }
            if (damageSource.tags.includes("first") && !isFirstHit) { applyDamage = false; }

            if (applyDamage) {
              damageTotal = damageTotal + amount;
              if (type in damageBreakdown) {
                damageBreakdown[type] = damageBreakdown[type] + amount
              } else {
                damageBreakdown[type] = amount
              }
            }
          }
        }
      })
    }
  }

  function isRollCrit(roll) {
    let isCrit = false;

    const rollSorted = [roll.rollOne, roll.rollTwo].sort((a,b)=>a-b);

    // ADVANTAGE: use the higher roll's crit
    if (advantage && !disadvantage) {
      if (roll.rollOne === rollSorted[1]) {
        isCrit = roll.critOne
      } else {
        isCrit = roll.critTwo
      }

    // DISADVANTAGE: use the lower roll's crit
    } else if (disadvantage && !advantage) {
      if (roll.rollOne === rollSorted[1]) {
        isCrit = roll.critTwo
      } else {
        isCrit = roll.critOne
      }

    // NEUTRAL: use the first roll's crit
    } else {
      isCrit = roll.critOne
    }

    return isCrit;
  }

  let currentAttackName = '';//used in the render attack title loop, dunno why I can't declare there
  return (
    <div className="Roller">
      <div className="controls-and-results">

        <div className="controls">
          <div className="roll-container">
            <button className="new-roll" onClick={() => handleNewRoll()}>
                <div className='asset d20' />
            </button>
          </div>

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

            <label className="armor-class">
              <input
                type="number"
                value={toHitAC}
                onChange={e => setToHitAC(e.target.value)}
              />
              AC (optional)
            </label>
          </div>
        </div>

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

      <hr />

      <div className="rolls">
        {/* <div className="hit-label">Hit?</div>*/}

        {
          rollData.map((attackRoll, rollID) => {
            const {rollUse, rollDiscard} = getRollUseDiscard(attackRoll);

            let renderAttackName = false;
            if (currentAttackName !== attackSourceData[attackRoll.attackID].name) {
              currentAttackName = attackSourceData[attackRoll.attackID].name;
              renderAttackName = true;
            }

            return (
              <>
                { renderAttackName &&
                  <h4>{currentAttackName}</h4>
                }
                <Roll
                  rollID={rollID}
                  rollUse={rollUse}
                  rollDiscard={rollDiscard}
                  toHitAC={toHitAC}
                  isFirstHit={rollID === firstHitRollID}
                  isCrit={isRollCrit(attackRoll)}
                  damageSourceData={attackSourceData[attackRoll.attackID].damageData}
                  attackRollData={attackRoll}
                  rollFunctions={rollFunctions}
                  key={rollID}
                />
              </>
            )
          })
        }

      </div>
    </div>
  );
}
export default Roller ;
