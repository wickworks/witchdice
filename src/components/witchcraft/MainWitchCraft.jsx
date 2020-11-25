import React from 'react';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {

  return (
    <div className='MainWitchCraft'>
      WITCH + CRAFT

      <div className='gameplay-container'>
        {renderDiceBag()}

        {renderPartyPanel()}
      </div>
    </div>
  )
}

export default MainWitchCraft ;
