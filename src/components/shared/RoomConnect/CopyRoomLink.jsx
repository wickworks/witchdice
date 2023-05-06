import React, { useState } from 'react';
import './CopyRoomLink.scss';

const CopyRoomLink = ({
  partyRoom,
  currentPage
}) => {
  const [showingCopiedMessage, setShowingCopiedMessage] = useState(false);

  const copyRoom = () => {
    const protocol = window.location.protocol.length > 1 ? `${window.location.protocol}//` : '';
    const hostname = window.location.hostname;
    const port = window.location.port.length > 1 ? `:${window.location.port}` : '';

    const roomUrl = `${protocol}${hostname}${port}/${currentPage}?r=${partyRoom}`;

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

	return (
    <div className='CopyRoomLink'>
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
	);
}



export default CopyRoomLink;
