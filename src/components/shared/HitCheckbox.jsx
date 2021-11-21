import React from 'react';

import './HitCheckbox.scss';

const HitCheckbox = ({
  isHit,
  handleHitClick,
  isCrit = false,
  isFumble = false,
  isSave = false,
}) => {

  const icon =
    isSave ?
      isHit ? 'fail' : 'save'
    :
      isHit ? 'hit' : 'miss'

  const disabled = isCrit || isFumble

  return (
    <label className={`HitCheckbox ${isHit ? 'hit' : 'miss'} ${disabled ? 'disabled' : ''}`}>
      <input
        name="hit"
        type="checkbox"
        checked={isHit}
        onChange={handleHitClick}
        disabled={disabled}
      />
      <div className={`asset ${icon}`} />
      <div className='hidden-text'>{icon}</div>
    </label>
  );
}

export default HitCheckbox;
