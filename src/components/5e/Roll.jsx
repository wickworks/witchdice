import React from 'react';
import HitCheckbox from '../shared/HitCheckbox.jsx';
import { deepCopy } from '../../utils.js';
import './Roll.scss';

const Roll = ({
  rollID,
  rollUse, rollDiscard,
  isCrit, isFumble, evasion,
  type,
  damageSourceData,
  attackRollData,
  rollFunctions
}) => {

  // no 'crit' here; use isCrit from props instead
  const {hit, attackBonus, damageRollData, critRollData} = attackRollData;
  const {setHit, setRollOne, setDamageRollData, setCritRollData} = rollFunctions;

  // saving throws are reversed, it's confusing, I know >> NO LONGER
  const isHit = hit; // (type === 'save' ? !hit : hit);

  const useLowerRollClass = (rollUse < rollDiscard) ? 'reverse' : '';

  const handleDamageClick = (damageSourceID, damageRollID, isCritRoll) => {
    let newData = [];
    newData = isCritRoll ? deepCopy(critRollData) : deepCopy(damageRollData);

    // flip the "rerolled" flag
    newData[damageRollID].rerolled = !newData[damageRollID].rerolled;

    if (isCritRoll) {
      setCritRollData(newData, damageSourceID);
    } else {
      setDamageRollData(newData, damageSourceID);
    }
  }

  // should only be used for abilities // where rollUse == rollOne
  const handleCritClick = () => {
    const newRoll = (rollUse === 20) ? 0 : 20;
    setRollOne(newRoll, rollID);
  }

  // process the damage for THIS roll
  let diceElements = [];
  let damageBreakdown = {};
  let appliedConditions = [];

  // get both CRIT and REGULAR dice
  [damageRollData, critRollData].forEach((dicePool, dicePoolIndex) => {
    // only include the crit dice pool if we got the critical hit
    if (dicePoolIndex === 0 || isCrit) {

      dicePool.forEach((damageRoll, i) => {
        const damageSource = damageSourceData[damageRoll.sourceID]
        const icon = damageRoll.type
        let amount = damageRoll.amount
        if (damageRoll.rerolled) { amount = damageRoll.rerolledAmount}

        let showDamageRoll = (hit || isCrit) && !isFumble

        const isRerollable = (damageRoll.rerolledAmount > 0)

        let rerollClass = !isRerollable ? 'no-reroll' : damageRoll.rerolled ? 'rerolled' : ''
        let critClass = (isCrit && dicePoolIndex === 1) ? 'crit' : ''
        let halvedClass = ''

        if (!damageSource.enabled) { showDamageRoll = false; }
        if (damageSource.tags.includes("savehalf")) {
          if (evasion) {     // has evasion
            if (hit) {
              showDamageRoll = true;
              amount = amount * .5;
              halvedClass = 'halved';
            } else {
              showDamageRoll = false;
            }
          } else {            // no evasion
            if (!hit) {
              showDamageRoll = true;
              amount = amount * .5;
              halvedClass = 'halved';
            }
          }
        }

        if (showDamageRoll) {
          if (damageSource.condition.length > 0) { appliedConditions.push(damageSource.condition) }

          if (amount !== 0) {
            if (icon in damageBreakdown) {
              damageBreakdown[icon] = damageBreakdown[icon] + amount
            } else {
              damageBreakdown[icon] = amount
            }

            diceElements.push(
              <div
                className={`damage-roll ${rerollClass} ${critClass} ${halvedClass}`}
                key={`${i}-${dicePoolIndex}`}
                onClick={() => {
                  if (isRerollable) handleDamageClick(rollID, i, (isCrit && dicePoolIndex === 1))
                }}
              >
                <div className={`asset ${icon}`} />
                <div className='amount'>{amount}</div>
              </div>
            );
          }
        }
      })
    }
  })

  // if no damage is coming out of this, just show a line / fumble
  if (diceElements.length === 0 && appliedConditions.length === 0 ) {
    if (isFumble) {
      diceElements.push(
        <div className='fumble' key={`fumble-${rollID}`}>* fumble *</div>
      )
    } else {
      diceElements.push( <hr className='miss' key={`miss-${rollID}`} /> )
    }
  }

  const critClass = isCrit ? 'crit' : ''

  return (
    <div className="Roll">
      <HitCheckbox
        isHit={isHit}
        handleHitClick={() => setHit(!hit, rollID)}
        isCrit={isCrit}
        isFumble={isFumble}
        isSave={type === 'save'}
      />

      { type === 'attack' ?
        isCrit ?
          <div className='result-crit-container'>
            <div className='asset d20_frame result-crit'>
              <div className='asset necrotic' />
            </div>
            <div className='crit-label'>
              CRIT
            </div>
          </div>
        :
          <>
            <div className={`asset d20`} />

            <div className={`result-roll ${useLowerRollClass}`}>
              <span className='roll-use'>
                {isFumble ?
                  <>1</>
                :
                  <>
                    <span className='total'>{rollUse}</span>
                    <span className='sum'>
                      {rollUse-attackBonus}
                      {attackBonus >= 0 ? '+' : ''}
                      {attackBonus}
                    </span>
                  </>
                }
              </span>
              <span className='roll-discard'>
                {rollDiscard > 0 ? rollDiscard : ''}
              </span>
            </div>
          </>
      : type === 'ability' &&
        <div className='ability-controls'>
          <button
            className={`ability-crit-button ${isCrit ? 'toggled' : ''}`}
            onClick={handleCritClick}
          >
            <div className='asset d20_frame'>
              <div className='asset necrotic' />
            </div>
          </button>
        </div>
      }

      <div className="damage-line">

        <div className="damage-container">
          {diceElements}
        </div>

        {/* isCrit &&
          <div className="crit-container">
            <div className="asset necrotic" />
            CRITICAL HIT
            <div className="asset necrotic" />
          </div>
        */}

        { (diceElements.length > 0 || appliedConditions.length > 0) &&
          <div className={`subtotal-container ${critClass}`}>
            { [...new Set(appliedConditions)].map((condition, i) => {
              return (
                <div className='applied-condition' key={`condition-${i}`}>
                  <a
                    href={`https://www.dndbeyond.com/sources/basic-rules/appendix-a-conditions#${condition}`}
                    target='_blank'
                    rel="noopener noreferrer"
                  >
                    {condition}
                  </a>
                </div> )
            })}

            { Object.keys(damageBreakdown).map((icon, i) => {
              return (
                <div className='subtotal' key={i}>
                  <div className='amount'>{Math.max( Math.floor(damageBreakdown[icon]), 0)}</div>
                  <div className={`asset ${icon}`} />
                </div>
              )
            })}
          </div>
        }
      </div>

    </div>
  );
}

export default Roll;
