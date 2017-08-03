const genScreenshot = require('../action_steps/genScreenshot')

const fs = require('fs')
const path = require('path')
const jpeg = require('jpeg-js')
// const screenCap = require('../action_steps/screenCap')
const isThisArea = require('../identity/isThisArea')

const { buttons } = require('../action_steps/uiConfig.js')

// Object.keys(buttons).reduce((_, areaName) => {
//   if (areaName && !buttons[areaName][4]) {
//     let { result, confidence, diff } = isThisArea(areaName, shotRaw)
//     console.info(areaName, result, confidence, diff)
//   }
// }, null)

module.exports = readyForAction

function readyForAction(areaName) {

  let { code, screenshotFile } = genScreenshot() //screenCap(0, 0, 600, 300)
  // console.info(code, screenshotFile)
  let shotRaw = jpeg.decode(fs.readFileSync(path.resolve(screenshotFile)))
  let { result, confidence, diff } = isThisArea(areaName, shotRaw)
  // console.info(result, confidence, diff)

  return result
}
