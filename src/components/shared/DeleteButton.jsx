import React from 'react';
import './DeleteButton.scss';

const DeleteButton = ({
  handleClick,
  moreClasses
}) => {
  return (
    <div
      className={`DeleteButton asset trash ${moreClasses || ''}`}
      onClick={handleClick}
    />
  );
}

const DeleteConfirmation = ({
  name,
  handleCancel,
  handleDelete,
  moreClasses
}) => {
  return (
    <div className={`DeleteConfirmation ${moreClasses}`}>
      <div className='delete-title'>Delete '{name}'?</div>
      <button className='delete' onClick={handleDelete}>
        <div className='asset trash' />
        <div className='label'>Delete</div>
      </button>
      <button className='cancel' onClick={handleCancel}>
        <div className='asset x' />
        <div className='label'>cancel</div>
      </button>
    </div>
  );
}

export { DeleteButton, DeleteConfirmation };
