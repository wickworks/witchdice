import React from 'react';
import Scrollspy from 'react-scrollspy';
import { capitalize } from '../../utils.js';

import './JumplinkPanel.scss';


const JumplinkPanel = ({
  partyConnected,
  jumplinks,
  onClickJumplink = () => {},
}) => {

  return (
    <div className='JumplinkPanel'>
      <div className='jumplinks'>

        <Scrollspy
          items={jumplinks}
          currentClassName="current"
          componentTag='div'
          className='link-container'
        >
          {jumplinks.map(link =>
            <a href={`#${link}`} onClick={() => onClickJumplink(link)} key={link}>
              {capitalize(link)}
            </a>
          )}
        </Scrollspy>
      </div>
    </div>
  );
}




export default JumplinkPanel;
