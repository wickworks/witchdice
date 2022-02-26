import React, { useState } from 'react';

import './DestroySystemButton.scss';

const DestroySystemButton = ({
  onDestroy,
  isDestroyed
}) => {

  return (
    <button className='DestroySystemButton' onClick={onDestroy}>
      <div className={`asset ${isDestroyed ? 'repair' : 'x'}`} />
      <div className='hover-text'>
        <strong>{isDestroyed ? 'REPAIR' : 'DESTROY'}</strong>
      </div>
    </button>
  )
}

const BroadcastSystemButton = ({
  onBroadcast,
}) => {
  const [hasBeenBroadcast, setHasBeenBroadcast] = useState(false);

  return (
    <button
      className='BroadcastSystemButton'
      onClick={() => { setHasBeenBroadcast(true); onBroadcast(); }}
      disabled={hasBeenBroadcast}
    >
      <div className='asset sensor' />
      <div className='hover-text'>
        <strong>BROADCAST</strong>
      </div>
    </button>
  )
}

export { DestroySystemButton, BroadcastSystemButton };
