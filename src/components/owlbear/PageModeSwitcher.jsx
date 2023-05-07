import React from 'react';

import './PageModeSwitcher.scss';

const PageModeSwitcher = ({
  isExpanded,
  toggleExpanded,
  allPageModes,
  skipPages,
  pageMode,
  changePageTo,
  allPartyActionDataLength,
}) => {

  // skip separate dicebags when expanded
  const skipWithExpanded = [...skipPages]
  if (isExpanded) skipWithExpanded.push('rolls')

  const showPageModes = Object.keys(allPageModes)
    .filter(mode => !skipWithExpanded.includes(mode))

  return (
    <div className='PageModeSwitcher'>

      {showPageModes.map(mode => {
          let buttonClass = (pageMode === mode ? 'active' : '')
          // flops back and forth to trigger anim
          if (mode === 'rolls' && allPartyActionDataLength > 0) buttonClass += ` flash-${allPartyActionDataLength % 2}`
          return (
            <button
              onClick={() => changePageTo(mode)}
              className={buttonClass}
              key={mode}
              disabled={mode === pageMode}
            >
              <div className='text'>{allPageModes[mode].label}</div>
              <div className={`pagemode-icon asset ${allPageModes[mode].icon}`} />
            </button>
          )
        })
      }

      <button onClick={toggleExpanded}>
        <div className={`asset ${isExpanded ? 'panel_contract' : 'panel_expand'}`} />
      </button>

    </div>
  )
}

export default PageModeSwitcher ;
