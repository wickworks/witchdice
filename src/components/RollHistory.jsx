import React from 'react';
import { PartyActionDicebag, PartyActionAttack } from './PartyAction.jsx';
import './RollHistory.scss';

const RollHistory = ({
  allPartyActionData,
}) => {

  function renderActionRolls() {
    let previousName = '';
    let previousChar = '';

    // slice(0) makes a copy so we can reverse it
    const actionRolls = allPartyActionData.slice(0).reverse().map((actionData, i) => {
      const showName =
        actionData.name !== previousName ||
        actionData.char !== previousChar ||
        actionData.char;
      previousName = actionData.name
      previousChar = actionData.char

      return (
        actionData === 'dicebag' ?
          <PartyActionDicebag
            actionData={actionData}
            showName={showName}
            key={actionData.updatedAt}
          />

        : actionData === 'attack' &&
          <PartyActionAttack
            actionData={actionData}
            showName={showName}
            key={actionData.updatedAt}
          />

      )
    })

    return actionRolls
  }


  const isEmpty = allPartyActionData.length === 0;

	return (
		<div className="RollHistory">
			<div className='nouveau-border'>
        { isEmpty ?
          <div className='no-rolls-container'>
            <div>Welcome!</div>
            <div>
              Your rolls will be recorded here.
              <span className='asset flower' />
            </div>
          </div>
        :
          renderActionRolls()
        }
      </div>
		</div>
	);
}




export default RollHistory;
