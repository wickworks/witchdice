import React, { useState } from 'react';
import './XCard.scss';

const XCard = ({
  handleXCardRaise,
  handleXCardTouch
}) => {
  const [isXCardAnonymous, setIsXCardAnonymous] = useState(false);

  const raiseXCard = () => {
    console.log('x card raised');
  }

  const touchXCard = () => {
    console.log('x card touched');
  }

	return (
    <div className='XCard'>

      <div className='controls'>
        <button className='touch' onClick={handleXCardRaise}>
          Touch
        </button>
        <button className='raise' onClick={handleXCardTouch}>
          Raise
        </button>

        <label className='anonymous'>
          <input
            type="checkbox"
            checked={isXCardAnonymous}
            onChange={() => setIsXCardAnonymous(!isXCardAnonymous)}
          />
          Anonymous
        </label>
      </div>

      <div className='decorative-x'>X Card</div>

    </div>
	);
}



export default XCard;
