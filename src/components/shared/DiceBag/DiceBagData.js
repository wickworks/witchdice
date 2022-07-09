
export const blankDice = {
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
//   {'dieType': '20', 'result': 12},
//   {'dieType': '6', 'result': -4},
//   {'dieType': 'plus', 'result': -4}
// ]
// into the FINAL RESULT given a summaryMode
export function processRollData(rollData, summaryMode, summaryModeValue) {
  // console.log('SUMMING mode', summaryMode, ' summaryModeValue ', summaryModeValue);
  // console.log('  roll data:', rollData);
  if (!rollData || Object.keys(rollData).length === 0) return 0

  // can't have a summary mode value of less than 1
  summaryModeValue = summaryModeValue ? Math.max(summaryModeValue,1) : 1

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

  let resultTotal = 0;

  if (summaryMode === 'total') {
    rollData.forEach(roll =>
      resultTotal += roll.result // negative rolls have negative values
    )

  } else if (summaryMode === 'low' || summaryMode === 'high') {
    // collect all the rolls into their respective types
    let rollsByType = {}
    rollData.forEach(roll => rollsByType[roll.dieType] = [])
    rollData.forEach(roll => rollsByType[roll.dieType].push(roll.result))

    const sortOrder = (summaryMode === 'low') ? -1 : 1

    Object.keys(rollsByType).forEach(dieType => {
      // sort all the rolls by lowest- or highest-first
      rollsByType[dieType].sort((a,b) => (a<b) ? sortOrder : -1*sortOrder)

      // trim all the rolls by the summary mode value
      rollsByType[dieType] = rollsByType[dieType].slice(0, summaryModeValue)

      // sum them all up
      resultTotal += rollsByType[dieType].reduce((prev,roll) => prev + roll, 0)
    });
  }

  // add the modifier to the end of all this
  resultTotal += modifier;

  // console.log('=======> total', resultTotal);
  return resultTotal
}

// turns rollDice data:
//  { '20': 1, '6': -2 ... }
// into "to-roll" data that looks like roll data but dice instead of results
//  [
//    {'dieType': '20', 'result': '1d20', sign: 1},
//    {'dieType': '6',  'result': '2d6',  sign: -1}, ...
//  ]
export function diceDataIntoToRollData(diceData, percentileMode = false) {

  // hijack d10s in percentile mode
  if (percentileMode) {
    diceData = {...diceData}
    diceData['10'] = 0;
    diceData['100'] = 1;
  }

  let toRollData = [];

  Object.keys(diceData).forEach(dieType => {
    const rollCount = Math.abs(diceData[dieType])
    const rollSign = Math.sign(diceData[dieType])

    if ((parseDieType(dieType) || dieType === 'plus') && rollCount > 0) {
      toRollData.push({
        dieType: dieType,
        result: (dieType === 'plus' ? diceData[dieType] : `${rollCount}d${parseDieType(dieType)}`),
        sign: rollSign
      })
    }
  })

  return toRollData;
}

// turns to-roll or roll data:
//   [ {'dieType': '20', 'result': 1, sign: 1}, ... ]
// into a string that says what WILL BE or WAS rolled, e.g.
// 1d20               | 18
// 2d12 + 4           | 11 + 12 + 4
// 1d20 - 1d8         | 18 - 7
// Min (3d6)          | Min (3, 1, 5)
// Max (1d20) - (3d6) | Max (18) - (3, 1, 6)

export function getRollDescription(rollData, summaryMode) {
  if (!rollData || rollData.length === 0) return ''

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

  // get the die types in order, descending.
  // Has to handle getting either e.g. [ '20', 'x', 'plus' ] or [ 'd20', 'dx', 'plus' ]
  const sortedDieTypes = [...new Set(
    rollData
    .map(roll => roll.dieType)
    .sort((a, b) => {
      if (a.startsWith('d')) { a = a.substring(1) } // strip off the 'd' for rolled dice
      if (b.startsWith('d')) { b = b.substring(1) }

      if      (a.startsWith('x')) { return 1 }
      else if (b.startsWith('x')) { return -1 }
      else                        { return (parseInt(a) > parseInt(b)) ? -1 : 1 }
    })
    .filter(dieType => dieType !== 'plus')
  )]

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
      const nonBreakingSpace = "\u00a0"
      resultsByType[dieType] = `(${nonBreakingSpace}${resultsByType[dieType]}${nonBreakingSpace})`
    }
  });

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


// Returns an array of dice types e.g. ['20', 'x16', '12', '10', '8', '6', '4', 'plus']
export function sortedDice(diceData) {
  let sorted = Object.keys(diceData).sort((a, b) => {
    return (parseInt(a) > parseInt(b)) ? -1 : 1
  });

  // This returns different results on different browsers (???),
  // so we need to then cherry-pick the x and plus to the end.
  let dxString = '';
  let dxIndex = -1;
  sorted.forEach((die, i) => {
    if (die.startsWith('x')) {
      dxString = die;
      dxIndex = i;
    }
  })
  if (dxString) {
    sorted.splice(dxIndex, 1);
    sorted.push(dxString);
  }

  if (sorted.indexOf('plus') >= 0) {
    sorted.splice( sorted.indexOf('plus'), 1);
    sorted.push('plus');
  }

  return sorted;
}

// turn '20' or 'x20' into 20
export function parseDieType(dieType) {
  if (dieType.startsWith('x')) dieType = dieType.substring(1);
  return parseInt(dieType);
}
