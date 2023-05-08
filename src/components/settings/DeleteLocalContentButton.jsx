import React from 'react';
import './DeleteLocalContentButton.scss';

const DeleteLocalContentButton = () => {
  const onDeleteAllLocalData = () => {
    if (window.confirm(
      'This will delete all data that Witch Dice has saved locally to this browser, resetting it back to default settings. Are you sure you wish to continue?'
    )) {
      localStorage.clear();
      window.location.reload(false);
      window.location.replace("/");
    }
  }

  return (
    <button
      className='DeleteLocalContentButton'
      onClick={onDeleteAllLocalData}
    >
      Delete local data
    </button>
  )
}

export default DeleteLocalContentButton ;
