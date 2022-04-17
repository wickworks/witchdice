import React from 'react';
import { findAllGameDataFromLcp } from '../lancerData.js';
import './ChooseNewBond.scss';

function getIconForBond(bondId) {
  return 'plus'
}

const ChooseNewBond = ({
  currentBondId,
  setPilotBond,
}) => {
  const allBonds = findAllGameDataFromLcp('bonds')

  return (
    <div className='ChooseNewBond'>
      {Object.keys(allBonds).map(bondId =>
        <button
          className={`select-bond ${currentBondId === bondId ? 'selected' : ''}`}
          onClick={() => setPilotBond(bondId)}
        >
          <div className='bond-name'>{allBonds[bondId].name}</div>
          <div className={`asset ${bondId in allBonds ? bondId : 'card'}`} />
        </button>
      )}
    </div>
  );
}

export default ChooseNewBond ;
