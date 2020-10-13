
### TODO


- Optimize firebase to not re-download all rolls every change
- better responsive design for damage edit


- nest roll rooms in firebase
- validation on # die rolls
- collapsible dice bag/party menu
- add modifiers to dicebag rolls

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

- import spells
- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)
- monster search: don't show any until search filter applied. Add to front of recent list if searching, otherwise perserve recent list order. Clear filter after clicking monster while filtering

- turn "party rolls" into roll history for single-player

- someday: switch away from the heavy firebase server to a lightweight peer-to-peer network

- setting: customize which icon shows up for natural 20s
- sort abilities to end of roll list
- themes e.g. dark mode

### COMMANDS

- npm start
- Stars a server

- npm run build
- firebase deploy
