import React from 'react';
import ReactDOM from 'react-dom';
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

const XCardModal = ({
  raisedBy,
  handleClose,
}) => {

	return ReactDOM.createPortal(
    <aside
      className='XCardModal'
      aria-modal='true'
      aria-labelledby='whodunnit'
      role='alertdialogue'
      tabIndex='-1'
      onClick={handleClose}
      onKeyDown={e => { if (e.keyCode === 27) handleClose() }}
    >
      <div className='popup' onClick={e => e.stopPropagation()}>
        <div className='whodunnit' id='whodunnit'>X card raised by {raisedBy}</div>

        <button aria-label="Close" onClick={handleClose}>
          OK
        </button>
      </div>
    </aside>,
    document.body
  );
}



export { XCard, XCardModal };
