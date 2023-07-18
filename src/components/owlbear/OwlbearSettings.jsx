import React from 'react';
import CopyRoomLink from '../shared/RoomConnect/CopyRoomLink.jsx';
import DeleteLocalContentButton from "../settings/DeleteLocalContentButton.jsx";

import './OwlbearSettings.scss';

const OwlbearSettings = ({
  notifyOnRoll,
  setNotifyOnRoll,
  allPageModes,
  skipPages,
  toggleSkipPage,
  partyRoom,
  onLeaveRoom,
}) => {

  const toggleablePageModes = Object.keys(allPageModes)
    .filter(mode => allPageModes[mode].skippable)

  return (
    <div className='OwlbearSettings'>

      {!window.localStorageEnabled &&
        <div className='localstorage-warning'>
          <h2>Warning: localStorage is not enabled!</h2>
          <p>
            Witchdice's advanced features require access to
            localStorage. <a href='https://support.atlassian.com/trello/docs/enabling-localstorage/' target="_blank" rel="noopener noreferrer">Read
            this guide</a> to enable localStorage for specific sites in Chrome incognito windows.
          </p>
        </div>
      }

      <div className='toggles-container'>
        {window.localStorageEnabled && toggleablePageModes.map(mode =>
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
      </div>

      { partyRoom ?
        <>
          <CopyRoomLink
            partyRoom={partyRoom}
            currentPage={'simple'}
          />
          <button className='leave-room' onClick={onLeaveRoom}>
            Leave Room
          </button>
        </>
      :
        <p className='no-room-warning'>
          No room detected. Please join a room, reload the page, or
          tell olive@wick.works that something is broken!
        </p>
      }



      {window.localStorageEnabled && <DeleteLocalContentButton />}

    </div>
  )
}

export default OwlbearSettings ;
