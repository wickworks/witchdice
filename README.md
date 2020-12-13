

#### EXIST-IN-THE-WORLD ####

- PWA worker??

###### LAYOUT #######
- have a dice summary for what was rolled : [10d6]
- "I assumed that I was already in the room when I joined" >> how to make status clear? Should probably auto-join when following a link in.

- remove the skull dice that glorify critical hits? How do I de-glorify the violence of a violence calculator?
- add a "feedback" form or email address -- encourage people to recommend links to things that help decolonize the damn thing
- collapsible dice bag/party menu (or rearrange the whole thing again)
- sort abilities to end of roll list

- put "damage" back into the damage summary line?
- applies conditions >>> just say what the condition is
- remove checkmark/trash for damage sources, use trash gutter & close by clicking off of it instead.
- let people put in their name to auto-join when they come in via a url (integrate with "asking for permission to join")

##### FEATURES ######
- add modifiers to dicebag rolls
  - under total/high/low
  - inside a collapsible options menu
  - as a textbox with increase/decrease buttons?

- d2 and d100, and a dX

- X-card raised :::: anonymous or not

- do an ACCESSIBILITY PASS; be able to tab through it all easily
- make the background a sketch pad -- or just have a notepad panel that saves to session storage

- saving complicated expressions for re-rolling
- sound fx for dice rolls

- themes e.g. dark mode
- hover over dice bag buttons for a second to show which type of die it is (replace image)
- setting: customize which icon shows up for natural 20s

###### TECHNICAL ######

- when you show up with a room in the url, automatically join that room instead of just filling it in

- only process the monster srd once we enter 5e mode
- rename the party roll/action stuff to make it more consistant
- validation for damage number inputs
- Firbase-side validate room/person name; must be length X & are only letters
  Auth system: conference-room rules.
  If you're the first to show up to a room, it's yours.
  If there is anyone in it already, they need to give you the thumbs-up.
    (waiting & cancel button on newcomer, confirm & requester name on all occupants)
  All rooms are cleared out twelve hours after the last message is sent on them.
  Be able to go straight to the room by visiting the room url

- someday: switch away from the heavy firebase server to a lightweight peer-to-peer network
- clear out data on firebase periodically even if nobody has visited that room in a long time



#### DND MECHANICS ####
- bug with triggered attacks: fireball, then an ice knife causes the triggered one to always show up
- paralyzation//assassin; all attacks are crits

- import spells
- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)
  (add other statistics)
  ("if fails by 5 or more" saving throws, see drow)
- monster search: don't show any until search filter applied. Add to front of recent list if searching, otherwise perserve recent list order. Clear filter after clicking monster while filtering

- vulnerability, resistance, immunity

#### WITCH+CRAFT MECHANICS ####
- push to roll history


#### other games ####
- Lancer?
- Royal game of UR
- swordsfall?

### Antiracism corner ####


- add in helpful pointers for how to de-colonialize dnd
  - orcs & goblins: recommend hobgoblins, it's the season to punch nazis
  - somehow recommend the class-base attribute system
  - drow; all races are evil? how to better handle "evil" societies

- https://jamesmendezhodes.com/blog/2019/1/13/orcs-britons-and-the-martial-race-myth-part-i-a-species-built-for-racial-terror
  - great breakdown of the history of orcs
  - Orcs punch Nazis.      YEAAAAAAAAAAAAAAAH <3 <3

- https://pocgamer.com/2019/08/02/decolonization-and-integration-in-dd/
  - With the Half and Lineage races, the first step to decolonization and integration is to STOP CALLING THEM HALF-WHATEVER
  - Remember that if players and DMs can tell the difference between villainous humans and non-villainous humans, they can do the same with Orcs and Goblins.

- https://writingalchemy.net/resources/decolonizing-games-resource-list/
 - GREAT list of actionable further reading

- https://sleepyspoonie.tumblr.com/post/161772119491
  - disability mecahnics

- https://goatsongrpg.wordpress.com/2018/10/22/how-to-make-your-game-anti-fascist/
  - The key to making violence in a game unpalatable to fascists is to make it unheroic. In fascist ideology, the dealer of violence is a great man, a hero to be looked up to, someone who cuts through the polite niceties of society to achieve their goals. Violence is seldom this way in real life. Real violence is uncomfortable and difficult and is seldom applauded, and is never applauded by all.

My understanding of the primary problems in DnD:

1. Race mechanics. It is, at its core, old racist bioessentialist pseudoscience. The history is clear.
  - nk jemison says that it's not worth even engaging; any kind of internalization and digestion and output of something better (culturally-distinct empathetic orcs who punch nazis) is worse than telling your own stories from scratch. It's the Kamigawa problem; why would you handicap yourself from the outset instead of making something new?
  - my answer for WITCH DICE: to come to people where they're at and give them a gateway to someplace better. This isn't everybody's work; *my* job is to become a bridge to those other, better, worlds and stories.
  - hotpatch: background/culture attribute bonuses instead of racial ones, overhaul how half-X races are handled.

2. Violence. Dnd glorifies violence. It reiterates the permissability of violence against the Other. It practices us in dehumanizing others so we may kill them and take their things.
  - hotpatch: flesh out non-combat mechanics. WITCH + CRAFT. Complex skill checks.
  - WITCH DICE: show them other games to play. tools for those games && links to podcasts of such.


### COMMANDS

# start local server
npm start

# prep for deploy
npm run build

# preview the deploy
firebase hosting:channel:deploy eye-of-newt

# actually deploy
firebase deploy
