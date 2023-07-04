import React, { useState } from 'react';
import { randomWords } from '../../random_words.js';
import { Link } from "react-router-dom";

import './ProblemsBar.scss';

function generateOwlbearRoomName() {
  return `owlbear-${randomWords(1)}-${randomWords({exactly: 1, maxLength: 6})}-${randomWords({exactly: 1, maxLength: 4})}`
}


const ProblemsBar = ({
  obrReady,
  partyRoom,
  onJoinRoom,
  reloadExtension,
  requestUserRefresh,
}) => {

  const [tempRoomName, setTempRoomName] = useState(partyRoom || generateOwlbearRoomName());

  return (
    <div className='ProblemsBar'>
      { !obrReady ?
        <p> Looks like there was a problem loading the extension. Try refreshing the page. </p>

      : requestUserRefresh ?
        <p> Somebody changed the connected Witchdice room. Please refresh the page. </p>

      : !partyRoom &&
        <div className='empty-room'>
          <div className='party-room-container'>
            <input type='text' id='party-room' value={tempRoomName} onChange={(e) => setTempRoomName(e.target.value)}/>
            <button
              className='generate-new-room'
              onClick={() => setTempRoomName(generateOwlbearRoomName())}
            >
              ☈
            </button>
          </div>

          <Link
            className='party-connect'
            to={`/owlbear?r=${tempRoomName}`}
            onClick={() => onJoinRoom(tempRoomName)}
          >
            Set Witchdice Room
          </Link>

          <p>
            Players will automatically join this Witchdice room.
            Rolls will be synced across this extension and at witchdice.com
          </p>
        </div>
      }

    </div>
  )
}

export default ProblemsBar ;
