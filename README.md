
### TO-DO ###

List is at https://trello.com/b/e24TNiu1/witchdice




### COMMANDS ###

# start local server
npm start
http://localhost:3000

# start and view the local firebase emulator
firebase emulators:start --only database
http://localhost:4000

# prep for deploy
update ChangeLog.jsx and version.js and owlbear_ext/manifest.js
make a version commit
move deployed branch up to main
npm run build

# preview the deploy
firebase hosting:channel:deploy eye-of-newt

# actually deploy
firebase deploy

### NEW ENVIRONMENT ###
- running on node v16.13.2
- create a .env file in the root directory:
REACT_APP_COMPCON_API_KEY=xxxxx
