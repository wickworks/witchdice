import React from 'react';
import './PercentileOption.scss';

const PercentileOption = ({
  percentileMode,
  setPercentileMode
}) => {

  return (
    <div className='PercentileOption'>
      Roll d100?
      <input
        type="checkbox"
        checked={percentileMode}
        onChange={() => setPercentileMode(!percentileMode)}
      />
    </div>
  )
}

export default PercentileOption;
