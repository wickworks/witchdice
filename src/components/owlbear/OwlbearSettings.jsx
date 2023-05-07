import React from 'react';
import CopyRoomLink from '../shared/RoomConnect/CopyRoomLink.jsx';


import './OwlbearSettings.scss';

const OwlbearSettings = ({
  notifyOnRoll,
  setNotifyOnRoll,
  allPageModes,
  skipPages,
  toggleSkipPage,
  partyRoom,
}) => {

  const toggleablePageModes = Object.keys(allPageModes)
    .filter(mode => allPageModes[mode].skippable)

  return (
    <div className='OwlbearSettings'>

      {toggleablePageModes.map(mode =>
        <label className='skip-page' key={mode}>
          <input
            type='checkbox'
            checked={!skipPages.includes(mode)}
            onChange={() => toggleSkipPage(mode)}
          />
          <div className={`asset ${allPageModes[mode].icon}`} />
          <div className='title'>{allPageModes[mode].label}</div>
        </label>
      )}

      <label className='notify-on-roll'>
        <input
          type="checkbox"
          checked={notifyOnRoll}
          onChange={() => setNotifyOnRoll(!notifyOnRoll)}
        />
        <div className={`asset dicebag`} />
        <div className='name'>Notification on rolls</div>
      </label>

      <CopyRoomLink
        partyRoom={partyRoom}
        currentPage={'simple'}
      />
    </div>
  )
}

export default OwlbearSettings ;
