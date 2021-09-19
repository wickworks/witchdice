

#### EXIST-IN-THE-WORLD ####
- PWA worker??

###### LAYOUT #######
- make bookmarks system work for mobile
- be able to clear things you just rolled; keep the x button on dicebag results

- people keep not realizing that they need to toggle HIT->MISS for 5e.
  - make the design more explicit -- OR -- add some tutorial

##### FEATURES ######
- "calculate average damage" for a roll instead of having to click through it

- recent-monsters list behaves oddly when the recent queue is filled all up.
- it also apparently acts differently between hitting backspace and pressing the X

- option to do d20 + max(other things)
- dX dice?
- "success dice" -- dice matching, or "x above this"
- sound fx for dice rolls
- be able to clear dicebag/roll history (with a confirm dialogue)

- be able to click initiative names to bring up that character's sheet
- be able to rearrange 5e attacks

- themes e.g. dark mode
- YES effect; opposite of the xcard, confetti or something
- allow apostrophes in names

- Auth system: conference-room rules.
  If you're the first to show up to a room, it's yours.
  If there is anyone in it already, they need to give you the thumbs-up.
    (waiting & cancel button on newcomer, confirm & requester name on all occupants)
  All rooms are cleared out twelve hours after the last message is sent on them.
  Be able to go straight to the room by visiting the room url


###### TECHNICAL ######
- move all the dicebag stuff into its own folder and roll history stuff into its own folder

- validation for damage number inputs
- Firbase-side validate room/person name; must be length X & are only letters

- rename the party roll/action stuff to make it more consistant
- fonts aren't working on older firefox


#### DND MECHANICS ####
- have active attacks get cleared on a roll. just have them be local state, default false, instead of stored as part of the attack data.

- paralyzation//assassin; all attacks are crits. be able to set any attack to be a crit (or toggle a crit off)

- spell triggered effects aren't being automatically generated

- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)
  (add other statistics)
  ("if fails by 5 or more" saving throws, see drow)


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

# start and view the local firebase emulator
firebase emulators:start --only database
http://localhost:4000

# prep for deploy
update ChangeLog.jsx and version.js
npm run build

# preview the deploy
firebase hosting:channel:deploy eye-of-newt

# actually deploy
firebase deploy
