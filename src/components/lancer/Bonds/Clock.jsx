import React from 'react';
import './Clock.scss';

const Clock = ({
  typeLabel,
  inputEnabled = false,
  inputLabel,
}) => {

  const isDisabled = (inputEnabled && !inputLabel)

  return (
    <div className='Clock'>
      <div className={`segment-container ${isDisabled ? 'disabled' : ''}`} />

      {inputEnabled &&
        <input type='text' />
      }

      <div className={`type-label ${inputEnabled ? 'small' : ''}`}>
        {typeLabel}
      </div>
    </div>
  );
}

export default Clock ;
