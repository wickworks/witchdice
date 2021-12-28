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

  return (
    <div className='SquadMech' >

			<div className='readout hp'>
				HP {squadMech.hpCurrent}/{squadMech.hpMax}
			</div>

			<div className='tick-container structure'>
				{ [...Array(squadMech.structure)].map((undef, i) => {
					return (
						<div className='tick' key={i}>
							<div className='asset structure' />
						</div>
					)
				})}
			</div>


			<div className='mech-and-pilot-portraits'>
				<div className='mech-portrait-container'>
					{ renderMechPortrait() }
				</div>

				{ squadMech.portraitPilot &&
					<div className='pilot-portrait-border'>
						<div className='pilot-portrait-container'>
							<img className="pilot-portrait" src={squadMech.portraitPilot} alt={'pilot portrait'} />
						</div>
					</div>
				}
			</div>

			<div className='tick-container stress'>
				{ [...Array(squadMech.stress)].map((undef, i) => {
					return (
						<div className='tick' key={i}>
							<div className='asset reactor' />
						</div>
					)
				})}
			</div>

			<div className='readout heat'>
				Heat {squadMech.heatCurrent}/{squadMech.heatMax}
			</div>

			<div className='statuses internal'>
				{squadMech.statusInternal}
			</div>

			<div className='statuses external'>
				{squadMech.statusExternal}
			</div>
    </div>
  );
}




export default SquadMech;
