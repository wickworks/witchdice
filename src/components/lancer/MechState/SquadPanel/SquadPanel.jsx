import React, { useState } from 'react';
import SquadMech from './SquadMech.jsx';

import './SquadPanel.scss';

const SquadPanel = ({
	activeMech,
	activePilot,
}) => {
	const [allSquadMechs, setAllSquadMechs] = useState([activeMech]);

  return (
		<div className='SquadPanel'>
    	<div className='squad-container'>

				<div className='mechs-container'>
					<SquadMech pilotData={activePilot} mechData={activeMech} />
					<SquadMech pilotData={activePilot} mechData={activeMech} />
				</div>

			</div>
    </div>
  );
}




export default SquadPanel;
