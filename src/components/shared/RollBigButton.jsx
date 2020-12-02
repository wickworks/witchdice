import React from 'react';
import './RollBigButton.scss';

const RollBigButton = ({
  handleNewRoll,
  isDisabled,
}) => {
  const disabledClass = isDisabled ? 'disabled' : '';
  return (
    <div className='RollBigButton'>
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

export default RollBigButton ;
