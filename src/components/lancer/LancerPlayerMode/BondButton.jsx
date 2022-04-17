import React from 'react';
import { findBondData } from '../lancerData.js';
import './BondButton.scss';


const BondButton = ({
  onClick,
  isViewingBond,
  bondID,
}) => {
  const bondData = findBondData(bondID)
  const needToReuploadLcp = bondData.id === 'bond-unknown';
  const hasBond = !!bondData.id;

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond || needToReuploadLcp}>
        { needToReuploadLcp ?
          <span className='no-bond'>Please reupload the KTB lcp, then refresh.</span>
        : !hasBond ?
          <span className='no-bond'>Bondless</span>
        :
          bondData.name
        }
      </button>
    </div>
  );
}

export default BondButton ;
