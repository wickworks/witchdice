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

export default DeleteButton;
