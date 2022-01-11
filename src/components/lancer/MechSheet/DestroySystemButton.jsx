import React from 'react';

import './DestroySystemButton.scss';

const DestroySystemButton = ({
  onDestroy,
  isDestroyed
}) => {

  return (
    <button className='DestroySystemButton' onClick={onDestroy}>
      <div className='hover-text'>
        <strong>{isDestroyed ? 'REPAIR' : 'DESTROY'}</strong>
      </div>
      <div className={`asset ${isDestroyed ? 'repair' : 'x'}`} />
    </button>
  )
}

export default DestroySystemButton;
