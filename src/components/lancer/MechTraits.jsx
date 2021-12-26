import React from 'react';

import './MechTraits.scss';

const MechTraits = ({
	traitList,
}) => {
  return (
		<div className='MechTraits'>
    	<div className='traits-container'>
				{ traitList.map((trait, i) => {
					return (
						<div className='trait'>
							<div className='name'>{trait.name}</div>
							<div className='description'>{trait.description}</div>
						</div>
					)
				})}
			</div>
    </div>
  );
}




export default MechTraits;
