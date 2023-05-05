import React from 'react';
import { Route } from "react-router-dom";
import ModeChooser from './ModeChooser.jsx';

const Header = ({
  enabledPages
}) => {

  return (
    <div className='banner-and-chooser'>
      <Route path="/craft">
        <div className='witch-craft banner-container-container'>
          <a
            className='banner-container'
            href='http://astrolago.com/'
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className='asset witchcraft_banner' role="img" alt="Witch+Craft banner" />
          </a>
        </div>
      </Route>

      <Route path="/lancer">
        <div className='lancer banner-container-container'>
          <a
            className='banner-container'
            href='https://massif.netlify.app/lancer'
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className='asset lancer_banner' role="img" alt="Lancer banner" />
          </a>
        </div>
      </Route>

      <div className='witch-dice banner-container-container'>
        <div className='banner-container'>
          <div className='asset site_banner' role="img" alt="WITCH DICE"/>
        </div>
      </div>

      <ModeChooser enabledPages={enabledPages} />
    </div>
  );
}
export default Header;
