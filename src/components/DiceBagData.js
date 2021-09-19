
const blankDice = {
  '4': 0,
  '6': 0,
  '8': 0,
  '10': 0,
  '12': 0,
  '20': 0,
  'plus': 0,
  'x': 0,   // becomes e.g. 'x3' for variable dice, set on clear by defaultVariableDieType
}

function getToRollString(diceData, summaryMode, percentileMode) {
  diceData = {...diceData} // don't modify the original

  // hijack d10s in percentile mode
  const percentileAvailable = (diceData['10'] === 2);
  if (percentileAvailable && percentileMode) {
    diceData['10'] = 0;
    diceData['100'] = 1;
  }

  const toRollArray =
    sortedDice(diceData).map(dieType => {
      const dieCount = diceData[dieType]
      const dieTypeNumber = parseDieType(dieType);

      if (dieCount !== 0 && dieTypeNumber) {
        return `${dieCount}d${dieTypeNumber}`
      } else {
        return ''
      }
    })
    .filter(e => {return e} ) // filter out empty values

  let toRollSummary = ''
  if (summaryMode === 'total') {
    toRollSummary = toRollArray.join(' + ')
  } else if (summaryMode === 'low' || summaryMode === 'high') {
    toRollSummary = toRollArray.join(', ')
  }

  const modifier = diceData['plus']
  if (modifier !== 0) toRollSummary = `( ${toRollSummary} ) ${modifier > 0 ? '+' : ''} ${modifier}`

  return toRollSummary
}


// turns roll data:
// [
//   {'dieType': '20', 'result': 1, sign: 1},
//   {'dieType': '6', 'result': 12, sign: -1},
//   {'dieType': 'plus', 'result': -4}
// ]
// into the FINAL RESULT given a summaryMode
function processRollData(rollData, summaryMode) {
  console.log('processing roll data', rollData);

  if (!rollData || Object.keys(rollData).length === 0) return 0

  // extract the modifier out of the roll data
  let modifier = 0
  rollData = rollData.filter(roll => {
    if (roll.dieType === 'plus') {
      modifier = roll.result;
      return false;
    } else {
      return true;
    }
  });

  console.log('      modifier : ', modifier);

  let resultTotal = 0;

  if (summaryMode === 'total') {
    rollData.forEach(roll =>
      resultTotal += (roll.result * roll.sign) // subtract rolls from negative dieType
    )

  } else if (summaryMode === 'low') {
    // get lowest for each die type
    let lowest = {}
    let rollSign = 1
    rollData.forEach(roll => {
      const prevLow = (Math.abs(lowest[roll.dieType]) || roll.result)
      lowest[roll.dieType] = Math.min(prevLow, roll.result) * roll.sign
    })
    // add or subtract those lowests all together (the sign is built-in)
    Object.keys(lowest).forEach(dieType =>
      resultTotal += (lowest[dieType])
    )

  } else if (summaryMode === 'high') {
    // get highest for each die type
    let highest = {}
    let rollSign = 1
    rollData.forEach(roll => {
      const prevHigh = (Math.abs(highest[roll.dieType]) || roll.result)
      highest[roll.dieType] = Math.max(prevHigh, roll.result) * roll.sign
    })
    // add or subtract those highests all together (the sign is built-in)
    Object.keys(highest).forEach(dieType =>
      resultTotal += (highest[dieType])
    )
  }

  // add the modifier to the end of all this
  resultTotal += modifier;

  console.log('====> total', resultTotal);
  return resultTotal
}



function getResultsSummary(rollData, summaryMode) {
  console.log('ROLL DATA', rollData);
  //
  // let resultTotal = 0
  // let resultSummary = ''
  // if (summaryMode === 'total') {
  //   resultTotal = runningTotal + modifier
  //   resultSummary = resultArray.join(' + ')
  //
  // } else if (summaryMode === 'low') {
  //   const lowTotal = Object.values(lowest).reduce((a,b) => a+b, 0)
  //   resultTotal = lowTotal + modifier;
  //   resultSummary = resultArray.join(', ')
  //
  // } else if (summaryMode === 'high') {
  //   const highTotal = Object.values(highest).reduce((a,b) => a+b, 0)
  //   resultTotal = highTotal + modifier;
  //   resultSummary = resultArray.join(', ')
  // }
  //
  // if (modifier !== 0) resultSummary = `( ${resultSummary} ) ${modifier > 0 ? '+' : ''} ${modifier}`
  //
  // if (summaryMode === 'low') resultSummary = 'Min: ' + resultSummary
  // if (summaryMode === 'high') resultSummary = 'Max: ' + resultSummary
  //
  // return {total: resultTotal, summary: resultSummary}
}

// Returns an array of dice types e.g. ['20', 'x16', '12', '10', '8', '6', '4', 'plus']
function sortedDice(diceData) {
  let sorted = Object.keys(diceData).sort((a, b) => {
    return (parseInt(a) > parseInt(b)) ? -1 : 1
  });

  // This returns different results on different browsers (???),
  // so we need to then cherry-pick the x and plus to the end.
  sorted.splice( sorted.indexOf('plus'), 1);
  sorted.push('plus');

  return sorted;
}

// turn '20' or 'x20' into 20
function parseDieType(dieType) {
  if (dieType.startsWith('x')) dieType = dieType.substring(1);
  return parseInt(dieType);
}


export {
  blankDice,
  getToRollString,
  getResultsSummary,
  sortedDice,
  parseDieType,
  processRollData,
};
