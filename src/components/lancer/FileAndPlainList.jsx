import React, { useState } from 'react';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import EntryList from '../shared/EntryList.jsx';

import './FileAndPlainList.scss';

const FileList = ({
  title,
  extraClass,
  allFileEntries,
  setActiveFileID,
  activeFileID,
  deleteActiveFile,
  onFileUpload,
  acceptFileType = 'application/JSON',
  onTitleClick = null,
  children,
}) => {
  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  const onFileChange = (e) => {
    setIsUploadingNewFile(false);
    onFileUpload(e);
  }

  return (
    <div className={`FileList ${extraClass}`}>
      { isUploadingNewFile ?
        <PlainList title={title} extraClass='new-file' onTitleClick={onTitleClick}>
          <div className="instructions">
            {children}
          </div>

          <div className="button-container">
            <label>
              Choose file
              <input type="file" accept={acceptFileType} onChange={onFileChange} />
            </label>

            <button className='cancel' onClick={() => setIsUploadingNewFile(false)}>
              Cancel
            </button>
          </div>
        </PlainList>
      :
        <CharacterList
          title={title}
          onTitleClick={onTitleClick}
          characterEntries={allFileEntries}
          handleEntryClick={setActiveFileID}
          activeCharacterID={activeFileID}
          deleteActiveCharacter={deleteActiveFile}
          createNewCharacter={() => setIsUploadingNewFile(true)}
        />
      }
    </div>
  );
}

const PlainList = ({
  title,
  extraClass,
  children,
  onTitleClick = null,
}) => {
  return (
    <div className={`PlainList ${extraClass}`}>
      <div className="panel">
        <div className="title-bar">
          <button className="title-button" onClick={onTitleClick} disabled={onTitleClick === null}>
            <h2>{title}s</h2>
          </button>
        </div>

        <div className="list-container">
          {children}
        </div>
      </div>
    </div>
  );
}




export { FileList, PlainList };
