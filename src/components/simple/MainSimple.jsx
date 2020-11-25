import React from 'react';

const MainSimple = ({
  renderDiceBag,
  renderPartyPanel
}) => {

  return (
    <div className='MainSimple'>
      <div className='gameplay-container'>
        {renderDiceBag()}

        {renderPartyPanel()}
      </div>
    </div>
  )
}

export default MainSimple ;
