
### TODO

- paralyzation//assassin; all attacks are crits
- vulnerability, resistance, immunity
- uncanny dodge : be able to halve any roll
  (use as general case for saving throws, resistance)

- fix how damage is rounded down and added up; should be rounded down for each attack and show up as such in the subtotal

- refactor Character.jsx to bump all the important non-character things up to App or something

- load/save different characters
  (data validation; can't have a blank name)
  (make new characters)
  (delete old characters)
  (better design for the list; search box that live-filters)
  (recently-selected box)

- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  bug: saving-throw attacks should only add damage if there's at least 2 XdXs in the description (see:wolf, giant crab)

- Make online rooms so everybody can see the rolls

- reorganize so the controls for number of attacks in in the roll-attacks section, not the stat sheet


- maybe: auto-unselect all attacks for every roll? have to opt-in for them every time?
- bug: blanking out attack description text makes it un-re-editable
- setting: customize which icon shows up for natural 20s



-- SEE IF THIS WORKS BETTER:

- change "first hit" to "once per turn", just apply it on the first hit (or have that be additional)
	- bonus action for fighting makes things harder because there are different modifiers for the attacks
	- anything for two-weapon fighting will make it harder
	- could add sneak attack as a separate thing;; just attaches to the first roll

### COMMANDS

- npm start
- Stars a server

- npm run build
- Creates a production build
- Then copy all files in that folder to public_html/roll-to-hit
- Then move static and assets to just public_html/
