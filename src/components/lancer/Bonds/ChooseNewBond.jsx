import React from 'react';
import { findAllGameDataFromLcp } from '../lancerData.js';
import './ChooseNewBond.scss';

function getIconForBond(bondId) {
  return 'plus'
}

const ChooseNewBond = ({
  setPilotBond,
}) => {
  const allBonds = findAllGameDataFromLcp('bonds')

  console.log('allBonds',allBonds);



  return (
    <div className='ChooseNewBond'>
      {Object.keys(allBonds).map(bondID =>
        <button
          className='select-bond'
          onClick={() => setPilotBond(bondID)}
        >
          <div className='bond-name'>{allBonds[bondID].name}</div>
          <div className={`asset ${getIconForBond(bondID)}`} />
        </button>
      )}
    </div>
  );
}

export default ChooseNewBond ;
