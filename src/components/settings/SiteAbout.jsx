import React from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';

import './SiteAbout.scss';

const SiteAbout = () => {

  return (
    <div className='SiteAbout'>
      <h3 className='no-top-border'>About</h3>
      <p>
        Hi! My name is <a href="https://wick.works/about/" target="_blank">Olive</a>.
        I wanted an online dice roller that fit
        my <a href="https://wick.itch.io/aesthetic" target="_blank" rel="noopener noreferrer">aesthetic</a> sensibilities,
        so I built this!
      </p>

      <h3>Contact</h3>
      <p>
        You can see current bugs and someday-features on
        this <a href="https://trello.com/b/e24TNiu1/witchdice" target="_blank" rel="noopener noreferrer">Trello board</a>.
        The change log is at the bottom of this page.
      </p>

      <p>
        If you find a bug or have an idea for a cool feature, please let me know in one of these places:
        <ul>
          <li>this google form</li>
          <li>on <a href="https://twitter.com/wickglyph" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          <li>at contact@wick.works</li>
        </ul>


      </p>
    </div>
  )
}

export default SiteAbout ;
