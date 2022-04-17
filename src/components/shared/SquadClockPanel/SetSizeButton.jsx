import React from 'react';
import './SetSizeButton.scss';


const SetSizeButton = ({
  text,
  onClick,
  highlight = false,
  disabled = false,
}) => {
  const highlightClass = highlight ? 'highlight' : ''
  return (
    <button
      className={`SetSizeButton ${highlightClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div>{text}</div>
    </button>
  );
}


export default SetSizeButton ;
