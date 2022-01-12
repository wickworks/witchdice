import React, { useState } from 'react';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';

import './FileAndPlainList.scss';

const FileList = ({
  title,
  extraClass,
  allFileEntries,
  setActiveFileID,
  activeFileID,
  deleteActiveFile,
  onFileUpload,
  onFilePaste,
  acceptFileType = 'application/JSON',
  onTitleClick = null,
  children,
}) => {
  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);

  const [pastedFile, setPastedFile] = useState('');
  const [pastedError, setPastedError] = useState(false);

  const reset = () => {
    setPastedFile('')
    setPastedError(false)
    setIsUploadingNewFile(false);
  }

  const onFileChange = e => {
    onFileUpload(e)
    reset()
  }

  const onPastedFileChange = e => {
    var jsonString = String(e.target.value)

    try {
      const pilot = JSON.parse(jsonString)

      // sanity-check the pilot file
      if (!pilot || !pilot.id || !pilot.mechs) throw new Error('Pilot looks handwritten! :(')

      onFilePaste(pilot)
      reset()
      return

    } catch(err) {
      console.log('Json error:', err);
      setPastedError(true)
      setPastedFile(jsonString)
    }
  }

  return (
    <div className={`FileList ${extraClass}`}>
      { isUploadingNewFile ?
        <PlainList title={title} extraClass='new-file' onTitleClick={onTitleClick}>
          <div className="instructions">
            {children}
          </div>

          <div className={`button-container ${onFilePaste ? 'column' : ''}`}>
            <div className="inputs-container">
              { pastedFile ?
                pastedError && <button disabled>Invalid Json</button>
              :
                <label>
                  Upload file
                  <input type="file" accept={acceptFileType} onChange={onFileChange} />
                </label>
              }


              {onFilePaste &&
                <div className="paste-container">
                  <input
                    type="text"
                    value={pastedFile}
                    placeholder='Or paste json here'
                    onChange={onPastedFileChange}
                  />
                </div>
              }
            </div>

            <button onClick={reset}>
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
