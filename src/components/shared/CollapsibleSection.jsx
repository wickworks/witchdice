import React, { useState } from 'react';
import './CollapsibleSection.scss';


const CollapsibleSection = ({
  title,
  startsOpen,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(startsOpen);

  return (
    <div className={`CollapsibleSection ${isOpen ? 'open' : 'closed'}`}>
      <button className='section-title' onClick={() => setIsOpen(!isOpen)}>
        {title}
        <span className={`asset arrow-sharp ${isOpen ? '' : 'reversed'}`} />
      </button>
      {children}
    </div>
  );
}

export default CollapsibleSection;
