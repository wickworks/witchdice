import React from 'react';
import MechNumberBar from './MechNumberBar.jsx';

import './MechCentralDiamond.scss';

const MechCentralDiamond = ({
  maxRepairCap,
  mechSize,
  mechPortraitCloud,
  mechPortraitDefault,

  currentStress,
  setCurrentStress,

  currentStructure,
  setCurrentStructure,

  currentRepairs,
  setCurrentRepairs,
}) => {

  const mechSizeClass = mechSize === 0.5 ? 'size-half' : `size-${mechSize}`

  const smallRepairsClass = maxRepairCap > 12 ? 'small-repairs' : '';

  function handleRepairClick(repairIndex) {
    if (repairIndex+1 <= currentRepairs) {
      setCurrentRepairs(currentRepairs-1)
    } else {
      setCurrentRepairs(currentRepairs+1)
    }
  }

  // <div className="MechCentralDiamond asset ssc-watermark">
  return (
    <div className="MechCentralDiamond">
      <div className='relative-container'>


        <div className='portrait-container'>
          { mechPortraitCloud ?
            <img className='portrait' src={mechPortraitCloud} alt={'mech portrait'} />
          :
            <div className={`portrait asset ${mechPortraitDefault}`} />
          }
        </div>

        <div className='buttons-container'>

          <MechNumberBar
            extraClass='condensed structure'
            dotIcon='structure'
            zeroIcon='x'
            maxNumber={4}
            currentNumber={currentStructure}
            setCurrentNumber={setCurrentStructure}
            leftToRight={true}
            showAbsoluteValues={true}
          />
          <div className='mini-label structure'>
            <span className='label'>Structure</span>
            <span className='number'>{currentStructure}</span>
          </div>

          <MechNumberBar
            extraClass='condensed stress'
            dotIcon='reactor'
            zeroIcon='x'
            maxNumber={4}
            currentNumber={currentStress}
            setCurrentNumber={setCurrentStress}
            leftToRight={true}
            showAbsoluteValues={true}
          />
          <div className='mini-label stress'>
            <span className='number'>{currentStress}</span>
            <span className='label'>Stress</span>
          </div>

          <div className='repairs-container-container'>
            <div className={`repairs-container ${smallRepairsClass}`}>
              { [...Array(maxRepairCap)].map((undef, i) =>
                <button
                  className={(i+1) <= currentRepairs ? 'available' : 'used'}
                  onClick={() => handleRepairClick(i)}
                  key={`repair-${i}`}
                >
                  <div className='asset repair' />
                </button>
              )}
            </div>
          </div>

          {maxRepairCap <= 12 &&
            <div className='size-container'>
              <div className={`mech-size asset ${mechSizeClass}`} />
            </div>
          }

        </div>
      </div>
    </div>
  );
}



export default MechCentralDiamond;
