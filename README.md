


#### EXIST-IN-THE-WORLD ####

- put together a how-to imgur album with gifs
- send the tip jar towards a charity, count the number of clicks on it somehow

###### LAYOUT #######

- collapsible dice bag/party menu (or rearrange the whole thing again)
- sort abilities to end of roll list

- remove checkmark/trash for damage sources, use trash gutter & close by clicking off of it instead.

##### FEATURES ######
- be able to go straight to a room via a url

- make the background a sketch pad
- add modifiers to dicebag rolls

- themes e.g. dark mode
- hover over dice bag buttons for a second to show which type of die it is (replace image)
- setting: customize which icon shows up for natural 20s

###### TECHNICAL ######
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
- import spells
- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)
- monster search: don't show any until search filter applied. Add to front of recent list if searching, otherwise perserve recent list order. Clear filter after clicking monster while filtering
- paralyzation//assassin; all attacks are crits
- vulnerability, resistance, immunity







### domain names

rolltohit.app
rollwith.love
rolldice.live

dicetable.app
dicefriend.app
rollcubes.app
rollcubes.live
diceroll.live
dicebag.games
dicefriend.live
rollfriend.app


rollwithlove.app


### COMMANDS

- npm start
- Stars a server

- npm run build
- firebase deploy
