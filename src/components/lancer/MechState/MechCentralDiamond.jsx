import React from 'react';
import MechNumberBar from './MechNumberBar.jsx';

import './MechCentralDiamond.scss';

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
}) => {

  const mechSize = frameData.stats.size === 0.5 ? 'size-half' : `size-${frameData.stats.size}`
  // <div className="MechCentralDiamond asset ssc-watermark">

  return (
    <div className="MechCentralDiamond">
      <div className='relative-container'>
        { activeMech.cloud_portrait &&
          <img className='portrait' src={activeMech.cloud_portrait} alt={'mech portrait'} />
        }

        <div className='buttons-container'>

          <MechNumberBar
            extraClass='condensed structure'
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
            <div className='repairs-container'>
              { [...Array(frameData.stats.repcap)].map((undef, i) =>
                <button key={`repair-${i}`}>
                  <div className='asset repair' />
                </button>
              )}
            </div>
          </div>

          <div className='size-container'>
            <div className={`mech-size asset ${mechSize}`} />
          </div>

        </div>
      </div>
    </div>
  );
}



export default MechCentralDiamond;
