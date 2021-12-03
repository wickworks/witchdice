import React, { useState } from 'react';
import Tooltip from '../shared/Tooltip';

import './MechanicsList.scss';

const MechanicsList = ({
  label,
  findData,
  mechanicIDList,
  containerClass,
  getRankDisplay = (number) => { return number; },
  namesToLowercase = true,
}) => {
  const [hoveringIndex, setHoveringIndex] = useState(null);

  return (
    <div className={`MechanicsList ${containerClass}`}>
      <div className="label">{label}</div>
      <div className="list">
        { mechanicIDList.map((mechanic, i) => {
          // sometimes the mechanic is the ID, sometimes it's an object _with_ an ID
          const dataID = mechanic.id || mechanic
          const data = findData(dataID)
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
                  tooltipData={data}
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
