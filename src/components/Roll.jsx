import React from 'react';
import './Roll.scss';

const Roll = ({
  rollID,
  rollUse, rollDiscard,
  isCrit,
  toHitAC, isFirstHit,
  damageSourceData,
  attackRollData,
  rollFunctions
}) => {

  // no 'crit' here; use isCrit from props instead
  const {attackID, hit, damageRollData, critRollData} = attackRollData;
  const {setHit, setDamageData} = rollFunctions

  const useLowerRollClass =
    (rollUse < rollDiscard) ?
    'reverse' : '';

  const handleDamageClick = (damageSourceID, damageRollID) => {

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
            const amount = damage[1];
            const rerolled = damage[2];
            const sourceID = damage[3];
            const damageSource = damageSourceData[sourceID];

            let disableClass = '';
            // if (!damageSource.enabled) { disableClass = 'disabled'; }
            if (!damageSource.enabled) { disableClass = 'hidden'; }
            if (damageSource.tags.includes("first") && !isFirstHit) { disableClass = 'hidden'; }

            let rerollClass = rerolled ? 'rerolled' : '';

            let critClass = (isCrit && dicePoolIndex === 1) ? 'crit' : '';

            diceElements.push(
              <div
                className={`damage-roll ${disableClass} ${rerollClass} ${critClass}`}
                key={`${i}-${dicePoolIndex}`}
                onClick={handleDamageClick(sourceID, i)}
              >
                <div className={`asset ${icon}`} />
                <div className='amount'>{amount}</div>
              </div>
            );
          })
        )
      }
    })

    return diceElements;
  }

  const handleHitClick = () => { setHit(!hit, rollID) }

  return (
    <div className="Roll">

      <input
        name="hit"
        type="checkbox"
        checked={hit}
        onChange={handleHitClick}
        disabled={(toHitAC > 0 || isCrit)}
      />

      <div className={`asset d20`} />

      <div className={`d20-results ${useLowerRollClass}`}>
        <span className='roll-use'>
          {rollUse}
        </span>
        <span className='roll-discard'>
          {rollDiscard > 0 ? rollDiscard : ''}
        </span>
      </div>

      <div className="damage-container">
        { hit ?
          renderDamageDice()
        :
          <hr />
        }
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
