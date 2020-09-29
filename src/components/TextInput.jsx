import React, { useState } from 'react';
import './TextInput.scss';


const TextInput = ({textValue, setTextValue, placeholder, suffix}) => {
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

  return (
    <div className="TextInput">
      {isEditing ?
        <input
          type="text"
          value={currentText}
          onKeyPress={ (e) => { if (e.key === 'Enter') {stopEditing()} }}
          onBlur={ () => {stopEditing()} }
          onChange={ e => setCurrentText(e.target.value) }
          placeholder={placeholder}
          autoFocus
        />
      :
        <div className='display' onClick={() => setIsEditing(true)}>
          {currentText}
          {suffix && suffix}
        </div>
      }
    </div>
  );
}



export default TextInput;
