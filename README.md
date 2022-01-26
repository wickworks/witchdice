
### TO-DO ###

List is at https://trello.com/b/e24TNiu1/witchdice




### COMMANDS ###

# start local server
npm start

# start and view the local firebase emulator
firebase emulators:start --only database
http://localhost:4000

# prep for deploy
update ChangeLog.jsx and version.js
npm run build
move deployed branch up to main

# preview the deploy
firebase hosting:channel:deploy eye-of-newt

# actually deploy
firebase deploy
