
### TO-DO ###

List is at https://trello.com/b/e24TNiu1/witchdice




### COMMANDS ###

# start local server
npm start
http://localhost:5173/

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
- create a .env file in the root directory:
VITE_COMPCON_API_KEY=xxxxx


### TO TEST ON OWLBEAR ###
- deploy to the eye-of-newt preview server
- install that /owlbear_ext/manifest.json file on owlbear
- may have to hard refresh to see the new version on owlbear
