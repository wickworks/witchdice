import React, { useState } from 'react';
import { Link } from "react-router-dom";
import TextInput from '../TextInput.jsx';
import './RoomConnect.scss';

const RoomConnect = ({
  partyRoom, setPartyRoom,
  partyName, setPartyName,
  generateRoomName,
  partyConnected, connectToRoom,
  rollMode
}) => {
  const [showingCopiedMessage, setShowingCopiedMessage] = useState(false);

  const updatePartyRoom = (value) => {
    const filtered = value.replace(/[^A-Za-z-]/ig, '')
    setPartyRoom(filtered)
  }

  const updatePartyName = (value) => {
    const filtered = value.replace(/[^A-Za-z -]/ig, '')
    setPartyName(filtered)
  }

  const copyRoom = () => {
    const protocol = window.location.protocol.length > 1 ? `${window.location.protocol}//` : '';
    const hostname = window.location.hostname;
    const port = window.location.port.length > 1 ? `:${window.location.port}` : '';

    const roomUrl = `${protocol}${hostname}${port}/${rollMode}?r=${partyRoom}`;

    const el = document.createElement('textarea');
    el.value = roomUrl
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    console.log('copied room url', roomUrl);

    setShowingCopiedMessage(true);

    setTimeout(function(){
      setShowingCopiedMessage(false);
    }, 2000);
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
              to={`/${rollMode}?r=${partyRoom}`}
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
            <label>Room:</label>

            { showingCopiedMessage ?
              <div className='copied-message'>Copied url!</div>
            :
              <button className='copy-on-click' onClick={copyRoom}>
                <span className='name'>{partyRoom}</span>
                <span className='copy-symbol'>⧉</span>
              </button>
            }
          </div>
        </>
      }
    </div>
	);
}



export default RoomConnect;
