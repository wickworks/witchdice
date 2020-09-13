import React from 'react';
import './Roll.scss';

const Roll = ({...props }) => {

  const {
    rollID,
    hit, setHit,
    rollUse, rollDiscard,
    damageRollData
  } = props;

  const useLowerRollClass =
    (rollUse < rollDiscard) ?
    'reverse' : '';

  return (
    <div className="Roll">

      <input
        name="hit"
        type="checkbox"
        checked={hit}
        onChange={() => setHit(!hit, rollID)}
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

            return (
              <div className="damage-roll" key={i}>
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
