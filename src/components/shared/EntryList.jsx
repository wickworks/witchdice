import React, { useState } from 'react';
import { DeleteButton, DeleteConfirmation } from './DeleteButton.jsx';

import './EntryList.scss';


const EntryList = ({
  entries,
  handleEntryClick,
  activeCharacterID,
  deleteActiveCharacter,
  checkIfDeletable = (id) => true,
  deleteEnabled = true,
  exportActiveCharacter,
  refreshActiveCharacter,
  highlightIDs = [],
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const activeCharacter = entries.find(entry => {
    return entry.id === activeCharacterID
  })

  return (
    <ul className="EntryList">
      { isDeleting ?
        <DeleteConfirmation
          name={activeCharacter.name}
          handleCancel={() => setIsDeleting(false)}
          handleDelete={() => {setIsDeleting(false); deleteActiveCharacter()}}
        />
      :
        entries.map((entry, i) => {
          const id = entry.id;
          const name = entry.name;
          const selectedClass = (id === activeCharacterID) ? 'selected' : ''
          const highlightClass = (highlightIDs.indexOf(id) >= 0) ? 'highlighted' : ''
          return (
            <li
              className={`id-${entry.id} ${selectedClass} ${highlightClass}`}
              onClick={() => handleEntryClick(id)}
              key={id}
            >
              <span className='name'>
                {name}
              </span>

              {!!refreshActiveCharacter && (id === activeCharacterID) &&
                <button
                  className='RefreshButton asset refresh'
                  onClick={refreshActiveCharacter}
                />
              }

              {!!exportActiveCharacter && (id === activeCharacterID) &&
                <button
                  className='ExportButton asset export'
                  onClick={exportActiveCharacter}
                />
              }

              {deleteEnabled && checkIfDeletable(id) && (id === activeCharacterID) &&
                <DeleteButton handleClick={() => setIsDeleting(true)} />
              }
            </li>
          )
        })
      }
    </ul>
  )
}

export default EntryList;
