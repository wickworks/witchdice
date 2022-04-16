import React, { useState } from 'react';
import './Clock.scss';

const Clock = ({
  typeLabel,
  defaultSize = 6,
  inputEnabled = false,
  userLabel,
  setUserLabel,
}) => {
  const [current, setCurrent] = useState(0)
  const [maxSize, setMaxSize] = useState(defaultSize)
  const [isEditingMaxSize, setIsEditingMaxSize] = useState(false)

  const isDisabled = (inputEnabled && !userLabel)

  const setSize = (size) => {
    if (current > size) setCurrent(size)
    setMaxSize(size)
  }

  return (
    <div className='Clock'>
      <div className={`controls-container ${isDisabled ? 'disabled' : ''}`}>

        {isEditingMaxSize ?
          <>
            <SetSizeButton text={4} onClick={() => setSize(4)} highlight={maxSize === 4} key={4}/>
            <SetSizeButton text={6} onClick={() => setSize(6)} highlight={maxSize === 6} key={6}/>
            <SetSizeButton text={8} onClick={() => setSize(8)} highlight={maxSize === 8} key={8}/>
            <SetSizeButton text={10} onClick={() => setSize(10)} highlight={maxSize === 10} key={410}/>
          </>
        : !isDisabled &&
          <>
            <SetSizeButton text={'-'} highlight={true} onClick={() => setCurrent(Math.max(current-1, 0))} key='-' />
            <SetSizeButton text={'+'} highlight={true} onClick={() => setCurrent(Math.min(current+1, maxSize))} key='+' />
          </>
        }

        <div className={`segments-container max-size-${maxSize}`}>

          {[...Array(maxSize)].map((_, i) =>
            <Segment
              current={current}
              segmentIndex={i}
              setCurrent={setCurrent}
              maxSize={maxSize}
              key={i}
            />
          )}

        </div>

        <button
          className='center-peg'
          onClick={() => setIsEditingMaxSize(!isEditingMaxSize)}
        >
          {current}
        </button>

      </div>

      {inputEnabled &&
        <input
          className='user-input'
          type='text'
          value={userLabel}
          onChange={e => setUserLabel(e.target.value)}
          placeholder={typeLabel}
        />
      }

      {!inputEnabled &&
        <div className='type-label'>
          {typeLabel}
        </div>
      }
    </div>
  );
}

const Segment = ({
  current,
  setCurrent,
  segmentIndex,
  maxSize,
}) => {
  const isFilled = current >= (segmentIndex+1)
  const filledClass = isFilled ? 'filled' : ''
  const setToOnClick = isFilled ? segmentIndex : segmentIndex + 1
  return (
    <button
      className={`Segment seg-${segmentIndex} ${filledClass}`}
      onClick={() => setCurrent(setToOnClick)}
    />
  );
}

const SetSizeButton = ({
  text,
  onClick,
  highlight = false,
  disabled = false,
}) => {
  const highlightClass = highlight ? 'highlight' : ''
  return (
    <button
      className={`SetSizeButton ${highlightClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div>{text}</div>
    </button>
  );
}


export default Clock ;
