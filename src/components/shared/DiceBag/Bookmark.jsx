import React from 'react';
import { deepCopy } from '../../../utils.js';
import {
  diceDataIntoToRollData,
  getRollDescription,
} from './DiceBagData.js';
import './Bookmark.scss';

const Bookmark = ({
  bookmarkData,
  setCurrentDice,
  setSummaryMode,
  handleDelete,
  isSelected,
}) => {

  const handleClick = (e, leftMouse) => {

    // load roll
    if (leftMouse && !e.shiftKey) {
      let diceData = deepCopy(bookmarkData)
      const summaryMode = diceData.summaryMode
      delete diceData.summaryMode

      setSummaryMode(summaryMode)
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
        diceDataIntoToRollData(bookmarkData),
        bookmarkData.summaryMode,
        bookmarkData.summaryModeValue
      )}
    </button>
  );
}

const BookmarkNew = ({
  addNewBookmark,
  addBookmarkEnabled,
  allBookmarkDataLength,
  rollDescription
}) => {

  return (
    <button
      className='Bookmark new'
      onClick={addNewBookmark}
      disabled={!addBookmarkEnabled}
      key={`bookmark-${allBookmarkDataLength}`}
    >
      <div className='asset bookmark' />

      <div className='desktop-only'>
        <span className='hover-string'>
          { addBookmarkEnabled ?
            <>
              <div>Bookmark</div>
              <div>{rollDescription}</div>
            </>
          :
            'Bookmark roll here'
          }
        </span>
        <span className='tucked-string two-lines'> + </span>
      </div>

      <div className='mobile-only'>
        { addBookmarkEnabled ?
          `Add bookmark: ${rollDescription}`
        :
          'Add bookmark'
        }
      </div>
    </button>
  )
}

export { Bookmark, BookmarkNew };
