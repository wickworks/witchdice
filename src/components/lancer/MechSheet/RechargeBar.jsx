import React from 'react';

import './RechargeBar.scss';

export function getRechargeString(recharge) {
	if (recharge && recharge.rollTarget > 0) {
		return `Recharge ${recharge.rollTarget}+`
	}
	return ''
}

export function getRechargeStatusShortString(recharge) {
  let rechargeString = ''
  if (recharge.rollTarget > 0) {
    rechargeString = recharge.charged ? '〔Charged〕' : 'Recharge '
    rechargeString += `${recharge.rollTarget}+`
  } else {
    rechargeString =  recharge.charged ? '〔 Used 〕' : '〔 Available 〕'
  }
  return rechargeString
}

export function getRechargeStatusString(recharge) {
  let rechargeString = ''
  if (recharge.rollTarget > 0) {
    rechargeString = getRechargeString(recharge)
    rechargeString += recharge.charged ? ' 〔Charged〕' : ' 〔 ----- 〕'
  } else {
    rechargeString =  recharge.charged ? '〔 Used 〕' : '〔 Available 〕'
  }
  return rechargeString
}


const RechargeBar = ({
	recharge,
	setRecharged,
}) => {

  return (
    <label className='RechargeBar'>
      <input type='checkbox'
        checked={recharge.charged}
        onChange={() => setRecharged(!recharge.charged)}
      />
      { getRechargeStatusString(recharge) }
    </label>
  )
}

export default RechargeBar
