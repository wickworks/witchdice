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
        <PlainList title={title} extraClass='new-file'>
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
}) => {
  return (
    <div className={`PlainList ${extraClass}`}>
      <div className="title-bar">
        <h2>{title}s</h2>
      </div>

      <div className="list-container">
        {children}
      </div>
    </div>
  );
}




export { FileList, PlainList };
