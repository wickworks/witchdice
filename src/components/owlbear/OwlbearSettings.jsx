import React from 'react';
import CopyRoomLink from '../shared/RoomConnect/CopyRoomLink.jsx';


import './OwlbearSettings.scss';

const OwlbearSettings = ({
  notifyOnRoll,
  setNotifyOnRoll,
  allPageModes,
  skipPages,
  setSkipPages,
  partyRoom,
}) => {

  const toggleablePageModes = Object.keys(allPageModes)
    .filter(mode => allPageModes[mode].skippable)

  const togglePage = (mode) => {
    let newSkipPages = []
    if (skipPages.includes(mode)) {
      newSkipPages = skipPages.filter(e => e !== mode)
    } else {
      newSkipPages = [...skipPages, mode]
    }
    setSkipPages(newSkipPages)
  }

  return (
    <div className='OwlbearSettings'>

      {toggleablePageModes.map(mode =>
        <label className='skip-page' key={mode}>
          <input
            type='checkbox'
            checked={!skipPages.includes(mode)}
            onChange={() => togglePage(mode)}
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
