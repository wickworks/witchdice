import React, { useState } from 'react';
import './DiscordBotNotice.scss';

const SOURCE_LINK = 'https://github.com/wickworks/witchdice-discord-bot'
const INVITE_LINK = 'https://discord.com/api/oauth2/authorize?client_id=937850556272226374&permissions=67584&scope=bot%20applications.commands'

const DiscordBotNotice = ({
  partyRoom
}) => {


  const [instructionsVisible, setInstructionsVisible] = useState(false);
  return (
    <div className='DiscordBotNotice'>
      {!instructionsVisible ?
        <div className='intro-container'>
          <div className='new-attention'>
            New!
          </div>

          <button onClick={() => setInstructionsVisible(true)}>
            <div className='text'>
              See your rolls on
            </div>
            <div className='asset discord' />
          </button>
        </div>
      :
        <div className='instructions-container'>
          <button className='asset x' onClick={() => setInstructionsVisible(false)} />
          <div className='border'>
            <div className='asset discord' />
            <p>With the <a href={SOURCE_LINK} target="_blank" rel="noopener noreferrer">Witchdice bot</a>, your rolls can show up in a Discord channel!</p>
            <ol>
              <li><div>Join a Witchdice room, above. ⤴</div></li>
              <li><div>
                <a href={INVITE_LINK} target="_blank" rel="noopener noreferrer">Invite the bot to your server.</a>
              </div></li>
              <li><div>
                Subscribe a channel to your room by running the command:
              </div></li>
            </ol>
            <div className='code'>/join-room {partyRoom}</div>
          </div>

          <div className='border'>
            <p className='other-commands'>Other commands:</p>
            <div className='other-code'>
              <div className='code'>/leave-room</div>
              <div className='code'>/current-room</div>
            </div>
          </div>
        </div>
      }


    </div>


  );
}

export default DiscordBotNotice;
