const { spawnSync } = require('child_process')
const getParam = require('./getVysorSizeAndPosition')
const activeVysor = require('./activeVysor')
const screenCap = require('./screenCap')

const windowHeight = {
  title: 22,
  header: 58 - 22,
  content: 397 - 58,
  footer: 445 - 397
}

module.exports = genScreenshot

function genScreenshot() {
  let params = getParam()
  // console.info(JSON.stringify(params))
  if (!params) throw new Error('未获取参数')

  activeVysor()

  return screenCap(
    params.x,
    params.y + windowHeight.title + windowHeight.header,
    params.w,
    params.h - windowHeight.title - windowHeight.header - windowHeight.footer
  )
}
