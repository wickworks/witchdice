import React from 'react';
import './Roll.scss';

const Roll = ({
  rollID,
  rollUse, rollDiscard,
  toHitAC, isFirstHit,
  damageSourceData,
  attackRollData,
  rollFunctions
}) => {

  const {attackID, hit, damageRollData} = attackRollData;
  const {setHit, setDamageData} = rollFunctions

  const useLowerRollClass =
    (rollUse < rollDiscard) ?
    'reverse' : '';

  // if we're given a to-hit AC, set all the hits automatically
  if (toHitAC > 0) {
    const didhit = (rollUse >= toHitAC)
    if (hit !== didhit) { setHit(didhit, rollID); }
  }

  return (
    <div className="Roll">

      <input
        name="hit"
        type="checkbox"
        checked={hit}
        onChange={() => setHit(!hit, rollID)}
        disabled={(toHitAC > 0)}
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
          damageRollData.map((damage, i) => {
            const icon = damage[0];
            const amount = damage[1];
            const rerolled = damage[2];
            const sourceID = damage[3];
            const damageSource = damageSourceData[sourceID];

            let disableClass = '';
            if (!damageSource.enabled) { disableClass = 'disabled'; }
            if (damageSource.tags.includes("first") && !isFirstHit) { disableClass = 'hidden'; }

            let rerollClass = rerolled ? 'rerolled' : '';

            return (
              <div className={`damage-roll ${disableClass} ${rerollClass}`} key={i}>
                <div className={`asset ${icon}`} />
                <div className='amount'>{amount}</div>
              </div>
            );
          })
        :
          <hr />
        }
      </div>


    </div>
  );
}

export default Roll;
