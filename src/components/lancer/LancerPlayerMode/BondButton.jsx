import React from 'react';
import { findBondData } from '../lancerData.js';
import './BondButton.scss';


const BondButton = ({
  onClick,
  isViewingBond,
  bondID,
}) => {
  const bondData = findBondData(bondID)
  const hasBond = !!bondID;
  // const needToReuploadLcp = hasBond && (bondData.id === 'bond-unknown');

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond}>
        { !hasBond ?
          <span className='no-bond'>Bondless</span>
        :
          bondData.name
        }
      </button>
    </div>
  );
}

export default BondButton ;
