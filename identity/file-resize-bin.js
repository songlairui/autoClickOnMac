let file = '../identify_steps/origin/BACK.ok.jpg'
let file1 = '../identify_steps/origin/BACK.jpg'
let file2 = '../identify_steps/origin/BACK.0.jpg'
let file3 = '../identify_steps/test/痴之阵.jpg'
let file4 = '../identify_steps/origin/痴之阵.jpg'
let file5 = '../identify_steps/origin/痴之阵.ok.jpg'

const path = require('path')
const fs = require('fs')
const jpeg = require('jpeg-js')

const getBinaryRaw = require('./getBinaryRaw')
const resizeRaw = require('./resizeRaw')
const getCropRaw = require('./getCropRaw')

let stdFolder = '../identify_steps/origin'
let screenshot = '../identify_steps/tmp.jpg'



let areaName = '御魂'
let stdFile = path.resolve(stdFolder,areaName + '.ok.jpg')
if(!fs.existsSync(stdFile)){
  return console.log('未捕捉标准文件')
}
let shotRaw = jpeg.decode(fs.readFileSync(path.resolve(screenshot)))

let areaRaw = getCropRaw(areaName,shotRaw)
let stdRaw = jpeg.decode(fs.readFileSync(stdFile))

// console.info(areaRaw,stdRaw)

diff([areaRaw,stdRaw],16)
console.info('ok')
return 


let rSize 

if (!Number.isNaN(+process.argv[2])) {
  console.info(+process.argv[2])
  rSize = +process.argv[2]
} else {
  console.info(process.argv[2])
  rSize = 62
}

// diff([file3, file5], rSize)
// diff([file3, file4], rSize)
// diff([file5, file4], rSize)
// diff([file, file2], rSize)
// diff([file1, file2], rSize)

function main(file, rSize) {
  rSize = rSize || 32
  let raw1 = jpeg.decode(fs.readFileSync(file))
  let raw2 = resizeRaw(rSize, raw1)
  let raw3 = getBinaryRaw(raw2)
  // console.info(raw3)
  return raw3
}

function diff([rawA, rawB], rSize, output) {
  rSize = rSize || 32
  output =
    output || 'diff' + rSize + '-' + Math.floor(Math.random() * 100) + '.jpg' 
  if (!rawA || !rawB ) {
    return console.info('unable to contract')
  }
  raw1 = getBinaryRaw(resizeRaw(rSize,rawA))
  raw2 = getBinaryRaw(resizeRaw(rSize,rawB))

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
  console.info(dots, length, diff)
  return {diff}
}
