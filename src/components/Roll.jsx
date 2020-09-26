import React from 'react';
import './Roll.scss';

const Roll = ({
  rollID,
  rollUse, rollDiscard,
  isCrit, evasion,
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

  function renderDamageDice() {
    let diceElements = [];

    // get both CRIT and REGULAR dice
    [damageRollData, critRollData].forEach((dicePool, dicePoolIndex) => {
      // only include the crit dice pool if we got the critical hit
      if (dicePoolIndex === 0 || isCrit) {

        return (
          dicePool.map((damage, i) => {
            const icon = damage[0];
            let amount = damage[1];
            const rerolled = damage[2];
            const sourceID = damage[3];
            const damageSource = damageSourceData[sourceID];

            let showDamageRoll = (hit || isCrit)

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
        )
      }
    })


    // if no damage is coming out of this, just show a line
    if (diceElements.length === 0 ) { diceElements.push( <hr /> )}
    return diceElements;
  }

  const handleHitClick = () => { setHit(!hit, rollID) }

  // disabled={(toHitAC > 0 || isCrit)}
  return (
    <div className="Roll">

      <input
        name="hit"
        type="checkbox"
        checked={isHit}
        onChange={handleHitClick}
        disabled={isCrit}
      />

      { !isSavingThrow &&
        <>
          <div className={`asset d20`} />

          <div className={`d20-results ${useLowerRollClass}`}>
            <span className='roll-use'>
              {rollUse}
            </span>
            <span className='roll-discard'>
              {rollDiscard > 0 ? rollDiscard : ''}
            </span>
          </div>
        </>
      }

      <div className="damage-container">
        {renderDamageDice()}
      </div>

      <div className="crit-container">
        { isCrit &&
          <>
            <div className="asset necrotic" />
            CRITICAL HIT
            <div className="asset necrotic" />
          </>
        }
      </div>

    </div>
  );
}

export default Roll;
