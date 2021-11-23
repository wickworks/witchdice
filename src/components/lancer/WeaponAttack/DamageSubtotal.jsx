import React, { useState } from 'react';

import './DamageSubtotal.scss';

const DamageSubtotal = ({
  totalsByType
}) => {
  const [condenseTypes, setCondenseTypes] = useState(true);

  const actualTotal = Object.values(totalsByType).reduce((partial_sum, a) => partial_sum + a, 0);

  const singleType = (Object.keys(totalsByType).length === 1);

  return (
    <div className="DamageSubtotal">
      {condenseTypes ?
        <button className='actual-total-container' onClick={() => setCondenseTypes(!condenseTypes)} disabled={singleType}>
          <div className='amount'>{actualTotal}</div>
          <div className='type-column'>
            { Object.keys(totalsByType).map(type =>
              <div
                className={`asset-lancer ${type.toLowerCase()} ${singleType ? 'single-type' : ''}`}
                key={type}
              />
            )}
          </div>
        </button>
      :
        <button className='by-type-container' onClick={() => setCondenseTypes(!condenseTypes)}>
          { Object.keys(totalsByType).map((type, i) =>
            <div className='subtotal' key={type}>
              <div className='amount'>{totalsByType[type]}</div>
              <div className={`asset-lancer ${type.toLowerCase()}`} />
            </div>
          )}
        </button>
      }

    </div>
  )
}


export default DamageSubtotal;
