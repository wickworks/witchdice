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
  onItemClick = null,
  getRankDisplay = (number) => { return number; },
  namesToLowercase = true,
}) => {
  const [hoveringIndex, setHoveringIndex] = useState(null);

  function getTooltipData(data, mechanic) {
    var tooltipData = {}
    const useCustomData = (mechanic.custom === true) || !!(mechanic.custom_desc || mechanic.custom_detail)
    if (useCustomData) {
      tooltipData.title = mechanic.id
      tooltipData.content = mechanic.custom_desc + ' ' + mechanic.custom_detail
    } else {
      tooltipData.title = data.title || data.name || ''
      tooltipData.content = (tooltipContentKey ? data[tooltipContentKey] : '')
    }
    tooltipData.flavor = tooltipFlavorKey ? data[tooltipFlavorKey] : ''
    tooltipData.href = tooltipHref ? tooltipHref.replace(/%TITLE/g, tooltipData.title) : '';

    return tooltipData
  }

  return (
    <div className={`MechanicsList ${containerClass}`}>
      <div className="label">{label}</div>
      <div className="list">
        { mechanicIDList.filter(mechanic => mechanic).map((mechanic, i) => {
          // sometimes the mechanic is the ID, sometimes it's an object _with_ an ID
          const dataID = (mechanic && mechanic.id) || mechanic
          const data = findData(dataID)
          const tooltipData = getTooltipData(data, mechanic)
          // and sometimes they come with ranks
          const rank = mechanic.rank
          let name = tooltipData.title
          name = namesToLowercase ? name.toLowerCase() : name

          const isClickable = !!onItemClick

          return (
            <span
              className={`entry ${isClickable ? 'clickable' :''}`}
              onMouseEnter={() => setHoveringIndex(i)}
              onMouseLeave={() => setHoveringIndex(null)}
              onClick={isClickable ? (e) => onItemClick(i) : null}
              key={`${dataID}-${i}`}
            >
              <span className="bracket left">[</span>
              <span className="name">{name.substring(0, 33)}</span>
              { rank !== undefined && rank !== null &&
                <span className="number">{getRankDisplay(rank)}</span>
              }
              <span className="bracket right">]</span>

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
