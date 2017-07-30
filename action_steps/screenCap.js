const { spawnSync } = require('child_process')

function screenCap(x,y,w,h){

	let type =  'jpg' 
	// 'png' 

let process = spawnSync('screencapture',[
	'-x',
	'-t',
	type,
	'-R',
	`${x},${y},${w},${h}`,
	`./tmp.${type}`
	])

	return process.status
}

module.exports = screenCap