import React from 'react';
import './BondButton.scss';

const BondButton = ({
  onClick,
  isViewingBond,
}) => {

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond}>
        View Bond
      </button>
    </div>
  );
}

export default BondButton ;
