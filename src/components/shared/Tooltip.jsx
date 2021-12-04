import React from 'react';
import BrToParagraphs from './BrToParagraphs';
import './Tooltip.scss';

const Tooltip = ({
  tooltipData,
  compendiumHref = '',
  onClose,
}) => {
  const title = tooltipData.title || tooltipData.name || ''

  return (
    <div className="Tooltip anchor">
      <div className="content-container">
        <div className="title-container">
          <h4>{title}</h4>
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

        {compendiumHref &&
          <p><a
            className="compendium-link"
            href={compendiumHref}
            target='_blank'
            rel="noopener noreferrer"
          >
            Compendium
          </a></p>
        }
      </div>
    </div>
  );
}
export default Tooltip;
