import React, { useState } from 'react';
import SetSizeButton from './SetSizeButton.jsx'
import TextInput from '../../shared/TextInput.jsx'
import './Clock.scss';

export const blankClock = {
  id: '',
  title: '',
  description: '',
  resolution: '',
  segments: 8,
  progress: 0,
}

const Clock = ({
  progress = 0,
  setProgress,
  maxSegments = 6,
  setMaxSegments, // also needs to handle setting progress if it's invalid
  onReset,
  onFinish,
  typeLabel,
  userLabel,
  setUserLabel,
  inputEnabled = false,
}) => {
  const [isEditingMaxSize, setIsEditingMaxSize] = useState(false)

  const isDisabled = (inputEnabled && !userLabel)
  const canSetMaxSegments = !!setMaxSegments

  return (
    <div className='Clock'>
      {!isDisabled &&
        <div className={`controls-container ${isDisabled ? 'disabled' : ''}`}>

          {isEditingMaxSize ?
            <>
              <SetSizeButton text={4} onClick={() => setMaxSegments(4)} highlight={maxSegments === 4} key={4}/>
              <SetSizeButton text={6} onClick={() => setMaxSegments(6)} highlight={maxSegments === 6} key={6}/>
              <SetSizeButton text={8} onClick={() => setMaxSegments(8)} highlight={maxSegments === 8} key={8}/>
              <SetSizeButton text={10} onClick={() => setMaxSegments(10)} highlight={maxSegments === 10} key={410}/>
            </>
          : !isDisabled &&
            <>
              <SetSizeButton text={'-'} highlight={true} onClick={() => setProgress(Math.max(progress-1, 0))} key='-' />
              <SetSizeButton text={'+'} highlight={true} onClick={() => setProgress(Math.min(progress+1, maxSegments))} key='+' />
              {(!!onReset && progress > 0) ? <SetSizeButton text={'⟲'} highlight={true} onClick={onReset} key='reset' /> : <div />}
              {!!onFinish && <SetSizeButton text={'✓'} highlight={true} onClick={onFinish} key='checkmark' />}
            </>
          }

          <div className={`segments-container max-size-${maxSegments}`}>

            {[...Array(maxSegments)].map((_, i) =>
              <Segment
                progress={progress}
                segmentIndex={i}
                setProgress={setProgress}
                maxSegments={maxSegments}
                key={i}
              />
            )}

          </div>

          <button
            className='center-peg'
            onClick={() => setIsEditingMaxSize(!isEditingMaxSize)}
            disabled={!canSetMaxSegments}
          >
            {isEditingMaxSize ?
              <div className='asset edit' />
            :
              <div className={`number ${isEditingMaxSize ? 'hidden' : ''}`}>{progress}</div>
            }
            <div className={`hover-only asset ${isEditingMaxSize ? 'checkmark' : 'edit'}`} />
          </button>

        </div>
      }

      {inputEnabled ?
        <div className='user-label-container'>
          <TextInput
            textValue={userLabel}
            setTextValue={setUserLabel}
            placeholder={typeLabel}
            maxLength={32}
          />
        </div>
      :
        <div className='type-label'>
          {typeLabel}
        </div>
      }
    </div>
  );
}

const Segment = ({
  progress,
  setProgress,
  segmentIndex,
  maxSegments,
}) => {
  const isFilled = progress >= (segmentIndex+1)
  const filledClass = isFilled ? 'filled' : ''
  const setToOnClick = isFilled ? segmentIndex : segmentIndex + 1
  return (
    <button
      className={`Segment seg-${segmentIndex} ${filledClass}`}
      onClick={() => setProgress(setToOnClick)}
    />
  );
}

export default Clock ;
