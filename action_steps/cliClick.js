const { spawnSync } = require('child_process')

function cliClick(x,y){

	// return 0
let process = spawnSync('cliclick',[
	`c:${x},${y}`
	])
	
	return process.status
}

module.exports = cliClick