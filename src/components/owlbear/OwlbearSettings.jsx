import React from 'react';
import CopyRoomLink from '../shared/RoomConnect/CopyRoomLink.jsx';


import './OwlbearSettings.scss';

const OwlbearSettings = ({
  notifyOnRoll,
  setNotifyOnRoll,
  partyRoom,
}) => {

  return (
    <div className='OwlbearSettings'>

      <label className='notify-on-roll'>
        <input
          type="checkbox"
          checked={notifyOnRoll}
          onChange={() => setNotifyOnRoll(!notifyOnRoll)}
        />
        <div className='name'>Notification on rolls?</div>
      </label>


      <CopyRoomLink
        partyRoom={partyRoom}
        currentPage={'simple'}
      />
    </div>
  )
}

export default OwlbearSettings ;
