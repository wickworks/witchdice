import React from 'react';
import './Tooltip.scss';

const Tooltip = ({
  text
}) => (
  <div className="Tooltip anchor">
    <button className="tooltip-panel">
      <p>{text}</p>
    </button>
  </div>
);

export default Tooltip;
