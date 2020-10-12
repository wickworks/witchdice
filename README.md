
### TODO



- can crit/half abilities in the roller
- party roller shows advantage/disadvantage
- Optimize firebase to not re-download all rolls every change
- add a big plus for new character in empty character list
- data validation; can't have a blank character name
- fix how damage is rounded down and added up; should be rounded down for each attack and show up as such in the subtotal
- better responsive design for damage edit




- paralyzation//assassin; all attacks are crits
- vulnerability, resistance, immunity
- uncanny dodge : be able to halve any roll
  (use as general case for saving throws, resistance)

- Firbase-side validate room/person name; must be length X & are only letters
  Auth system: conference-room rules.
  If you're the first to show up to a room, it's yours.
  If there is anyone in it already, they need to give you the thumbs-up.
    (waiting & cancel button on newcomer, confirm & requester name on all occupants)
  All rooms are cleared out twelve hours after the last message is sent on them.

- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)

- monster search: don't show any until search filter applied. Add to front of recent list if searching, otherwise perserve recent list order. Clear filter after clicking monster while filtering

- turn "party rolls" into roll history for single-player

- import spells




- someday: switch away from the heavy firebase server to a lightweight peer-to-peer network

- maybe: auto-unselect all attacks for every roll? have to opt-in for them every time?
- setting: customize which icon shows up for natural 20s


- sort abilities to end of roll list


### COMMANDS

- npm start
- Stars a server

- npm run build
- firebase deploy
