import React from 'react';
import { Link } from "react-router-dom";
import TextInput from '../TextInput.jsx';
import CopyRoomLink from './CopyRoomLink.jsx';
import './RoomConnect.scss';

const RoomConnect = ({
  partyRoom, setPartyRoom,
  partyName, setPartyName,
  generateRoomName,
  partyConnected, connectToRoom,
  currentPage
}) => {
  const updatePartyRoom = (value) => {
    const filtered = value.replace(/[^A-Za-z0-9-]/ig, '')
    setPartyRoom(filtered)
  }

  const updatePartyName = (value) => {
    const filtered = value.replace(/[^A-Za-z0-9 -]/ig, '')
    setPartyName(filtered)
  }

  const connectDisabled = (partyRoom.length <= 6 || partyName.length <= 0);

	return (
    <div className={`RoomConnect ${partyConnected ? 'connected' : 'disconnected'}`}>
      { (!partyConnected) ?
        <>

          <div className='party-name-container disconnected'>
            <label htmlFor='party-name'>Name</label>
            <input type='text' id='party-name' value={partyName} onChange={(e) => updatePartyName(e.target.value)} />
          </div>

          <div className='party-room-container disconnected'>
            <label htmlFor='party-room'>Room</label>
            <input type='text' id='party-room' value={partyRoom} onChange={(e) => updatePartyRoom(e.target.value)}/>
            <button
              className='generate-new-room'
              onClick={generateRoomName}
            >
              ☈
            </button>
          </div>

          { connectDisabled ?
            <span className='party-connect disabled'>Join Room</span>
          :
            <Link
              className='party-connect'
              to={`/${currentPage}?r=${partyRoom}`}
              onClick={() => connectToRoom(partyRoom)}
            >
              Join Room
            </Link>
          }


        </>
      :
        <>
          <div className='party-name-container connected'>
            <label>Name:</label>
            <TextInput
              textValue={partyName}
              setTextValue={setPartyName}
              placeholder='Name'
              maxLength={50}
            />
          </div>

          <div className='party-room-container connected'>
            <CopyRoomLink
              partyRoom={partyRoom}
              currentPage={currentPage}
            />
          </div>

          <a
            className='party-connect'
            href={`/${currentPage}`}
          >
            Leave Room
          </a>
        </>
      }
    </div>
	);
}



export default RoomConnect;
