import React from 'react';

import './MechCentralDiamond.scss';

const MechCentralDiamond = ({
  activeMech,
  activePilot,
  frameData,

  currentCore,
  setCurrentCore,
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

          <div className='core-label core'>CORE</div>
          <div className='core-label power'>POWER</div>

          <button
            className={`core-power ${currentCore ? 'full' : 'empty'}`}
            onClick={() => setCurrentCore(!currentCore)}
          >
            <div className='asset core-power-full' />
            <div className='empty-box' />
          </button>
        </div>
      </div>
    </div>
  );
}



export default MechCentralDiamond;
