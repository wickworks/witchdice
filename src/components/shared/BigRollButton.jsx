import React from 'react';
import './BigRollButton.scss';

const BigRollButton = ({
  handleNewRoll,
  isDisabled,
  rollResult = null,
}) => {
  const disabledClass = isDisabled ? 'disabled' : '';
  return (
    <div className='BigRollButton'>
      <button
        className={`new-roll ${disabledClass}`}
        onClick={handleNewRoll}
        disabled={isDisabled}
      >
        { rollResult === null ?
          <div className='asset d20' />
        :
          <div className='result'>
            {rollResult}
          </div>
        }

      </button>
    </div>
  );
}

export default BigRollButton ;
