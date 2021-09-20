var wordList = [
'bear', 'bear', 'oat', 'tea', 'soft', 'willow', 'toad', 'doll', 'flower', 'peach', 'milky', 'dream', 'spring', 'kitty', 'pixie', 'fairy', 'fae',
'sargasso', 'sea', 'brood', 'conflate', 'demure', 'dulcet', 'elixir', 'eloquent', 'ephemeral', 'epiphany', 'ethereal', 'evanescent', 'evocative', 'fetching', 'felicity', 'furtive', 'glamour', 'gossamer', 'harbinger', 'labyrinth', 'lagoon', 'languor', 'lilt', 'lithe', 'love', 'murmur', 'nemesis', 'opulent', 'penumbra', 'plethora', 'ripple', 'susurrous', 'talisman', 'umbrella', 'vestige',
'cerulean', 'mist', 'serene', 'form', 'lake', 'art', 'ideal','dream','gentle','treasure','life','gem','serpent','wonder','sculpt',
'mother','passion','smile','eternity','fantastic','destiny','freedom','tranquil',
'fawn','dawn','chalice','anemone','tranquil','hush','golden','halcyon','thrush','chime','murmuring','lullaby','luminous','melody','marigold','tendril','mist','oleander','rosemary',
'bubble','pod','handmade','renew','empathy','luminous','musical','angel','loss','comfort','kindness','timeless','ancient','wick','olive','gilded','shade',
'fresh','sun','fragrant','bloom','blossom','growth','dormant','divine','friend','statue','lost',
'leaf','fruit','plant','soil','bulb','landscape','herb','acorn','berry','sunny','kiss','crisp','wind',
'jazz','blues','folk','territory','valence','clementine','leap','acre','ballad','vermillion','seaside','gravity',
'briar','blueberry','palace','dusk','symphony','hex','cadence','weight',
'waltz','tango','cache','heart','thorn','ibex','bribe','crown','dust','echo','tender','fourteen','fifteen','garden','grand','gumption',
'olive','salmon','tarot','balm','jupiter','athena','table',
'golden','silver','emerald','ruby','sapphire','rose','opal','iris',
'like', 'lichen', 'pickman', 'green', 'slumber', 'folly', 'beast', 'bell', 'candle', 'wax', 'root', 'curse',
];

function words(options) {

  function word() {
    if (options && options.maxLength > 1) {
      return generateWordWithMaxLength();
    } else {
      return generateRandomWord();
    }
  }

  function generateWordWithMaxLength() {
    var rightSize = false;
    var wordUsed;
    while (!rightSize) {
      wordUsed = generateRandomWord();
      if(wordUsed.length <= options.maxLength) {
        rightSize = true;
      }

    }
    return wordUsed;
  }

  function generateRandomWord() {
    return wordList[randInt(wordList.length)];
  }

  function randInt(lessThan) {
    return Math.floor(Math.random() * lessThan);
  }

  // No arguments = generate one word
  if (typeof(options) === 'undefined') {
    return word();
  }

  // Just a number = return that many words
  if (typeof(options) === 'number') {
    options = { exactly: options };
  }

  // options supported: exactly, min, max, join
  if (options.exactly) {
    options.min = options.exactly;
    options.max = options.exactly;
  }

  // not a number = one word par string
  if (typeof(options.wordsPerString) !== 'number') {
    options.wordsPerString = 1;
  }

  //not a function = returns the raw word
  if (typeof(options.formatter) !== 'function') {
    options.formatter = (word) => word;
  }

  //not a string = separator is a space
  if (typeof(options.separator) !== 'string') {
    options.separator = ' ';
  }

  var total = options.min + randInt(options.max + 1 - options.min);
  var results = [];
  var token = '';
  var relativeIndex = 0;

  for (var i = 0; (i < total * options.wordsPerString); i++) {
    if (relativeIndex === options.wordsPerString - 1) {
      token += options.formatter(word(), relativeIndex);
    }
    else {
      token += options.formatter(word(), relativeIndex) + options.separator;
    }
    relativeIndex++;
    if ((i + 1) % options.wordsPerString === 0) {
      results.push(token);
      token = '';
      relativeIndex = 0;
    }

  }
  if (typeof options.join === 'string') {
    results = results.join(options.join);
  }

  return results;
}


const randomWords = (options) => {
  return words(options);
}

export {randomWords};
