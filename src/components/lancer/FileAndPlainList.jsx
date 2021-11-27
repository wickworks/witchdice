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
          <div className="title-and-input">
            <div className="title">New File</div>
            <input type="file" accept="application/JSON" onChange={onFileChange} />
          </div>


          <div className="instructions">
            Upload a pilot data file (.json) from
            <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
          </div>

          <button className='cancel' onClick={() => setIsUploadingNewFile(false)}>
            Cancel
          </button>
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

      {children}

    </div>
  );
}




export { FileList, PlainList };
