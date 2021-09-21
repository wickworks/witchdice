import React, {useState} from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import DieButton from '../shared/DiceBag/DieButton';
import SummaryModeSwitcher from '../shared/DiceBag/SummaryModeSwitcher';
import PercentileOption from '../shared/DiceBag/PercentileOption';

import './TipsAndTricks.scss';

const TipsAndTricks = () => {

  const [dummyDieCount, setDummyDieCount] = useState(-2);
  const [dummySummaryMode, setDummySummaryMode] = useState('total');
  const [dummyPercentileMode, setDummyPercentileMode] = useState(false);

  const highClass = dummySummaryMode === 'high' ? 'mode selected' : 'mode';
  const lowClass = dummySummaryMode === 'low' ? 'mode selected' : 'mode';

  return (
    <div className='TipsAndTricks'>
      <h2>Dicebag Tips & Tricks</h2>
      <div className='tips-container'>
        <div className='tip'>
          <div className='interactable-widget'>
            <DieButton
              dieType={'6'}
              dieCount={dummyDieCount}
              setDieCount={setDummyDieCount}
            />
          </div>

          <p>
            <RightClickLongTap /> to get negative dice. These will be subtracted
            from the total, e.g. <span className='dice'>1d20 - 2d6</span>
          </p>

          <p>After clicking a die, you can press 1-9 on your keyboard as a shortcut. Backspace clears it.</p>
        </div>

        <NouveauDivider />

        <div className='tip'>
          <div className='interactable-widget'>
            <SummaryModeSwitcher
              summaryMode={dummySummaryMode}
              setSummaryMode={setDummySummaryMode}
            />
          </div>

          <p>
            When in <span className={highClass}>High</span> or <span className={lowClass}>Low</span> mode,
            only the highest or lowest die of each type will be added to the total.
          </p>

          <p>
            For example, to roll with disadvantage while <span className='hashtag'>#</span>blessed:
            <br />— Switch to <span className={lowClass}>Low</span> mode
            <br />— Queue up <span className='dice'>2d20</span> and <span className='dice'>1d4</span>
          </p>

          <p>This should give you <span className='dice'>Min( 2d20 ) + 1d4</span></p>
        </div>

        <NouveauDivider />

        <div className='tip'>
          <div className='interactable-widget'>
            <PercentileOption
              percentileMode={dummyPercentileMode}
              setPercentileMode={setDummyPercentileMode}
            />
          </div>
          <div className='text-and-image'>
            <p>You can roll <span className='dice'>1d100</span> by queuing up <span className='dice'>2d10</span> & checking the box that appears.</p>
            <div className={`asset ${dummyPercentileMode ? 'd100' : 'd10'}`} />
          </div>
        </div>

        <NouveauDivider />

        <div className='tip'>
          <div className='interactable-widget'>
            <PercentileOption
              percentileMode={dummyPercentileMode}
              setPercentileMode={setDummyPercentileMode}
            />
          </div>
          <p>Click "Add bookmark" while dice are queued to save that roll.</p>
          <p><RightClickLongTap /> an existing bookmark to delete it.</p>
        </div>
      </div>
    </div>
  )
}

// Inline control indicator: right-click for desktop, long-tap for mobile.
const RightClickLongTap = () => {
  return (
    <>
      <span className='desktop-only'>Right-click</span>
      <span className='mobile-only'>Long-tap</span>
    </>
  )
}

export default TipsAndTricks;
