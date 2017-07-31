// let file = '../origin/BACK.ok.jpg'
let file = '../align-0.jpg'
// let file = '../align-OK.jpg'

const fs = require('fs')

const jpeg = require('jpeg-js')

let imgRaw = jpeg.decode(fs.readFileSync(file))

// beHalfAvg(imgRaw)
// beHalfSharp(imgRaw)
// console.info(typeof (+process.argv[2]))
if (!Number.isNaN(+process.argv[2])) {
  console.info(+process.argv[2])
  toWidth(+process.argv[2], imgRaw)
} else {
  console.info(process.argv[2])
}

function beHalfAvg(imgRaw, output) {
  output = output || './resize.avg.jpg'
  // 长宽为奇数时，最后一像素丢弃
  let width = Math.floor(imgRaw.width / 2)
  let height = Math.floor(imgRaw.height / 2)

  let frameData = new Buffer(width * height * 4)
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let idx0 = j * 2 * imgRaw.width * 4 + i * 2 * 4
      let idx1 = idx0 + 4
      let idx2 = idx0 + imgRaw.width * 4
      let idx3 = idx0 + imgRaw.width * 4 + 4
      let originPixel = [idx0, idx1, idx2, idx3]
        .map(_ => [_, _ + 1, _ + 2, _ + 3])
        .map(pixels => pixels.map(idx => imgRaw.data[idx]))
      let idxnew = j * width * 4 + i * 4
      frameData[idxnew] = Math.round(
        originPixel.reduce((sum, item) => sum + item[0], 0) / 4
      )
      frameData[idxnew + 1] = Math.round(
        originPixel.reduce((sum, item) => sum + item[1], 0) / 4
      )
      frameData[idxnew + 2] = Math.round(
        originPixel.reduce((sum, item) => sum + item[2], 0) / 4
      )
    }
  }

  let rawImage = {
    width,
    height,
    data: frameData
  }

  let jpegData = jpeg.encode(rawImage, 100)

  fs.writeFileSync(output, jpegData.data)
}

function beHalfSharp(imgRaw, output) {
  output = output || './resize.jpg'
  // 长宽为奇数时，最后一像素丢弃
  let width = Math.floor(imgRaw.width / 2)
  let height = Math.floor(imgRaw.height / 2)

  let frameData = new Buffer(width * height * 4)
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let idx0 = j * 2 * imgRaw.width * 4 + i * 2 * 4
      let idxnew = j * width * 4 + i * 4
      frameData[idxnew] = imgRaw.data[idx0]
      frameData[idxnew + 1] = imgRaw.data[idx0 + 1]
      frameData[idxnew + 2] = imgRaw.data[idx0 + 2]
      frameData[idxnew + 3] = imgRaw.data[idx0 + 3]
    }
  }

  let rawImage = {
    width,
    height,
    data: frameData
  }

  let jpegData = jpeg.encode(rawImage, 100)

  fs.writeFileSync(output, jpegData.data)
}

// // 取 0 ～ 4 矩阵
// let tmp4 = new Array(4).fill(0).map(() => new Array(4).fill(0))

// for (let i = 4 - 1; i >= 0; i--) {
//   for (let j = 4 - 1; j >= 0; j--) {
//     let idx0 = j * 2 * imgRaw.width * 4 + i * 2 * 4
//     let idx1 = idx0 + 4
//     let idx2 = idx0 + imgRaw.width * 4
//     let idx3 = idx0 + imgRaw.width * 4 + 4
//     let originPixel = [idx0, idx1, idx2, idx3]
//       .map(_ => [_, _ + 1, _ + 2])
//       .map(pixels => pixels.map(idx => imgRaw.data[idx]))
//     // console.info('-',originPixel)
//     // console.info(Math.round(originPixel.reduce((sum, item) => sum + item[0], 0) / 4))
//     // console.info(Math.round(originPixel.reduce((sum, item) => sum + item[1], 0) / 4))
//     // console.info(Math.round(originPixel.reduce((sum, item) => sum + item[2], 0) / 4))
//     //let idxnew = j * 4 + i
//     //tmp4[j][i] = imgRaw.data[idxnew]
//     // frameData[idxnew] = originPixel.reduce((sum, item) => sum + item, 0) / 4
//   }
// }

// console.info(tmp4.map(v => v.join(' - ')).join('\n'))

function toWidth(num, data) {
  // 计算宽度与高度的分段取值范围，额外的值丢弃
  let wUnit = data.width / num
  let hUnit = data.height / num
  if (wUnit < 1) return console.info('不会缩放')
  let poolW = new Array(num)
    .fill(0)
    .map((_, i) => [Math.ceil(i * wUnit), Math.floor((i + 1) * wUnit)])
  let poolH = new Array(num)
    .fill(0)
    .map((_, i) => [Math.ceil(i * hUnit), Math.floor((i + 1) * hUnit)])
  // console.info(poolW)
  let frameData = new Buffer(num * num * 4)
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      let pixel = calcAreaAvg.call(null, ...poolW[i], ...poolH[j], data)
      if(!pixel) return null
      let idx = j * num * 4 + i * 4 // 当前的 索引值 计算需要 乘以 4
      frameData[idx] = pixel[0]
      frameData[idx + 1] = pixel[1]
      frameData[idx + 2] = pixel[2]
      frameData[idx + 3] = pixel[3]
      // frameData[j * num + i + 1],
      // frameData[j * num + i + 2],
      // frameData[j * num + i + 3]
    }
  }
  console.info(frameData, frameData.length)
  let rawImage = {
    width: num,
    height: num,
    data: frameData
  }

  let jpegData = jpeg.encode(rawImage, 100)

  fs.writeFileSync(`./width_${num}.jpg`, jpegData.data)
}

function calcAreaAvg(w1, w2, h1, h2, data) {
  if (!data || !data.width) return console.info('no data')
  if ((w2 - w1) * (w2 - w1) < 3 || (h2 - h1) * (h2 - h1) < 3) {
    return console.info('area too small')
  }
  let allR = []
  let allG = []
  let allB = []
  for (let i = w1; i < w2; i++) {
    for (let j = h1; j < h2; j++) {
      let idx = j * data.width * 4 + i * 4
      let [r, g, b] = [idx, idx + 1, idx + 2].map(_ => data.data[_])
      allR.push(r)
      allG.push(g)
      allB.push(b)
    }
  }
  // console.info(allR, allG, allB.length)
  return [allR, allG, allB]
    .map(array =>
      Math.round(array.reduce((sum, v) => sum + v, 0) / array.length)
    )
    .concat([255])
}

// let a = calcAreaAvg(10, 20, 10, 20, imgRaw)
// console.info(a)
