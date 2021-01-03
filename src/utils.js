
function deepCopy(inObject) {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    // console.log('ERROR: attempting to copy this not-object:', inObject);
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value)
  }

  return outObject
}

function getRandomInt(max) {
  if (max === 0) {return 0}
  return Math.floor(Math.random() * Math.floor(max)) + 1;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// The react-select wants us to pass in the ENTIRE option from above to be selected, not just the value.
// However, I don't want to store its weird-ass special object. We can just retrieve it with the key here.
function getOptionFromValue(options, value) {
  if (!Array.isArray(options)) { return null }

  var result = options.find(option => {
    return option.value === value
  })
  return result;
}

export {deepCopy, getRandomInt, capitalize, getOptionFromValue} ;
