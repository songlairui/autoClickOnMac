const path = require('path')
const fs = require('fs')
const jpeg = require('jpeg-js')

const getBinaryRaw = require('./getBinaryRaw')
const resizeRaw = require('./resizeRaw')
const getCropRaw = require('./getCropRaw')

let stdFolder = '../identify_steps/origin'

// let areaName = '御魂'

module.exports = isThisArea

function isThisArea(areaName, shotRaw) {
  let stdFile = path.resolve(stdFolder, areaName + '.ok.jpg')
  if (!fs.existsSync(stdFile)) {
    return console.log('未捕捉标准文件')
  }

  let areaRaw = getCropRaw(areaName, shotRaw)
  let stdRaw = jpeg.decode(fs.readFileSync(stdFile))

  // console.info(areaRaw,stdRaw)

  return diff([areaRaw, stdRaw], 16)
}

function diff([rawA, rawB], rSize, output) {
  rSize = rSize || 32
  // output =
  //   output || 'diff' + rSize + '-' + Math.floor(Math.random() * 100) + '.jpg'
  if (!rawA || !rawB) {
    return console.info('unable to contract')
  }
  raw1 = getBinaryRaw(resizeRaw(rSize, rawA))
  raw2 = getBinaryRaw(resizeRaw(rSize, rawB))

  let length = raw1.width * raw1.height

  let diffRaw = new Buffer(length * 4)

  let dots = 0
  for (let i = 0; i < length; i++) {
    if (raw1.data[i * 4] !== raw2.data[i * 4]) {
      dots++
      diffRaw[i * 4] = 0
      diffRaw[i * 4 + 1] = 0
      diffRaw[i * 4 + 2] = 0
    } else {
      diffRaw[i * 4] = 255
      diffRaw[i * 4 + 1] = 255
      diffRaw[i * 4 + 2] = 255
    }
    diffRaw[i * 4 + 3] = 255
  }
  let rawData = {
    width: raw1.width,
    height: raw1.height,
    data: diffRaw
  }
  let jpegData = jpeg.encode(rawData, 100)

  if (output) {
    fs.writeFileSync(output, jpegData.data)
  }
  let diff = Math.floor(dots / length * 1000)
  // 千分之400 图片不一样
  // 250 不一样，开始不确定
  // 150 0
  // 50 一样 ，开始不确定
  // 千分之10  图片一样
  let confidence = (diff - 150) / 100
  confidence = confidence * confidence
  if (confidence > 1) confidence = 1
  let result = diff < 150
  // console.info(dots, length, diff)
  return { result, confidence }
}
