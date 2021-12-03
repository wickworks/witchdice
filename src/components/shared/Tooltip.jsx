import React from 'react';
import BrToParagraphs from './BrToParagraphs';
import './Tooltip.scss';

const Tooltip = ({
  tooltipData,
  onClose,
}) => (
  <div className="Tooltip anchor">
    <div className="content-container">
      <div className="title-container">
        <h4>{tooltipData.title || tooltipData.name || ''}</h4>
        <button className="asset x" onClick={onClose} />
      </div>

      {tooltipData.effect &&
        <BrToParagraphs stringWithBrs={tooltipData.effect} />
      }

      {tooltipData.description &&
        <div className="desc-container">
          <BrToParagraphs stringWithBrs={tooltipData.description} />
        </div>
      }
    </div>
  </div>
);

export default Tooltip;
