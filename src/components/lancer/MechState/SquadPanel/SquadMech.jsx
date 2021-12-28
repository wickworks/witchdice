import React from 'react';
import { findFrameData } from '../../lancerData.js';
import './SquadMech.scss';

const SquadMech = ({
	squadMech,
}) => {

	function renderMechPortrait() {
		if (squadMech.portraitMech.startsWith('mf_')) {
			return <div className={`mech-portrait asset ${squadMech.portraitMech}`} />
		} else {
			// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
			return <img className='mech-portrait' src={squadMech.portraitMech} alt={'mech portrait'} />
		}
	}

	function renderPilotPortrait() {
		if (squadMech.portraitPilot) {
			// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
			return <img className="pilot-portrait" src={squadMech.portraitPilot} alt={'pilot portrait'} />
		} else {
			// TODO: BETTER DEFAULT PILOT PORTRAIT
			return <div className={`pilot-portrait asset ${'mf_standard_pattern_i_everest'}`} />
		}
	}



  return (
    <div className='SquadMech' >

			<div className='diamond-and-statuses'>
				<div className='summary-diamond'>
					<div className='portrait-container'>
						{ renderMechPortrait() }
					</div>


					<SmallStatDiamond
						label='Heat'
						icon='reactor'
						iconCountCurrent={squadMech.stress}
						mainNumberCurrent={squadMech.heatCurrent}
						mainNumberMax={squadMech.heatMax}
						extraClass='heat'
					/>

					<SmallStatDiamond
						label='HP'
						icon='structure'
						iconCountCurrent={squadMech.structure}
					  mainNumberCurrent={squadMech.hpCurrent}
					  mainNumberMax={squadMech.hpMax}
						extraClass='hp'
					/>


					<div className='portrait-container'>
						{ renderPilotPortrait() }
					</div>
				</div>


				<div className='statuses internal'>
					{squadMech.statusInternal}
				</div>

				<div className='statuses external'>
					{squadMech.statusExternal}
				</div>
			</div>
    </div>
  );
}


const SmallStatDiamond = ({
  label = '',
	icon,	// "structure" || "reactor"
	iconCountCurrent, // iconCountMax is 4 : stress/structure
  mainNumberCurrent,
  mainNumberMax,
	extraClass,
}) => {

  return (
    <div className={`SmallStatDiamond ${extraClass}`}>
			<div className='stats-container'>
				<div className='label'>
					{label}
				</div>

	      <div className='numerical-count'>
	        {mainNumberCurrent}/{mainNumberMax}
	      </div>

				<div className='icon-container'>
					{[...Array(4)].map((undef, i) =>
						<div className={`asset ${icon} ${iconCountCurrent+i >= 4 ? '' : 'spent'}`} key={i} />
					)}
				</div>
			</div>
    </div>
  );
}


export default SquadMech;
