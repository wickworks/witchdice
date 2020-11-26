
import React from 'react';
// import './NumberInput.scss';

const NumberInput = ({
  value, setValue,

  minValue = 0,
  maxValue = 20,
  cycleValue = false,

  plusPrefix = false,
  prefix = '',
  suffix = '',
}) => {

  function handleClick(e, leftMouse) {
    let newValue = value;

    if (leftMouse && !e.shiftKey) {
      newValue += 1;
    } else {
      newValue -= 1;
      e.preventDefault()
    }

    if (cycleValue) {
      newValue = newValue % maxValue
    } else {
      newValue = Math.min(newValue, maxValue);
      newValue = Math.max(newValue, minValue);
    }

    setValue(newValue);
  }

  return (
    <div className="NumberInput">
      <div
        className='number unselectable'
        onClick={(e) => handleClick(e, true)}
        onContextMenu={(e) => handleClick(e, false)}
      >
        { prefix }
        { plusPrefix && (value >= 0) ? '+' : '' }
        { value }
        { suffix }
      </div>
    </div>
  );
}

export default NumberInput;
