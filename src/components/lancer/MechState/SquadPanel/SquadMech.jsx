import React from 'react';
import { findFrameData } from '../../lancerData.js';
import './SquadMech.scss';

const SquadMech = ({
	pilotData,
	mechData
}) => {

	function renderMechPortrait() {
		if (mechData.cloud_portrait) {
			return <img className='mech-portrait' src={mechData.cloud_portrait} alt={'mech portrait'} />
		} else {
			const frameData = findFrameData(mechData.frame);
			return <div className={`mech-portrait asset ${frameData.id}`} />
		}
	}

  return (
    <div className='SquadMech' >

			<div className='readout hp'>
				HP 12/12
			</div>

			<div className='tick-container structure'>
				{ [...Array(4)].map((undef, i) => {
					return (
						<div className='tick'>
							<div className='asset structure' />
						</div>
					)
				})}
			</div>


			<div className='mech-and-pilot-portraits'>
				<div className='mech-portrait-container'>
					{ renderMechPortrait() }
				</div>

				{ pilotData.cloud_portrait &&
					<div className='pilot-portrait-border'>
						<div className='pilot-portrait-container'>
							<img className="pilot-portrait" src={pilotData.cloud_portrait} alt={'pilot portrait'} />
						</div>
					</div>
				}
			</div>

			<div className='tick-container stress'>
				{ [...Array(4)].map((undef, i) => {
					return (
						<div className='tick'>
							<div className='asset reactor' />
						</div>
					)
				})}
			</div>

			<div className='readout heat'>
				Heat 5/5
			</div>

			<div className='statuses internal'>
				Burn 2, CP Exhausted
			</div>

			<div className='statuses external'>
				Jammed, Impaired
			</div>
    </div>
  );
}




export default SquadMech;
