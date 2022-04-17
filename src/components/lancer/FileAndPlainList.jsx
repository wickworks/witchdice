import React, { useState } from 'react';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';

import './FileAndPlainList.scss';

const FileList = ({
  title,
  extraClass,
  onTitleClick = null,

  onFileUpload,
  onFilePaste,
  onShareCodePaste,
  shareCodeLength,
  acceptFileType = 'application/JSON',

  isUploadingNewFile,
  setIsUploadingNewFile,

  instructions = '',
  children,
}) => {
  // Moved to parent so it can have flexible children
  // const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);


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
    var pastedString = String(e.target.value)

    // is this a share code?
    if (shareCodeLength && pastedString.length === shareCodeLength) {
      onShareCodePaste(pastedString)
      reset()

    } else {
      try {
        const pilot = JSON.parse(pastedString)
        // sanity-check the pilot file
        if (!pilot || !pilot.id || !pilot.mechs) throw new Error('Invalid pilot file!')

        onFilePaste(pilot)
        reset()
        return

      } catch(err) {
        console.log('Json error:', err);
        setPastedError(true)
        setPastedFile(pastedString)
      }
    }


  }

  return (
    <div className={`FileList ${extraClass}`}>
      { isUploadingNewFile ?
        <PlainList title={title} extraClass='new-file' onTitleClick={onTitleClick}>
          <div className="instructions">
            {instructions}
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

              or

              {onFilePaste &&
                <div className="paste-container">
                  <input
                    type="text"
                    value={pastedFile}
                    placeholder={!!onShareCodePaste ? '.json or share code' : '.json'}
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
        children
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
