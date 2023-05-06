
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
    rollData.forEach(roll => resultTotal += roll.result)

  // something more complicated
  } else {
    // collect all the rolls into their respective types
    let rollsByType = {}
    rollData.forEach(roll => rollsByType[roll.dieType] = [])
    rollData.forEach(roll => rollsByType[roll.dieType].push(roll.result))

    if (summaryMode === 'lowest' || summaryMode === 'highest') {
      const sortOrder = (summaryMode === 'lowest') ? -1 : 1

      Object.keys(rollsByType).forEach(dieType => {
        // sort all the rolls by lowest- or highest-first
        rollsByType[dieType].sort((a,b) => (Math.abs(a) < Math.abs(b)) ? sortOrder : -1 * sortOrder)

        // trim all the rolls by the summary mode value
        rollsByType[dieType] = rollsByType[dieType].slice(0, summaryModeValue)

        // sum them all up
        resultTotal += rollsByType[dieType].reduce((prev,roll) => prev + roll, 0)
      });

    } else if (summaryMode === 'count') {
      Object.keys(rollsByType).forEach(dieType => {
        rollsByType[dieType].forEach(roll => {
          if (Math.abs(roll) >= summaryModeValue) resultTotal += 1
        })
      })
    }
  }

  // add the modifier to the end of all this
  resultTotal += modifier;

  // console.log('=======> total', resultTotal);
  return resultTotal
}

// turns rollDice data:
//  { '20': 1, '6': -2 ... }
// into "to-roll" data that looks like roll data but dice instead of results (so the summary can use either)
//  [
//    {'dieType': '20', 'count': '1'},
//    {'dieType': '6',  'count': '-2'}, ...
//  ]
export function diceDataIntoToRollData(diceData) {
  let toRollData = [];

  Object.keys(diceData).forEach(dieType => {
    const rollCount = Math.abs(diceData[dieType])
    // const rollSign = Math.sign(diceData[dieType])

    if ((parseDieType(dieType) || dieType === 'plus') && rollCount > 0) {
      toRollData.push({
        dieType: dieType,
        count: diceData[dieType],
      })
    }
  })

  return toRollData;
}

// turns to-roll or roll data:
//   [ {'dieType': '20', 'result': 1}, ... ]
//   - or -
//   [ {'dieType': '6', 'count': -2}, ... ]
// into a string that says what WILL BE or WAS rolled, e.g.
// 1d20               | 18
// 2d12 + 4           | 11 + 12 + 4
// 1d20 - 1d8         | 18 - 7
// Min (3d6)          | Min (3, 1, 5)
// Max (1d20) - (3d6) | Max (18) - (3, 1, 6)

export function getRollDescription(rollData, summaryMode, summaryModeValue) {
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
      modifier = parseInt(roll.result || roll.count || 0)

    } else {
      const prevGroup = resultsByType[roll.dieType] || []

      // already-rolled results
      if (roll.result) {
        resultsByType[roll.dieType] = [...prevGroup, Math.abs(roll.result)]
        signsByType[roll.dieType] = Math.sign(roll.result) // the whole group's should be the same

      // to-roll results
      } else if (roll.count) {
        const rollString = `${Math.abs(roll.count)}d${parseDieType(roll.dieType)}`
        resultsByType[roll.dieType] = [...prevGroup, rollString]
        signsByType[roll.dieType] = Math.sign(roll.count) // the whole group's should be the same
      }
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

  } else { // if (summaryMode === 'lowest' || summaryMode === 'highest') {
    sortedDieTypes.forEach(dieType =>
      resultsByType[dieType] = resultsByType[dieType].join(', ')
    )
  }

  // Wrap each group in parens, as necessary
  sortedDieTypes.forEach(dieType => {
    if (summaryMode !== 'total' || signsByType[dieType] < 0) {
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
  if (summaryMode === 'lowest') {
    if (summaryModeValue > 1) summaryString = `${summaryModeValue} ${summaryString}`
    summaryString = `Min ${summaryString}`
  }
  if (summaryMode === 'highest') {
    if (summaryModeValue > 1) summaryString = `${summaryModeValue} ${summaryString}`
    summaryString = `Max ${summaryString}`
  }
  if (summaryMode === 'count') {
    summaryString = `Count ${summaryModeValue}+ ${summaryString}`
  }

  return summaryString
}


// turns firebase action data back into native rollData
//  {
//    "roll-0": { dieType: "d20", result: 18 }
//    "roll-1": { dieType: "d6", result: 2 }
//  }
//  into:
//  [
//    {'dieType': '20', 'result': 18},
//    {'dieType': '6', 'result': 2}, ...
//  ]
export function firebaseActionDataIntoRollData(actionData) {
  let rollData = [];
  Object.keys(actionData).forEach(key => {
    if (key.startsWith('roll-')) rollData.push(actionData[key])
  });
  return rollData
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
