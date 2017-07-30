const { spawnSync } = require('child_process')

function activeVysor(){
	
let process = spawnSync('osascript',[
	'-e','tell application "Vysor"',
	'-e','activate',
	'-e','end tell'
])

return process.status
}

module.exports = activeVysor

// activeWindow()