const path = require('path')
const fs = require('fs')
const jpeg = require('jpeg-js')

const getBinaryRaw = require('./getBinaryRaw')
const resizeRaw = require('./resizeRaw')
const getCropRaw = require('./getCropRaw')

let debug = false

let stdFolder = '../identify_steps/origin'

// let areaName = '御魂'

module.exports = isThisArea

function isThisArea(areaName, shotRaw) {
  let stdFile = path.resolve(stdFolder, areaName + '.ok.jpg')
  if (!fs.existsSync(stdFile)) {
    console.log('未捕捉标准文件')
    return { result: undefined, confidence: undefined }
  }

  let areaRaw = getCropRaw(areaName, shotRaw)
  let stdRaw = jpeg.decode(fs.readFileSync(stdFile))

  // console.info(areaRaw,stdRaw)

  return diff([areaRaw, stdRaw], 32, areaName)
}

function diff([rawA, rawB], rSize, areaName) {
  rSize = rSize || 32
  // output =
  //   output || 'diff' + rSize + '-' + Math.floor(Math.random() * 100) + '.jpg'
  if (!rawA || !rawB) {
    return console.info('unable to contract')
  }
  let rawA1 = resizeRaw(rSize, rawA)
  let rawB1 = resizeRaw(rSize, rawB)
  let raw1 = getBinaryRaw(rawA1)
  let raw2 = getBinaryRaw(rawB1)

  let dThreshold =
    (raw1.threshold - raw2.threshold) * (raw1.threshold - raw2.threshold)

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

  let diff = Math.floor(dots / length * 1000)
  // 千分之400 图片不一样
  // 450 不一样，开始不确定
  // 300 0
  // 250 一样 ，开始不确定
  // 千分之10  图片一样

  let confidence, result
  if (dThreshold > 200) {
    confidence = 1
    result = false
  } else {
    confidence = (diff - 300) / 150
    confidence = Math.floor(confidence * confidence * 10000) / 10000
  }

  if (confidence < 0.4) {
    // 对 闽值差进行加权， 闽值差小，表示很可能相等，闽值差较大，说明色调很可能不一致
    confidence = (diff - (100 - dThreshold) - 300) / 150
    confidence = Math.floor(confidence * confidence * 10000) / 10000
  }

  result = result === undefined ? diff < 300 : result
  
  if (confidence > 1) confidence = 1

  if (/*confidence < 0.5*/ areaName === '开始') {
    writeRawIMG(rawA, 'src1')
    writeRawIMG(rawB, 'std1')
    writeRawIMG(rawA1, 'src2')
    writeRawIMG(rawB1, 'std2')
    writeRawIMG(raw1, 'src3')
    writeRawIMG(raw2, 'std3')
    writeRawIMG(rawData, 'diff')
  }
  // console.info(dots, length, diff)
  return { result, confidence, diff, dThreshold }
}

function writeRawIMG(rawImage, output) {
  let jpegData = jpeg.encode(rawImage, 100)

  let targetFile = './debug-' + output + '.jpg'
  fs.writeFileSync(targetFile, jpegData.data)
  console.info('输出了 ', targetFile)
}
