import React, { useState } from 'react';

import './MechSingleStat.scss';

const MechSingleStat = ({
  label,
  number,
  extraClass,
  leftToRight,
}) => {

  return (
    <div className={`MechSingleStat ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

      <div className='label'>
        {label}
      </div>

      <div className='number'>
        {number}
      </div>
    </div>
  );
}




export default MechSingleStat;
