
### TODO

- paralyzation//assassin; all attacks are crits
- vulnerability, resistance, immunity
- uncanny dodge : be able to halve any roll
  (use as general case for saving throws, resistance)

- fix how damage is rounded down and added up; should be rounded down for each attack and show up as such in the subtotal

- load/save different characters
  (data validation; can't have a blank name)

- import the monster manual
  (add legendary actions)
  (add special_abilities e.g. sneak attack 1/turn)
  (die-less damage rolls don't work; see crab)

- Make online rooms so everybody can see the rolls

- animate new rolls coming in a la pivotal tracker changes

- new favicon

- reorganize so the controls for number of attacks in in the roll-attacks section, not the stat sheet

- maybe: auto-unselect all attacks for every roll? have to opt-in for them every time?
- setting: customize which icon shows up for natural 20s

- bug: animation fading of showing math for die roll doesn't work on production MYSTERIOUSLY, just disabled it
  -- biZARRE, I think it was reading "opacity: 100%" as "opacity: 1%". ?_?
  -- need to change values to 1.0 instead of 100%

- someday: switch away from the heavy firebase server to a lightweight peer-to-peer network


-- SEE IF THESE WORKS BETTER: ---
- change "first hit" to "once per turn", just apply it on the first hit (or have that be additional)
	- bonus action for fighting makes things harder because there are different modifiers for the attacks
	- anything for two-weapon fighting will make it harder
	- could add sneak attack as a separate thing;; just attaches to the first roll

### COMMANDS

- npm start
- Stars a server

- npm run build
- Creates a production build
- Then copy all files in build/ to public_html/roll-to-hit on the server
- Then move static and assets to just public_html/
