import React, { useState } from 'react';
import Tooltip from '../shared/Tooltip';

import './MechanicsList.scss';

const MechanicsList = ({
  label,
  findData,
  tooltipContentKey,
  tooltipFlavorKey,
  tooltipHref,
  mechanicIDList,
  containerClass,
  getRankDisplay = (number) => { return number; },
  namesToLowercase = true,
}) => {
  const [hoveringIndex, setHoveringIndex] = useState(null);

  function getTooltipData(data) {
    var tooltipData = {}
    tooltipData.title = data.title || data.name || ''
    tooltipData.content = tooltipContentKey ? data[tooltipContentKey] : ''
    tooltipData.flavor = tooltipFlavorKey ? data[tooltipFlavorKey] : ''
    tooltipData.href = tooltipHref ? tooltipHref.replace(/%TITLE/g, tooltipData.title) : '';

    return tooltipData
  }

  return (
    <div className={`MechanicsList ${containerClass}`}>
      <div className="label">{label}</div>
      <div className="list">
        { mechanicIDList.map((mechanic, i) => {
          // sometimes the mechanic is the ID, sometimes it's an object _with_ an ID
          const dataID = mechanic.id || mechanic
          const data = findData(dataID)
          const tooltipData = getTooltipData(data)
          // and sometimes they come with ranks
          const rank = mechanic.rank
          const name = namesToLowercase ? data.name.toLowerCase() : data.name


          return (
            <span
              className="entry"
              onMouseEnter={() => setHoveringIndex(i)}
              onMouseLeave={() => setHoveringIndex(null)}
              key={dataID}
            >
              <span className="bracket">[</span>
              <span className="name">{name}</span>
              { rank !== undefined && rank !== null &&
                <span className="number">{getRankDisplay(rank)}</span>
              }
              <span className="bracket">]</span>

              {hoveringIndex === i &&
                <Tooltip
                  title={tooltipData.title}
                  content={tooltipData.content}
                  flavor={tooltipData.flavor}
                  compendiumHref={tooltipData.href}
                  onClose={() => setHoveringIndex(null)}
                />
              }
            </span>
          )
        })}
      </div>
    </div>
  );
}




export default MechanicsList;
