import React from 'react';
import './Roll.scss';

const Roll = ({
  rollID,
  rollUse, rollDiscard,
  isCrit, isFumble, evasion,
  toHitAC, isFirstHit, isSavingThrow,
  damageSourceData,
  attackRollData,
  rollFunctions
}) => {

  // no 'crit' here; use isCrit from props instead
  const {attackID, hit, damageRollData, critRollData} = attackRollData;
  const {setHit, setDamageData} = rollFunctions

  // saving throws are reversed
  const isHit = (isSavingThrow ? !hit : hit);

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

        if (damageSource.tags.includes("first") && !isFirstHit) { showDamageRoll = false }

        if (showDamageRoll) {
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
      })
    }
  })

  // if no damage is coming out of this, just show a line / fumble
  if (diceElements.length === 0 ) {
    if (isFumble) {
      diceElements.push( <div className='fumble'>* fumble *</div> )
    } else {
      diceElements.push( <hr className='miss' /> )
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

      { !isSavingThrow ?
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
                  <>{rollUse}</>
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

        { (diceElements.length > 0) &&
          <div className={`subtotal-container ${critClass}`}>
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
