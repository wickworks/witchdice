import React, {useState} from 'react';
import DieButton from '../shared/DiceBag/DieButton';
import SummaryModeSwitcher from '../shared/DiceBag/SummaryModeSwitcher';
import SummaryModeDescription from '../shared/DiceBag/SummaryModeDescription';
import {Bookmark, BookmarkNew} from '../shared/DiceBag/Bookmark';

import './TipsAndTricks.scss';

const TipsAndTricks = ({
  abbreviated = false
}) => {

  const [dummyDieCount, setDummyDieCount] = useState(-2);
  const [dummySummaryMode, setDummySummaryMode] = useState('total');
  const [dummySummaryModeValue, setDummySummaryModeValue] = useState(1);
  const [dummyBookmarkSaved, setDummyBookmarkSaved] = useState(false);

  const highClass = dummySummaryMode === 'highest' ? 'mode selected' : 'mode';
  const lowClass = dummySummaryMode === 'lowest' ? 'mode selected' : 'mode';
  const countClass = dummySummaryMode === 'count' ? 'mode selected' : 'mode';

  const fakeBookmarkData = {4: 0, 6: 4, 8: 0, 10: 0, 12: 0, 20: 1, plus: 0, x: 0, summaryMode: 'total', summaryModeValue: 1}
  const fakeRollDescription = '1d20 + 4d6'

  return (
    <div className='TipsAndTricks'>

      <div className='tips-panel'>
        {!abbreviated &&
          <h2>Dicebag Tips & Tricks</h2>
        }

        <div className='tips-container'>

          {!abbreviated &&
            <h3>Negative dice</h3>
          }
          <div className='tip'>
            <div className='interactable-widget'>
              <DieButton
                dieType={'6'}
                dieCount={dummyDieCount}
                setDieCount={setDummyDieCount}
              />
            </div>
            <p>
              <RightClickLongTap click={abbreviated} /> to get negative dice. These will be subtracted
              from the total, e.g. <em>1d20 - 2d6</em>
            </p>
            <p className='desktop-only'>After clicking a die, you can press 1-9 on your keyboard as a shortcut. Backspace clears it.</p>
          </div>

          {!abbreviated &&
            <h3>Min and max</h3>
          }

          <div className='interactable-widget'>
            <SummaryModeSwitcher
              summaryMode={dummySummaryMode}
              setSummaryMode={setDummySummaryMode}
            />
            <SummaryModeDescription
              summaryMode={dummySummaryMode}
              summaryModeValue={dummySummaryModeValue}
              setSummaryModeValue={setDummySummaryModeValue}
            />
          </div>
          <div className='tip'>
            <p>
              When in <span className={highClass}>High</span> or <span className={lowClass}>Low</span> mode,
              only the highest or
              lowest <em>{dummySummaryModeValue > 1 ? `${dummySummaryModeValue} dice` : `die`}</em> of <em>each type</em> will
              be added to the total.
            </p>

            {!abbreviated && <>
              <p>
                For example, to roll with disadvantage while <span className='hashtag'>#</span>blessed:
                <br />— Switch to <span className={lowClass}>Low</span> mode
                <br />— Queue up <em>2d20</em> and <em>1d4</em>
              </p>
              <p>This should give you <em>Min( 2d20 ) + 1d4</em></p>
            </>}

            <p>
              When in <span className={countClass}>Count</span> mode, it will tell
              you the <em>number</em> of dice that
              rolled at or above <em>{dummySummaryModeValue}</em>.
            </p>
          </div>

          {!abbreviated && <>
            <h3>Bookmarks</h3>
            <div className='tip'>
              <div className='interactable-widget bookmarks'>
                { dummyBookmarkSaved ?
                  <Bookmark
                    bookmarkData={fakeBookmarkData}
                    setCurrentDice={() => {}}
                    setSummaryMode={() => {}}
                    handleDelete={() => setDummyBookmarkSaved(false)}
                    isSelected={false}
                  />
                :
                  <BookmarkNew
                    addNewBookmark={() => setDummyBookmarkSaved(true)}
                    addBookmarkEnabled={true}
                    allBookmarkDataLength={1}
                    rollDescription={fakeRollDescription}
                  />
                }
                <div className='desktop-fake-panel' />
              </div>
              <p>Click <AddPlusBookmark /> while dice are queued to save that roll.</p>
              <p><RightClickLongTap click={abbreviated} /> an existing bookmark to delete it.</p>
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}

// Inline control indicator: right-click for desktop, long-tap for mobile.
const RightClickLongTap = ({click = false}) => {
  return (
    click ?
      <span>Right-click</span>
    :
      <>
        <span className='desktop-only'>Right-click</span>
        <span className='mobile-only'>Long-tap</span>
      </>
  )
}

const AddPlusBookmark = () => {
  return (
    <>
      <span className='desktop-only'>"+ Bookmark"</span>
      <span className='mobile-only'>"Add Bookmark"</span>
    </>
  )
}

export default TipsAndTricks;
