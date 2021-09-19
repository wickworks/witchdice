
const blankDice = {
  '4': 0,
  '6': 0,
  '8': 0,
  '10': 0,
  '12': 0,
  '20': 0,
  'plus': 0,
  'x': 0,   // becomes e.g. 'x3' for variable dice
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

      if (dieCount > 0 && dieTypeNumber) {
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

function getResultsSummary(rollData, summaryMode) {
  let runningTotal = 0
  let highest = 0
  let lowest = 999999
  let modifier = 0
  let resultArray = []
  rollData.forEach((roll) => {
    if (roll.dieType !== 'plus') {
      resultArray.push(roll.result)
      runningTotal += roll.result
      highest = Math.max(highest, roll.result)
      lowest = Math.min(lowest, roll.result)
    } else {
      modifier = roll.result // modifier is handled different in different roll modes
    }
  });

  let resultTotal = 0
  let resultSummary = ''
  if (summaryMode === 'total') {
    resultTotal = runningTotal + modifier
    resultSummary = resultArray.join(' + ')
  } else if (summaryMode === 'low') {
    resultTotal = lowest + modifier;
    resultSummary = resultArray.join(', ')
  } else if (summaryMode === 'high') {
    resultTotal = highest + modifier;
    resultSummary = resultArray.join(', ')
  }
  if (modifier !== 0) resultSummary = `( ${resultSummary} ) ${modifier > 0 ? '+' : ''} ${modifier}`

  if (summaryMode === 'low') resultSummary = 'Min: ' + resultSummary
  if (summaryMode === 'high') resultSummary = 'Max: ' + resultSummary

  return {total: resultTotal, summary: resultSummary}
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
};
