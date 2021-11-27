import React from 'react';
import './BaseDamageBar.scss';

const BaseDamageBar = ({
  weaponData,
}) => {

  return (
    <div className="BaseDamageBar">
      <div className="base-damage">
        <div>{'[ '}</div>
        { weaponData.damage.map((damage, i) =>
          <div className='damage-dice' key={`damage-${i}`}>
            {damage.val}
            <div className={`asset-lancer ${damage.type.toLowerCase()}`} />
          </div>
        )}
        <div>{' ]'}</div>
      </div>
    </div>
  )
}

export default BaseDamageBar;
