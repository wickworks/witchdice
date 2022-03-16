import React from 'react';
import './SquadMech.scss';

function renderMechPortrait(squadMech) {
	if (squadMech.portraitMech.startsWith('mf_')) {
		return <div className={`mech-portrait asset ${squadMech.portraitMech}`} />
	} else {
		// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
		return <img className='mech-portrait' src={squadMech.portraitMech} alt={'mech portrait'} />
	}
}

function renderPilotPortrait(squadMech) {
	if (squadMech.portraitPilot) {
		// TODO: SANITIZE THIS INSTEAD OF PUTTING USER-DEFINED TEXT INTO SRC
		return <img className="pilot-portrait" src={squadMech.portraitPilot} alt={'pilot portrait'} />
	} else {
		// TODO: BETTER DEFAULT PILOT PORTRAIT
		// return <div className='pilot-portrait asset default_pilot' />
		return <div className='empty-portrait asset ssc-watermark' />
	}
}

// Gives all statuses internal non-breaking spaces && adds a space after each comma
function statusesWithNonbreakingSpaces(statusString) {
	return statusString.replace(/ /g, String.fromCharCode(160)).replace(/,/g, ' ')
}

const SquadMech = ({
	squadMech,
	onRemove,
	pointsRight = false,
}) => {
	const pointClass = pointsRight ? 'points-right' : 'points-left';

  return (
    <div className='SquadMech extra-class' >

			<div className={`arrow-and-statuses ${pointClass}`}>
				<div className={`arrow-container ${pointClass}`}>

					<div className='backdrop' />

					<StatTriangle
						label='HP'
						mainNumberCurrent={squadMech.hpCurrent}
						mainNumberMax={squadMech.hpMax}
						extraClass='hp'
					/>

					<StatTriangle
						label='Heat'
						mainNumberCurrent={squadMech.heatCurrent}
						mainNumberMax={squadMech.heatMax}
						extraClass='heat'
					/>

					<IconTriangle
						icon='reactor'
						iconCountCurrent={squadMech.stress}
						extraClass='stress'
					/>

					<IconTriangle
						icon='structure'
						iconCountCurrent={squadMech.structure}
						extraClass='structure'
					/>

					<div className={`pilot-frame ${pointClass}`} />
					<div className='pilot-container'>
						{ renderPilotPortrait(squadMech) }
					</div>

					<div className={`mech-frame ${pointClass}`} />
					<div className='mech-container'>
						{ renderMechPortrait(squadMech) }
					</div>
				</div>

				<div className={`status-container ${pointClass}`}>
					<div className='statuses callsign'>
						{squadMech.callsign || squadMech.name}
					</div>

					<div className='statuses external'>
						{squadMech.statusExternal.replace(/,/g, ', ') || ' '}
					</div>

					<div className='statuses internal'>
						{squadMech.statusInternal.replace(/,/g, ', ') || ' '}
					</div>
				</div>
			</div>
    </div>
  );
}
// <button className='remove-mech asset x' onClick={onRemove} />




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
			<div className='icon-container'>
				{[...Array(4)].map((undef, i) =>
					<div className={`asset ${icon} ${iconCountCurrent+i >= 4 ? '' : 'spent'}`} key={i} />
				)}
			</div>
    </div>
  );
}

const AddSquadMechButton = ({
  squadMech,
	handleClick,
}) => {

  return (
		<button className='AddSquadMechButton' onClick={handleClick}>
			<div className='add-mech-container'>
				<div className='portrait-container'>
					{ renderMechPortrait(squadMech) }
				</div>

				<div className='name-container'>
					<div className='name'>{squadMech.name.toUpperCase()}</div>
				</div>

				<div className='icon-container'>
					<div className='asset plus' />
				</div>
			</div>
		</button>
  );
}


export { SquadMech, AddSquadMechButton };
