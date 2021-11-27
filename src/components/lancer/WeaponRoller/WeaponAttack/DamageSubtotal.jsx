import React, { useState } from 'react';

import './DamageSubtotal.scss';

const DamageSubtotal = ({
  totalsByType
}) => {
  const [condenseTypes, setCondenseTypes] = useState(true);

  const actualTotal = Object.values(totalsByType).reduce((partial_sum, a) => partial_sum + a, 0);

  const singleType = (Object.keys(totalsByType).length === 1);

  // Heat and burn never get condensed
  const UNCONDENSED_TYPES = ['Heat', 'Burn']
  var areTypesCondensed = condenseTypes;
  Object.keys(totalsByType).forEach(type => { if (UNCONDENSED_TYPES.includes(type)) { areTypesCondensed = false } });

  return (
    <div className="DamageSubtotal">
      {areTypesCondensed ?
        <button className='actual-total-container' onClick={() => setCondenseTypes(!condenseTypes)} disabled={singleType}>
          <div className='amount'>{actualTotal}</div>
          <div className='type-column'>
            { Object.keys(totalsByType).map(type =>
              <div
                className={`asset ${type.toLowerCase()} ${singleType ? 'single-type' : ''}`}
                key={type}
              />
            )}
          </div>
        </button>
      :
        <button className='by-type-container' onClick={() => setCondenseTypes(!condenseTypes)} disabled={areTypesCondensed !== condenseTypes}>
          { Object.keys(totalsByType).map((type, i) =>
            <div className='subtotal' key={type}>
              <div className='amount'>{totalsByType[type]}</div>
              <div className={`asset ${type.toLowerCase()}`} />
            </div>
          )}
        </button>
      }

    </div>
  )
}


export default DamageSubtotal;
