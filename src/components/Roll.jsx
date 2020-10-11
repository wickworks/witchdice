import React from 'react';
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
  const {attackID, hit, attackBonus, damageRollData, critRollData} = attackRollData;
  const {setHit, setDamageData} = rollFunctions

  // saving throws are reversed
  const isHit = (type === 'save' ? !hit : hit);

  const useLowerRollClass =
    (rollUse < rollDiscard) ?
    'reverse' : '';

  const handleDamageClick = (damageSourceID, damageRollID) => {
    console.log('TODO: make this reroll the die');
  }

  const handleHitClick = () => { setHit(!hit, rollID) }


  // process the damage for THIS roll
  let diceElements = [];
  let damageBreakdown = {};
  let appliedConditions = [];

  // get both CRIT and REGULAR dice
  [damageRollData, critRollData].forEach((dicePool, dicePoolIndex) => {
    // only include the crit dice pool if we got the critical hit
    if (dicePoolIndex === 0 || isCrit) {

      dicePool.map((damage, i) => {
        const icon = damage[0];
        let amount = damage[1];
        const rerolled = damage[2];
        const sourceID = damage[3];
        const damageSource = damageSourceData[sourceID];

        let showDamageRoll = (hit || isCrit) && !isFumble

        let rerollClass = rerolled ? 'rerolled' : '';
        let critClass = (isCrit && dicePoolIndex === 1) ? 'crit' : '';
        let halvedClass = '';

        if (!damageSource.enabled) { showDamageRoll = false; }
        if ((type === 'save') && damageSource.tags.includes("savehalf")) {
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

          if (amount > 0) {
            if (icon in damageBreakdown) {
              damageBreakdown[icon] = damageBreakdown[icon] + amount
            } else {
              damageBreakdown[icon] = amount
            }

            diceElements.push(
              <div
                className={`damage-roll ${rerollClass} ${critClass} ${halvedClass}`}
                key={`${i}-${dicePoolIndex}`}
                onClick={() => handleDamageClick(sourceID, i)}
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
      { isCrit && true === false &&
        <div className="crit-container">
          <div className="asset necrotic" />
          CRITICAL HIT
          <div className="asset necrotic" />
        </div>
      }

      <input
        name="hit"
        type="checkbox"
        checked={isHit}
        onChange={handleHitClick}
        disabled={isCrit || isFumble}
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
      :
        <></>
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
                  >
                    {condition}
                  </a>
                </div> )
            })}

            { Object.keys(damageBreakdown).map((icon, i) => {
              return (
                <div className='subtotal' key={i}>
                  <div className='amount'>{damageBreakdown[icon]}</div>
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
