import React from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';

import './MainOptions.scss';

import imageTotalHighLow from './total_high_low.png';
import imageNegativeDice from './negative_dice.png';
import imageRoll100 from './roll_100.png';

const MainOptions = () => {

  return (
    <div className='MainOptions'>
      <h2>Dicebag Tips & Tricks</h2>
      <div className='tips-container'>
        <div className='tip'>
          <img srcset={`${imageNegativeDice} 2x`} />

          <p>Right-click (or long-tap) to get negative dice. These will be
          subtracted from the total, e.g. <span className='dice'>1d20 - 1d6</span></p>

          <p>After clicking a die, you can press 1-9 on your keyboard as a shortcut. Backspace clears it.</p>
        </div>

        <NouveauDivider />

        <div className='tip'>
          <img srcset={`${imageTotalHighLow} 2x`} />
          <p>
            When in <span className='mode'>High</span> or <span className='mode'>Low</span> mode,
            only the highest or lowest die of each type will be added to the total.
          </p>

          <p>
            For example, to roll with disadvantage while <span className='hashtag'>#</span>blessed:
            <br />— Switch to <span className='mode'>Low</span> mode
            <br />— Queue up <span className='dice'>2d20</span> and <span className='dice'>1d4</span>
          </p>

          <p>This should give you <span className='dice'>Min( 2d20 ) + 1d4</span></p>
        </div>

        <NouveauDivider />

        <div className='tip'>
          <img srcset={`${imageRoll100} 2x`} />
          <p>You can roll 1d100 by queuing up 2d10 & checking the box.</p>
        </div>
      </div>
    </div>
  )
}

export default MainOptions ;
