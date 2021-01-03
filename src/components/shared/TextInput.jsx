import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import './TextInput.scss';


const TextInput = ({
  textValue,
  setTextValue,
  placeholder,
  prefix,suffix,
  isTextbox,
  isMarkdown,
  startsOpen = false,
  maxLength = -1,
}) => {
  const [isEditing, setIsEditing] = useState(startsOpen);
  const [currentText, setCurrentText] = useState(textValue);

  // update if incoming data changes
  if (!isEditing && textValue !== currentText) {
    setCurrentText(textValue);
  }

  function stopEditing() {
    setIsEditing(false);
    setTextValue(currentText);
  }

  function handleTextChange(newText) {
    if (maxLength > 0) {
      setCurrentText(newText.slice(0,maxLength))
    } else {
      setCurrentText(newText)
    }
  }

  function handleKeyPress(key) {
    if (key === 'Enter' && !isMarkdown) { stopEditing() } // accept
    if (key === 'Escape') { setIsEditing(false); }        // cancel changes
  }

  const editingClass = isEditing ? 'editing' : 'not-editing';
  const placeholderClass = currentText ? 'not-placeholder' : 'placeholder';
  const displayText = `${prefix ? prefix : ''}${currentText ? currentText : placeholder}${suffix ? suffix : ''}`;



  function renderInputs() {
    return (
      isTextbox ?
        <textarea
          value={currentText}
          onKeyDown={ (e) => handleKeyPress(e.key) }
          onBlur={ () => {stopEditing()} }
          onChange={ e => handleTextChange(e.target.value) }
          placeholder={placeholder}
          autoFocus
        />
      :
        <input
          type="text"
          value={currentText}
          onKeyDown={ (e) => handleKeyPress(e.key) }
          onBlur={ () => {stopEditing()} }
          onChange={ e => handleTextChange(e.target.value) }
          placeholder={placeholder}
          autoFocus
        />
    )
  }

  function renderDisplayText() {
    return (
      <div
        className={`display ${placeholderClass}`}
        onClick={ (e) => {setIsEditing(true); e.stopPropagation();} }
      >
        { isMarkdown ?
          <ReactMarkdown source={displayText} />
        :
          displayText
        }
      </div>
    )
  }

  return (
    <div className={`TextInput ${editingClass}`}>
      { isEditing ? renderInputs() : renderDisplayText() }
    </div>
  );
}



export default TextInput;
