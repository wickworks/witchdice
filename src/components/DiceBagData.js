
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


// turns rollDice data:
//  { '20': 1, '6': -2 ... }
// into "to-roll" data that looks like roll data but dice instead of results
//  [
//    {'dieType': '20', 'result': '1d20', sign: 1},
//    {'dieType': '6',  'result': '2d6',  sign: -1}, ...
//  ]
function diceDataIntoToRollData(diceData) {
  return [
    {'dieType': '20', 'result': '1d20', sign: 1},
    {'dieType': '6',  'result': '2d6',  sign: -1},
  ]
}

// turns to-roll or roll data:
//   [ {'dieType': '20', 'result': 1, sign: 1}, ... ]
// into a string that says what WILL BE or WAS rolled, e.g.
// 1d20               | 18
// 2d12 + 4           | 11 + 12 + 4
// 1d20 - 1d8         | 18 - 7
// Min (3d6)          | Min (3, 1, 5)
// Max (1d20) - (3d6) | Max (18) - (3, 1, 6)

function getResultsSummary(rollData, summaryMode) {
  if (!rollData || rollData.length === 0) return ''

  console.log('ROLL DATA', rollData);

  // Group the roll data by die type.
  // resultsByType = { '20': ['18', '4'], '6': ['2d6'], ... }
  // signsByType =   { '20': 1,           '6': -1,      ... }
  // modifier = -3
  let resultsByType = {};
  let signsByType = {};
  let modifier = 0;
  rollData.forEach(roll => {
    if (roll.dieType === 'plus') {
      modifier = parseInt(roll.result)

    } else {
      const prevGroup = resultsByType[roll.dieType] || []
      resultsByType[roll.dieType] = [...prevGroup, roll.result]
      signsByType[roll.dieType] = roll.sign // the whole group's should be the same
    }
  })

  console.log('results by type:', resultsByType);
  console.log('signs   by type:', signsByType);

  // get the die types in order, descenting
  const sortedDieTypes = [...new Set(
    rollData
    .map(roll => roll.dieType)
    .sort((a, b) => (parseInt(a) > parseInt(b)) ? -1 : 1)
  )]

  console.log('sorted types', sortedDieTypes);

  // collapse the resultsByType into a joined string
  // resultsByType = { '20': '18 + 4', '6': '(2d6)', ... }
  if (summaryMode === 'total') {
    sortedDieTypes.forEach(dieType =>
      resultsByType[dieType] = resultsByType[dieType].join(' + ')
    )

  } else if (summaryMode === 'low' || summaryMode === 'high') {
    sortedDieTypes.forEach(dieType =>
      resultsByType[dieType] = resultsByType[dieType].join(', ')
    )
  }

  // Wrap each group in parens, as necessary
  sortedDieTypes.forEach(dieType => {
    if (summaryMode === 'low' || summaryMode === 'high' || signsByType[dieType] < 0) {
      resultsByType[dieType] = `(${resultsByType[dieType]})`
    }
  });

  console.log('collapsed by type : ', resultsByType);

  // Combine the groups by the sign of each group.
  // summary = '18 + 4 - (2d6)'
  let summaryString = '';
  sortedDieTypes.forEach((dieType, i) => {
    let joinString = signsByType[dieType] < 0 ? ' - ' :
      ((i > 0) ? ' + ' : ''); // skip the first "+"
    summaryString += joinString + resultsByType[dieType];
  })

  // Add the modifier
  if (modifier !== 0) summaryString += ` ${modifier > 0 ? '+' : ''} ${modifier}`

  // Prepend a "Min" or "Max" appropriately
  if (summaryMode === 'low')  summaryString = 'Min ' + summaryString
  if (summaryMode === 'high') summaryString = 'Max ' + summaryString

  return summaryString
}

//
// function getToRollString(diceData, summaryMode, percentileMode) {
//   diceData = {...diceData} // don't modify the original
//
//   // hijack d10s in percentile mode
//   const percentileAvailable = (diceData['10'] === 2);
//   if (percentileAvailable && percentileMode) {
//     diceData['10'] = 0;
//     diceData['100'] = 1;
//   }
//
//   const toRollArray =
//     sortedDice(diceData).map(dieType => {
//       const dieCount = diceData[dieType]
//       const dieTypeNumber = parseDieType(dieType);
//
//       if (dieCount !== 0 && dieTypeNumber) {
//         return `${dieCount}d${dieTypeNumber}`
//       } else {
//         return ''
//       }
//     })
//     .filter(e => {return e} ) // filter out empty values
//
//   let toRollSummary = ''
//   if (summaryMode === 'total') {
//     toRollSummary = toRollArray.join(' + ')
//   } else if (summaryMode === 'low' || summaryMode === 'high') {
//     toRollSummary = toRollArray.join(', ')
//   }
//
//   const modifier = diceData['plus']
//   if (modifier !== 0) toRollSummary = `( ${toRollSummary} ) ${modifier > 0 ? '+' : ''} ${modifier}`
//
//   return toRollSummary
// }


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
  diceDataIntoToRollData,
  getResultsSummary,
  sortedDice,
  parseDieType,
  processRollData,
};
