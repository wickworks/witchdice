import React from 'react';
import './PercentileOption.scss';

const PercentileOption = ({
  percentileMode,
  setPercentileMode
}) => {

  return (
    <div className='PercentileOption'>
      <label>
        Roll d100?
        <input
          type='checkbox'
          checked={percentileMode}
          onChange={() => setPercentileMode(!percentileMode)}
        />
      </label>
    </div>
  )
}

export default PercentileOption;
