import React from 'react';
import './XCard.scss';

const XCard = ({
  handleXCardRaise,
}) => {

	return (
    <div className='XCard'>

      <a
        href='http://tinyurl.com/x-card-rpg'
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        ?
      </a>

      <div className='button-container'>
        <button className='touch' onClick={handleXCardRaise}>
          Raise
        </button>

        <div className='x-card'>
          x-card
        </div>
      </div>
    </div>
	);
}



export default XCard;
