import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import './TextInput.scss';


const TextInput = ({
  textValue,
  setTextValue,
  placeholder,
  suffix,
  isTextbox,
  isMarkdown,
  maxLength = -1
}) => {
  const [isEditing, setIsEditing] = useState(false);
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

  const editingClass = isEditing ? 'editing' : 'not-editing';
  const placeholderClass = currentText ? 'not-placeholder' : 'placeholder';

  const displayText = `${currentText ? currentText : placeholder}${suffix ? suffix : ''}`;

  return (
    <div className={`TextInput ${editingClass}`}>
      {isEditing ?

        isTextbox ?
          <textarea
            value={currentText}
            onKeyPress={ (e) => { if (e.key === 'Enter' && !isMarkdown) {stopEditing()} }}
            onBlur={ () => {stopEditing()} }
            onChange={ e => handleTextChange(e.target.value) }
            placeholder={placeholder}
            autoFocus
          />
        :
          <input
            type="text"
            value={currentText}
            onKeyPress={ (e) => { if (e.key === 'Enter' && !isMarkdown) {stopEditing()} }}
            onBlur={ () => {stopEditing()} }
            onChange={ e => handleTextChange(e.target.value) }
            placeholder={placeholder}
            autoFocus
          />

      :
        <div
          className={`display ${placeholderClass}`}
          onClick={() => setIsEditing(true)}
        >
          {isMarkdown ?
            <ReactMarkdown source={displayText} />
          :
            <>{displayText}</>
          }

        </div>
      }
    </div>
  );
}



export default TextInput;
