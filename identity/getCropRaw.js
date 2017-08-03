const defaultWidth = 603
const { buttons } = require('../action_steps/uiConfig.js')

module.exports = getCropRaw

function getCropRaw(btnName, { width, height, data }) {
  if (!btnName) return console.error('no inputs')
  if (!buttons.hasOwnProperty(btnName)) return console.error('no configs')

  let ratio = width / defaultWidth
  let [x, y, w, h] = buttons[btnName].map(v => Math.floor(v * ratio))
  let frameData = new Buffer(w * h * 4)
  for (let i = w - 1; i >= 0; i--) {
    for (let j = h - 1; j >= 0; j--) {
      let srcIdx = (y + j) * width * 4 + (x + i) * 4
      let tmpIdx = j * w * 4 + i * 4
      frameData[tmpIdx] = data[srcIdx]
      frameData[tmpIdx + 1] = data[srcIdx + 1]
      frameData[tmpIdx + 2] = data[srcIdx + 2]
      frameData[tmpIdx + 3] = data[srcIdx + 3]
    }
  }

  console.info(`-               cropRaw -${btnName} , ${w} - ${h} `)
  return {
    width: w,
    height: h,
    data: frameData
  }
}
