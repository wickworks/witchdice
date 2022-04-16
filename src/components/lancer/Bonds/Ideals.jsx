import React from 'react';
import './Ideals.scss';

const Ideals = ({
  activePilot,
  bondData,
}) => {

  return (
    <div className='Ideals'>
      <h4>Ideals</h4>
      <ul>
        {bondData.major_ideals.map((ideal,i) =>
          <li className='major-ideal' key={i}>
            {ideal}
          </li>
        )}

        <li className='minor-ideal'>
          {activePilot.minorIdeal ? activePilot.minorIdeal : '[ Minor ideal ]'}
          {/*<input type='text' placeholder='Select a minor ideal' />*/}
        </li>
      </ul>
    </div>
  );
}

export default Ideals ;
