import React, { useState, useEffect } from 'react';
import { deepCopy } from '../../../utils.js';
import {
  diceDataIntoToRollData,
  getRollDescription,
} from './DiceBagData.js';
import {Bookmark, BookmarkNew} from './Bookmark';
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
        <BookmarkNew
          addNewBookmark={addNewBookmark}
          addBookmarkEnabled={addBookmarkEnabled}
          allBookmarkDataLength={allBookmarkData.length}
          rollDescription={getRollDescription(diceDataIntoToRollData(currentDice, percentileMode), summaryMode)}
        />
      }
    </div>
  );
}




export default DiceBookmarks;
