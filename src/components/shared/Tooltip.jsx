import React from 'react';
import BrToParagraphs from './BrToParagraphs';
import './Tooltip.scss';

const Tooltip = ({
  title,
  content = '',
  flavor = '',
  compendiumHref = '',
  onClose,
}) => {

  return (
    <div className="Tooltip anchor">
      <div className="content-container">
        <div className="title-container">
          <h4>{title}</h4>
          <button className="asset x" onClick={onClose} />
        </div>

        <div className='paragraph-container'>
          {content &&
            <BrToParagraphs stringWithBrs={content} />
          }

          {flavor &&
            <BrToParagraphs stringWithBrs={flavor} extraClass='flavor' />
          }
        </div>

        {compendiumHref &&
          <a
            className="compendium-link"
            href={compendiumHref}
            target='_blank'
            rel="noopener noreferrer"
          >
            Compendium
          </a>
        }
      </div>
    </div>
  );
}
export default Tooltip;
