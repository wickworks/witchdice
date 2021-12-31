import React from 'react';
import Scrollspy from 'react-scrollspy';
import { capitalize } from '../../utils.js';

import './JumplinkPanel.scss';


const JumplinkPanel = ({
  partyConnected
}) => {

  let jumplinks = ['pilot','mech','weapons','dicebag']
  if (partyConnected) jumplinks.splice(-1, 0, 'squad')

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
            <a href={`#${link}`}>{capitalize(link)}</a>
          )}
        </Scrollspy>
      </div>
    </div>
  );
}




export default JumplinkPanel;
