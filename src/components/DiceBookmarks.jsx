import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import {
  blankDice,
  getToRollString,
} from './DiceBagData.js';
import './DiceBookmarks.scss';

const DiceBookmarks = ({
  currentDice,
  summaryMode,
  percentileMode,
  setCurrentDice,
  setSummaryMode,
  setPercentileMode,
}) => {
  const [allBookmarkData, setAllBookmarkData] = useState([]);

  const addNewBookmark = () => {
    let bookmarkData = deepCopy(currentDice)
    bookmarkData.summaryMode = summaryMode
    bookmarkData.percentileMode = percentileMode

    console.log('adding bookmark', bookmarkData);
    let newData = deepCopy(allBookmarkData)
    newData.push(bookmarkData)
    setAllBookmarkData(newData)
  }

  const deleteBookmark = (index) => {
    let newData = deepCopy(allBookmarkData)
    newData.splice(index, 1)
    setAllBookmarkData(newData)
  }

  // what is the highest type of die we're queueing up to roll?
  let hasSomethingQueued = false;
  Object.keys(currentDice).forEach((dieType) => {
    if (currentDice[dieType] > 0 && dieType !== 'plus') hasSomethingQueued = true
  });

  return (
    <div className="DiceBookmarks">

      { allBookmarkData.map((bookmarkData, i) => {
        return (
          <Bookmark
            bookmarkData={bookmarkData}
            setCurrentDice={setCurrentDice}
            setSummaryMode={setSummaryMode}
            setPercentileMode={setPercentileMode}
            handleDelete={() => deleteBookmark(i)}
            key={`bookmark-${i}-${allBookmarkData.length}`}
          />
        )
      })}

      { allBookmarkData.length < 8 &&
        <button
          className='Bookmark new'
          onClick={addNewBookmark}
          disabled={!hasSomethingQueued}
        >
          <span className='hover-string'>
            { hasSomethingQueued ?
              `Save ${getToRollString(currentDice, summaryMode, percentileMode)}`
            :
              'Save roll'
            }
          </span>
          <span className='tucked-string'>
            +
          </span>
        </button>
      }
    </div>
  );
}

const Bookmark = ({
  bookmarkData,
  setCurrentDice,
  setSummaryMode,
  setPercentileMode,
  handleDelete,
}) => {

  const handleClick = (e, leftMouse) => {

    // load roll
    if (leftMouse && !e.shiftKey) {
      let diceData = deepCopy(bookmarkData)
      const summaryMode = diceData.summaryMode
      const percentileMode = diceData.percentileMode
      delete diceData.summaryMode
      delete diceData.percentileMode

      console.log('restoring ', summaryMode, percentileMode);

      setSummaryMode(summaryMode)
      setPercentileMode(percentileMode)
      setCurrentDice(diceData)

    // delete bookmark
    } else {
      handleDelete()
      e.preventDefault()
    }
  }

  return (
    <button
      className="Bookmark"
      onClick={(e) => handleClick(e, true)}
      onContextMenu={(e) => handleClick(e, false)}
    >
      {bookmarkData.summaryMode === 'high' ?
        'Max '
      : bookmarkData.summaryMode === 'low' &&
        'Min '
      }
      {getToRollString(
        bookmarkData,
        bookmarkData.summaryMode,
        bookmarkData.percentileMode
      )}
    </button>
  );
}



export default DiceBookmarks;
