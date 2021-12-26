import React, { useState } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

import './MechTraits.scss';

const MechTraits = ({
	traitList,
}) => {
  return (
		<div className='MechTraits'>
			<div className="label">Traits</div>

    	<div className='traits-container'>
				{ traitList.map((trait, i) => {
					return (
						<div className={`trait ${trait.description.length > 160 ? 'tall' : ''}`}>
							<div className='name title-case'>
								{trait.name.toLowerCase()}
							</div>
							<div className='description'>{trait.description}</div>
						</div>
					)
				})}
			</div>
    </div>
  );
}

const MechCoreSystem = ({
	coreSystem,
}) => {
  return (
		<div className='MechCoreSystem'>
			<div className="label">Core System — {coreSystem.name}</div>

			<div className='trait'>
				<div className='name'>
					<div>{coreSystem.active_name}</div>
					<div className='detail'>Active (1 CP), {coreSystem.activation}</div>
				</div>
				<div className='description'>
					{ReactHtmlParser(coreSystem.active_effect)}
				</div>
			</div>

			{ coreSystem.passive_actions && coreSystem.passive_actions.map((passiveAction, i) => {
				return (
					<div className='trait'>
						<div className='name'>
							{passiveAction.name}
							<div className='detail'>{passiveAction.activation}</div>
						</div>
						<div className='description'>{passiveAction.detail}</div>
					</div>
				)
			})}
    </div>
  );
}

export { MechTraits, MechCoreSystem };
