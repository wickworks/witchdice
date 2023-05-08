import React, { useState, useEffect } from 'react';
import './CollapsibleSection.scss';


const CollapsibleSection = ({
  title,
  startsOpen = true,
  parentControlledOpen = null,
  setParentControlledOpen,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(startsOpen);

  const sectionOpen = parentControlledOpen === null ? isOpen : parentControlledOpen

  const toggleOpen = () => {
    if (parentControlledOpen === null) {
      setIsOpen(!sectionOpen)
    } else {
      setParentControlledOpen(!parentControlledOpen)
    }
  }

  return (
    <div className={`CollapsibleSection ${sectionOpen ? 'open' : 'closed'}`}>
      <button className='section-title' onClick={toggleOpen}>
        {title}
        <span className={`asset arrow-sharp ${sectionOpen ? '' : 'reversed'}`} />
      </button>
      {children}
    </div>
  );
}

export default CollapsibleSection;
