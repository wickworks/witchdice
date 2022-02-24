import React from 'react';
import './DeleteButton.scss';

const DeleteButton = ({
  handleClick,
  moreClasses = ''
}) => {
  return (
    <div
      className={`DeleteButton asset trash ${moreClasses || ''}`}
      onClick={handleClick}
    />
  );
}

const DeleteConfirmation = ({
  name = '',
  fullConfirmMessage = '', // optional override for the confirm message
  deleteWord = 'Delete',
  deleteIcon = 'trash',
  handleCancel,
  handleDelete,
  moreClasses = '',
}) => {
  return (
    <div className={`DeleteConfirmation ${moreClasses}`}>
      <div className='title-container'>
        <div className='delete-title'>
          {fullConfirmMessage ?
            fullConfirmMessage
          :
            `Delete ${name}?`
          }
        </div>
      </div>

      <div className='controls'>
        <button className='delete' onClick={handleDelete}>
          <div className={`asset ${deleteIcon}`} />
          <div className='label'>{deleteWord}</div>
        </button>
        <button className='cancel' onClick={handleCancel}>
          <div className='asset x' />
          <div className='label'>Cancel</div>
        </button>
      </div>
    </div>
  );
}

export { DeleteButton, DeleteConfirmation };
