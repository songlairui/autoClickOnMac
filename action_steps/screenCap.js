const { spawnSync } = require('child_process')
const os = require('os')
const { resolve } = require('path')

if (process.platform !== 'darwin') {
  throw Error('只支持 macos')
}
let TMPDIR = process.env.TMPDIR

function screenCap(x, y, w, h) {
  let type = 'jpg'
  // 'png'
  let screenshotFile = resolve(TMPDIR, `tmp.${type}`)
  let process = spawnSync(
    'screencapture',
    ['-x', '-t', type, '-R', `${x},${y},${w},${h}`, screenshotFile]
  )
  return {
    code: process.status,
    screenshotFile
  }
}

module.exports = screenCap
