import React, { useState } from 'react';
import './TextInput.scss';


const TextInput = ({
  textValue,
  setTextValue,
  placeholder,
  suffix,
  isTextbox,
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

  return (
    <div className="TextInput">
      {isEditing ?

        isTextbox ?
          <textarea
            value={currentText}
            onKeyPress={ (e) => { if (e.key === 'Enter') {stopEditing()} }}
            onBlur={ () => {stopEditing()} }
            onChange={ e => handleTextChange(e.target.value) }
            placeholder={placeholder}
            autoFocus
          />
        :
          <input
            type="text"
            value={currentText}
            onKeyPress={ (e) => { if (e.key === 'Enter') {stopEditing()} }}
            onBlur={ () => {stopEditing()} }
            onChange={ e => handleTextChange(e.target.value) }
            placeholder={placeholder}
            autoFocus
          />

      :
        <div className='display' onClick={() => setIsEditing(true)}>
          {currentText ? currentText : placeholder}
          {suffix && suffix}
        </div>
      }
    </div>
  );
}



export default TextInput;
