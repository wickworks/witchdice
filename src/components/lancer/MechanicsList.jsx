import React from 'react';

import './MechanicsList.scss';

const MechanicsList = ({
  label,
  findData,
  mechanicIDList,
  containerClass,
  getRankDisplay = (number) => { return number; },
}) => {
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
          return (
            <span className="entry" key={dataID}>
              <span className="bracket">[</span>
              <span className="name">{data.name.toLowerCase()}</span>
              { rank !== undefined && rank !== null &&
                <span className="number">{getRankDisplay(rank)}</span>
              }
              <span className="bracket">]</span>
            </span>
          )
        })}
      </div>
    </div>
  );
}




export default MechanicsList;
