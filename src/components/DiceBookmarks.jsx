import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import {
  diceDataIntoToRollData,
  getRollDescription,
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

  // load up all the bookmarks from localstorage
  useEffect(() => {
    const loadedBookmarks = localStorage.getItem("dice-bookmarks");
    if (loadedBookmarks) {
      setAllBookmarkData(JSON.parse(loadedBookmarks))
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const addNewBookmark = () => {
    let bookmarkData = deepCopy(currentDice)
    bookmarkData.summaryMode = summaryMode
    bookmarkData.percentileMode = percentileMode

    let newData = deepCopy(allBookmarkData)
    newData.push(bookmarkData)
    setAllBookmarkData(newData)

    localStorage.setItem('dice-bookmarks', JSON.stringify(newData))
  }

  const deleteBookmark = (index) => {
    let newData = deepCopy(allBookmarkData)
    newData.splice(index, 1)
    setAllBookmarkData(newData)

    localStorage.setItem('dice-bookmarks', JSON.stringify(newData))
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
          key={`bookmark-${allBookmarkData.length}`}
        >
          <span className='hover-string'>
            { hasSomethingQueued ?
              <>
                <div>Bookmark</div>
                <div>{getRollDescription(diceDataIntoToRollData(currentDice, percentileMode), summaryMode)}</div>
              </>
            :
              'Bookmark dice here'
            }
          </span>
          <span className='tucked-string two-lines'>
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
      {getRollDescription(
        diceDataIntoToRollData(bookmarkData, bookmarkData.percentileMode),
        bookmarkData.summaryMode
      )}
    </button>
  );
}



export default DiceBookmarks;
