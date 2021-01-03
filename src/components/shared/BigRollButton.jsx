import React from 'react';
import './BigRollButton.scss';

const BigRollButton = ({
  handleNewRoll,
  isDisabled,
}) => {
  const disabledClass = isDisabled ? 'disabled' : '';
  return (
    <div className='BigRollButton'>
      <button
        className={`new-roll ${disabledClass}`}
        onClick={handleNewRoll}
        disabled={isDisabled}
      >
          <div className='asset d20' />
      </button>
    </div>
  );
}

export default BigRollButton ;
