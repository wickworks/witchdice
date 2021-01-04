
const blankDice = {
  '4': 0,
  '6': 0,
  '8': 0,
  '10': 0,
  '12': 0,
  '20': 0,
  'plus': 0,
}

function getToRollString(diceData, summaryMode, percentileMode) {
  diceData = {...diceData} // don't modify the original

  // hijack d10s in percentile mode
  const percentileAvailable = (diceData['10'] === 2);
  if (percentileAvailable && percentileMode) {
    diceData['10'] = 0;
    diceData['100'] = 1;
  }

  const toRollArray = sortedDice(diceData)
    .map(dieType => {
      const dieCount = diceData[dieType]
      if (dieCount > 0 && parseInt(dieType)) {
        return `${dieCount}d${dieType}`
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

// d20 -> d4, then plus
function sortedDice(diceData) {
  let sorted = Object.keys(diceData).sort((a, b) => {
    return (parseInt(a) > parseInt(b)) ? -1 : 1
  });

  // this returns different results on different browsers (???) so we need to then cherry-pick
  sorted.splice( sorted.indexOf('plus'), 1);
  sorted.push('plus');

  return sorted;
}




export {
  blankDice,
  getToRollString,
  getResultsSummary,
  sortedDice,
};
