import React from 'react';
import MechNumberBar from './MechNumberBar.jsx';

import './MechCentralDiamond.scss';

import {
  getMechMaxRepairCap,
} from './mechStateUtils.js';

const MechCentralDiamond = ({
  activeMech,
  activePilot,
  frameData,

  currentCore,
  setCurrentCore,

  currentStress,
  setCurrentStress,

  currentStructure,
  setCurrentStructure,

  currentRepairs,
  setCurrentRepairs,
}) => {

  const mechSize = frameData.stats.size === 0.5 ? 'size-half' : `size-${frameData.stats.size}`

  const repCap = getMechMaxRepairCap(activeMech, activePilot, frameData);
  const smallRepairsClass = repCap > 12 ? 'small-repairs' : '';

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
        { activeMech.cloud_portrait ?
          <img className='portrait' src={activeMech.cloud_portrait} alt={'mech portrait'} />
        :
          <div className={`portrait asset ${frameData.id}`} />
        }

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
              { [...Array(repCap)].map((undef, i) =>
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

          {repCap <= 12 &&
            <div className='size-container'>
              <div className={`mech-size asset ${mechSize}`} />
            </div>
          }

        </div>
      </div>
    </div>
  );
}



export default MechCentralDiamond;
