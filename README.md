
### TODO

- paralyzation//assassin; all attacks are crits
- vulnerability, resistance, immunity
- uncanny dodge : be able to halve any roll
  (use as general case for saving throws, resistance)

- fix how damage is rounded down and added up; should be rounded down for each attack and show up as such in the subtotal

- data validation; can't have a blank character name

- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)

- monster search: don't show any until search filter applied. Add to front of recent list if searching, otherwise perserve recent list order. Clear filter after clicking monster while filtering
- add a big plus for new character in empty character list

- turn "party rolls" into roll history for single-player

- import spells

- can crit/half abilities in the roller
- party roller shows advantage/disadvantage

- Optimize firebase to not re-download all rolls every change

- someday: switch away from the heavy firebase server to a lightweight peer-to-peer network

- It looks like you're using the development build of the Firebase JS SDK.
When deploying Firebase apps to production, it is advisable to only import
the individual SDK components you intend to use.

- reorganize so the controls for number of attacks in in the roll-attacks section, not the stat sheet

- maybe: auto-unselect all attacks for every roll? have to opt-in for them every time?
- setting: customize which icon shows up for natural 20s



------------ TWEAKS ----------
- sort abilities to end of roll list
- clean up unused vars
- new favicon
- animate new rolls coming in a la pivotal tracker changes


### COMMANDS

- npm start
- Stars a server

- npm run build
- firebase deploy
