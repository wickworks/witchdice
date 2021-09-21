import React from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';

import './SiteAbout.scss';

const SiteAbout = () => {

  return (
    <div className='SiteAbout'>
      <h2 className='no-top-border'>About</h2>

      <div className='settings-section'>
        <p>
          Hi! My name is <a href="https://wick.works/about/" target="_blank">Olive</a>.
          I wanted an online dice roller that fit
          my <a href="https://wick.itch.io/aesthetic" target="_blank" rel="noopener noreferrer">aesthetic</a> sensibilities,
          so I built this!
        </p>
      </div>

      <h3>Contact</h3>
      <div className='settings-section'>
        <p>
          You can see current bugs and someday-features on
          this <a href="https://trello.com/b/e24TNiu1/witchdice" target="_blank" rel="noopener noreferrer">Trello board</a>.
          Account-holders can vote on items.
        </p>

        <p>
          If you find a bug or have an idea for a cool feature, please let me know in one of these places!
          <ul>
            <li>
              this <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScs5LFyqCURtVjQDzrscMZhWXC45xZl4sUdLLMig0QQ3fO5GA/viewform?usp=sf_link"
                target="_blank" rel="noopener noreferrer">
              google form</a>
            </li>
            <li>on <a href="https://twitter.com/wickglyph" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li>at contact@wick.works</li>
          </ul>
          <em>(also, compliments are welcome. If you like this, please be loud! I have social anxiety and little SEO savvy)</em>
        </p>
      </div>
    </div>
  )
}

export default SiteAbout ;
