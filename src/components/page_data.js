
// TO ADD A PAGE:
// - add it to allPages, below
// - add the route to Main.jsx

const allPages = [
  {
    id: 'simple',
    title: 'Simple',
    desc: 'Just a bag of dice & a table to share.',
    defaultEnabled: true,
    metaTitle: 'Witch Dice ~ cute dice roller',
    metaDesc: 'A cute & elegant online dice roller for playing tabletop games online with friends.'
  },{
    id: '5e',
    title: 'D&D 5e',
    desc: 'Damage roller and initiative tracker for D&D 5e.',
    defaultEnabled: true,
    metaTitle: 'Witch Dice ~ D&D 5e damage roller',
    metaDesc: 'Dice roller for D&D 5e that takes the math out of combat. Press a button and get instant results.',
  },{
    id: 'craft',
    title: 'Witch+Craft',
    desc: 'Crafting and domestic magic system for D&D 5e.',
    defaultEnabled: false,
    metaTitle: 'Witch Dice ~ Witch+Craft character sheet',
    metaDesc: 'Character sheet and crafting roller for the Witch+Dice 5e crafting and domestic magic module',
  },{
    id: 'settings',
    title: 'Settings',
    desc: 'Settings, tips, and tricks.',
    defaultEnabled: true,
    metaTitle: 'Witch Dice ~ settings',
    metaDesc: 'A cute & elegant online dice roller for playing tabletop games online with friends.',
  }
]

function allPageIds() {
  return allPages.map(page => page.id)
}

function getPage(pageID) {
  return allPages.find(page => page.id === pageID)
}

// settings are saved in an object e.g. {'simple': true, '5e': true, 'craft': false}
const SETTINGS_ENABLED_PAGES = 'settings-enabled-pages';

// Returns a hash of pages enabled by default
function defaultEnabledPages() {
  let enabledPages = {};
  allPages.forEach(page => enabledPages[page.id] = page.defaultEnabled)
  return enabledPages
}

// Returns a hash of currently-enabled pages
function loadEnabledPages() {
  // start with the defaults
  let enabledPages = defaultEnabledPages()

  // then override with any saved settings (so if we someday add a new page, it will still be returned)
  const savedString = localStorage.getItem(SETTINGS_ENABLED_PAGES)
  if (savedString) {
    const savedPages = JSON.parse(savedString)
    Object.keys(savedPages).forEach(pageID => enabledPages[pageID] = savedPages[pageID])
  }

  // console.log('loaded enabled pages:', enabledPages);

  return enabledPages;
}

// saved a page to be enabled/disabled to localstorage
function saveEnabledPages(enabledPages) {
  localStorage.setItem(SETTINGS_ENABLED_PAGES, JSON.stringify(enabledPages))
}


export {
  allPages,
  allPageIds,
  getPage,
  loadEnabledPages,
  saveEnabledPages
}
