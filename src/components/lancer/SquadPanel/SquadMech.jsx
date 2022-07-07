import React, { useState } from 'react';
import MechanicsList from '../MechanicsList.jsx';
import {
  findFrameData,
  findTalentData,
  findCoreBonusData,
} from '../lancerData.js';
import './SquadMech.scss';
import './SquadMechAnimations.scss';

function renderMechPortrait(squadMech) {
	if (squadMech.detail.portraitMech.startsWith('mf_')) {
		return <div className={`mech-portrait asset ${squadMech.detail.portraitMech}`} />
	} else {
		// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
		return <img className='mech-portrait' src={squadMech.detail.portraitMech} alt={'mech portrait'} />
	}
}

function renderPilotPortrait(squadMech) {
	if (squadMech.detail.portraitPilot) {
		// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
		return <img className="pilot-portrait" src={squadMech.detail.portraitPilot} alt={'pilot portrait'} />
	} else {
		// TODO: BETTER DEFAULT PILOT PORTRAIT
		// return <div className='pilot-portrait asset default_pilot' />
		return <div className='empty-portrait asset ssc-watermark' />
	}
}

const SquadMech = ({
	squadMech,
	onRemove,
	pointsRight = false,
}) => {
	const pointClass = pointsRight ? 'points-right' : 'points-left';

	const [detailsOpen, setDetailsOpen] = useState(false);

	console.log('squadMech',squadMech);

  return (
    <div
			className={`SquadMech extra-class ${pointClass}`}
		>

			<div className={`arrow-and-statuses ${pointClass}`}>
				<div className={`arrow-container ${pointClass}`}>

					<div className='backdrop' />

					<StatTriangle
						label='HP'
						mainNumberCurrent={squadMech.status.hpCurrent}
						mainNumberMax={squadMech.detail.hpMax}
						extraClass='hp'
					/>

					<StatTriangle
						label='Heat'
						mainNumberCurrent={squadMech.status.heatCurrent}
						mainNumberMax={squadMech.detail.heatMax}
						extraClass='heat'
					/>

					<IconTriangle
						icon='reactor'
						iconCountCurrent={squadMech.status.stress}
						extraClass='stress'
					/>

					<IconTriangle
						icon='structure'
						iconCountCurrent={squadMech.status.structure}
						extraClass='structure'
					/>

					<div className='mech-frame-container'>
						<div className={`mech-frame ${pointClass}`} />
					</div>
					<div className='mech-container'>
						{ renderMechPortrait(squadMech) }
					</div>

					<div className='pilot-frame-container'>
						<div className={`pilot-frame ${pointClass}`} />
					</div>
					<div className='pilot-container'>
						{ renderPilotPortrait(squadMech) }
					</div>

				</div>

				<div className={`status-container ${pointClass}`}>
					<div className='callsign'>
						<div>{squadMech.detail.callsign || squadMech.detail.name}</div>
						<button className='remove-mech asset x' onClick={onRemove} />
					</div>

					<div className='statuses external'>
						{squadMech.status.statusExternal.replace(/,/g, ', ') || ' '}
					</div>

					<div className={`statuses internal ${!!squadMech.status.statusInternal ? '' : 'systems-nominal'}`}>
						{squadMech.status.statusInternal.replace(/,/g, ', ') || 'Internal systems nominal'}
					</div>
				</div>
			</div>

			{detailsOpen &&
				<div className={`detail-container ${pointClass}`}>
				{/*	<MechanicsList
						label='Licenses'
						findData={findFrameData}
						tooltipFlavorKey='description'
						tooltipHref={`https://compcon.app/#/compendium/search?search=%TITLE`}
						mechanicIDList={squadMech.detail.build.licenses}
						containerClass={'licenses'}
					/>*/}
					<p>
						<div className='label'>Licenses</div>
						{squadMech.detail.build.licenses}
					</p>
					<p>
						<div className='label'>Core bonuses</div>
						{squadMech.detail.build.core_bonuses}
					</p>
					<p>
						<div className='label'>Talents</div>
						{squadMech.detail.build.talents}
					</p>
					<p>
						<div className='label'>Stats</div>
						<div>{squadMech.detail.build.mechSkills}</div>
						<div>{squadMech.detail.build.statBonuses}</div>
						<div>{squadMech.detail.build.stats}</div>
					</p>
					<p>
						<div className='label'>Weapons</div>
						{squadMech.detail.build.weapons}
					</p>
					<p>
						<div className='label'>Systems</div>
						{squadMech.detail.build.systems}
					</p>
				</div>
			}
    </div>
  );
}




const StatTriangle = ({
  label = '',
  mainNumberCurrent,
  mainNumberMax,
	extraClass,
}) => {

  return (
    <div className={`StatTriangle ${extraClass}`}>
			<div className='numerical-count'>
				{mainNumberCurrent}/{mainNumberMax}
			</div>

			<div className='label'>
				{label}
			</div>
    </div>
  );
}


const IconTriangle = ({
	icon,	// "structure" || "reactor"
	iconCountCurrent, // iconCountMax is 4 : stress/structure
	extraClass,
}) => {

  return (
    <div className={`IconTriangle ${extraClass}`}>
			<div className='rotated-container'>
				<div className='icon-container'>
					{[...Array(4)].map((undef, i) =>
						<div className={`asset ${icon} ${iconCountCurrent+i >= 4 ? '' : 'spent'}`} key={i} />
					)}
				</div>
			</div>
    </div>
  );
}

const AddSquadMechButton = ({
  squadMech,
	handleClick,
	pointsRight = false,
}) => {
	const pointClass = pointsRight ? 'points-right' : 'points-left';

  return (
		<button className={`AddSquadMechButton ${pointClass}`} onClick={handleClick}>
			<div className='portrait-container'>
				{ renderPilotPortrait(squadMech) }
			</div>

			<div className='icon-container'>
				<div className='asset plus' />
			</div>

			<div className='name-container'>
				<div className='name'>{(squadMech.detail.callsign || squadMech.detail.name).toUpperCase()}</div>
			</div>
		</button>
  );
}


export { SquadMech, AddSquadMechButton };
