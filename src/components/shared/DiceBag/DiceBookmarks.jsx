import React, { useState, useEffect } from 'react';
import { deepCopy } from '../../../utils.js';
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

  // Can add a bookmark IF we have something queued up...
  let addBookmarkEnabled = false;
  let matchingBookmarkIndex = -1; // the index of the bookmark we match
  let bookmarkTexts = [];
  Object.keys(currentDice).forEach((dieType) => {
    if (currentDice[dieType] > 0 && dieType !== 'plus') addBookmarkEnabled = true;
  });
  // ...AND it doesn't match an existing bookmark.
  allBookmarkData.forEach((bookmarkData, i) => {
    const bookmarkText = getRollDescription(
      diceDataIntoToRollData(bookmarkData, bookmarkData.percentileMode),
      bookmarkData.summaryMode
    )
    const diceText = getRollDescription(
      diceDataIntoToRollData(currentDice, percentileMode),
      summaryMode
    )
    if (bookmarkText === diceText) {
      matchingBookmarkIndex = i;
      addBookmarkEnabled = false;
    }
  })

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
            isSelected={matchingBookmarkIndex === i}
            key={`bookmark-${i}-${allBookmarkData.length}`}
          />
        )
      })}

      { allBookmarkData.length < 8 &&
        <button
          className='Bookmark new'
          onClick={addNewBookmark}
          disabled={!addBookmarkEnabled}
          key={`bookmark-${allBookmarkData.length}`}
        >
          <div className='asset bookmark' />

          <div className='desktop-only'>
            <span className='hover-string'>
              { addBookmarkEnabled ?
                <>
                  <div>Bookmark</div>
                  <div>{getRollDescription(diceDataIntoToRollData(currentDice, percentileMode), summaryMode)}</div>
                </>
              :
                'Bookmark roll here'
              }
            </span>
            <span className='tucked-string two-lines'> + </span>
          </div>

          <div className='mobile-only'>
            { addBookmarkEnabled ?
              'Add bookmark: ' +
              getRollDescription(diceDataIntoToRollData(currentDice, percentileMode), summaryMode)
            :
              'Add bookmark'
            }
          </div>
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
  isSelected,
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
      className={`Bookmark ${isSelected ? 'selected' : ''}`}
      onClick={(e) => handleClick(e, true)}
      onContextMenu={(e) => handleClick(e, false)}
      disabled={isSelected}
    >
      <div className='asset bookmark' />

      {getRollDescription(
        diceDataIntoToRollData(bookmarkData, bookmarkData.percentileMode),
        bookmarkData.summaryMode
      )}
    </button>
  );
}



export default DiceBookmarks;
