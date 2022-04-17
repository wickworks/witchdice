import React from 'react';
import TextInput from '../../shared/TextInput.jsx'
import './Ideals.scss';

const Ideals = ({
  bondData,
  minorIdeal,
  setMinorIdeal,
}) => {

  const randomizeMinorIdeal = () => {
    const currentIndex = bondData.minor_ideals.findIndex(ideal => ideal === minorIdeal)
    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % bondData.minor_ideals.length
      setMinorIdeal(bondData.minor_ideals[nextIndex])
    } else {
      setMinorIdeal(bondData.minor_ideals[0])
    }
  }

  return (
    <div className='Ideals'>
      <h4>
        Ideals
        <button onClick={randomizeMinorIdeal}>☈</button>
      </h4>
      <ul>
        {bondData.major_ideals.map((ideal,i) =>
          <li className='major-ideal' key={i}>
            {ideal}
          </li>
        )}

        <li className='minor-ideal'>
          <TextInput
            textValue={minorIdeal}
            setTextValue={setMinorIdeal}
            maxLength={256}
            placeholder='Select minor ideal.'
          />
        </li>
      </ul>
    </div>
  );
}

export default Ideals ;
