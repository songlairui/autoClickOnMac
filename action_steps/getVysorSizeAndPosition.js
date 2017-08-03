const { spawnSync } = require('child_process')

function getXYWH() {
  let processOSA = spawnSync('osascript', [
    '-e',
    'tell application "System Events"',
    '-e',
    'repeat with one in window of application process "Vysor"',
    '-e',
    'tell window one',
    '-e',
    'set tmpName to name of one',
    '-e',
    'if tmpName is "PRO 5" then',
    '-e',
    'set the props to get the properties of one',
    '-e',
    'set result to {position,size} of props',
    '-e',
    'return result',
    '-e',
    'end if',
    '-e',
    'end tell',
    '-e',
    'end repeat',
    '-e',
    'end tell'
  ])

  if (processOSA.status !== 0) {
    return null
	}
	
  let values = processOSA.stdout
    .toString()
    .replace(/[\s\n]/g, '')
    .split(',')
    .map(v => +v)
  let keys = ['x', 'y', 'w', 'h']
  let result = {}

  for (var i = keys.length - 1; i >= 0; i--) {
    result[keys[i]] = values[i]
  }
  return result
}

module.exports = getXYWH
