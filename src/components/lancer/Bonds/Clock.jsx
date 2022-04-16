import React, { useState } from 'react';
import './Clock.scss';

const Clock = ({
  typeLabel,
  defaultSize = 6,
  inputEnabled = false,
  inputLabel,
}) => {
  const [maxSize, setMaxSize] = useState(defaultSize)

  const isDisabled = (inputEnabled && !inputLabel)

  const setSize = (size) => {

  }

  return (
    <div className='Clock'>
      <div className={`controls-container ${isDisabled ? 'disabled' : ''}`}>
        <SetSizeButton setToSize={4} current={maxSize} setSize={setMaxSize} />
        <SetSizeButton setToSize={6} current={maxSize} setSize={setMaxSize} />
        <SetSizeButton setToSize={8} current={maxSize} setSize={setMaxSize} />
        <SetSizeButton setToSize={10} current={maxSize} setSize={setMaxSize} />

        <div className={`segments-container`}>

        </div>

      </div>

      {inputEnabled &&
        <input type='text' />
      }

      <div className={`type-label ${inputEnabled ? 'small' : ''}`}>
        {typeLabel}
      </div>
    </div>
  );
}

const SetSizeButton = ({
  current,
  setToSize,
  setSize
}) => {
  const currentClass = current === setToSize ? 'current' : ''
  return (
    <button
      className={`SetSizeButton size-${setToSize} ${currentClass}`}
      onClick={() => setSize(setToSize)}
    >
      <div>{setToSize}</div>
    </button>
  );
}


export default Clock ;
