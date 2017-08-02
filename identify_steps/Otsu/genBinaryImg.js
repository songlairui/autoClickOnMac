let file = '../origin/BACK.ok.jpg'
let file1 = '../origin/BACK.jpg'

const fs = require('fs')

const jpeg = require('jpeg-js')

writeBinImg(file, 'b.jpg')
writeBinImg(file1, 'b2.jpg')

module.exports = {
  writeBinImg,
  genBinaryData
}

function writeBinImg(input, output) {
  output = output || 'binary.jpg'
  let rawData = genBinaryData(input)
  let jpegData = jpeg.encode(rawData, 100)

  fs.writeFileSync(output, jpegData.data)
}

function genBinaryData(file) {
  // 读取data
  let imgRaw = jpeg.decode(fs.readFileSync(file))
  let threshold = getThreshold(imgRaw)

  let length = imgRaw.width * imgRaw.height
  let frameData = new Buffer(length * 4)

  for (let i = 0; i < length; i++) {
    let idx = i * 4
    let currValue =
      [idx, idx + 1, idx + 2]
        .map(_ => imgRaw.data[_])
        .reduce((sum, v) => sum + v) / 3
    let newValue = currValue > threshold ? 255 : 0
    // let newValue = 0
    frameData[idx] = newValue
    frameData[idx + 1] = newValue
    frameData[idx + 2] = newValue
    frameData[idx + 3] = 0

    //idx > 1000 ? null :
    // console.info(newValue, frameData[idx + 2])
  }
  // console.info(frameData)
  // for (let i = 0; i < frameData.length; i++) {
  //   i < 100 ? console.info(frameData[i]) : null
  // }
  let rawData = {
    width: imgRaw.width,
    height: imgRaw.height,
    data: frameData
  }
  return rawData
}

function getThreshold(imgRaw) {
  // 计算最大类间差异对应的 threshold
  let threshold

  let histogram = getHistogram(imgRaw)
  let length = imgRaw.width * imgRaw.height
  let sum = 0
  for (let j = 0; j < 256; j++) {
    sum += j * (histogram[j] || 0)
  }

  let sumB = 0
  let lengthB = 0
  let varMax = 0

  for (step = 0; step < 256; step++) {
    lengthB += histogram[step] || 0
    if (lengthB === 0) continue
    let lengthA = length - lengthB
    if (lengthA === 0) break

    sumB += step * (histogram[step] || 0)

    let sumA = sum - sumB
    let uB = sumB / lengthB
    let uA = sumA / lengthA

    let varAB = lengthB * lengthA * (uB - uA) * (uB - uA)
    if (varAB > varMax) {
      varMax = varAB
      threshold = step
    }
  }
  return threshold
}
function getHistogram(imgRaw) {
  // 生成 histogram
  let i = 0
  let length = imgRaw.width * imgRaw.height
  let histogram = {}
  while (i < length) {
    let idx = i * 4
    let value = Math.round(
      [idx, idx + 1, idx + 2]
        .map(_ => imgRaw.data[_])
        .reduce((sum, v) => sum + v) / 3
    )
    if (histogram[value]) {
      histogram[value]++
    } else {
      histogram[value] = 1
    }
    i++
  }

  return histogram
}
