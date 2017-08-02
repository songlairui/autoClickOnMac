// 像素化
let file = '../Otsu/b.jpg'
let file1 = '../Otsu/b2.jpg'

const fs = require('fs')
const jpeg = require('jpeg-js')

let pixelSize = Number.isNaN(+process.argv[2]) ? 30 : +process.argv[2]

toPixel(pixelSize, file, 'p1')
toPixel(pixelSize, file1, 'p2')

function toPixel(num, file, output) {
  console.log('aim to pixel in ', num)
  output = output || 'pixel' + Math.floor(Math.random() * 99)
  let data = jpeg.decode(fs.readFileSync(file))

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
      effectArea.call(null, ...poolW[i], ...poolH[j], data)
    }
  }
  // console.info(frameData, frameData.length)
  let rawImage = {
    width: data.width,
    height: data.height,
    data: data.data
  }

  let jpegData = jpeg.encode(rawImage, 100)

  fs.writeFileSync(`${output}.jpg`, jpegData.data)
}

function effectArea(w1, w2, h1, h2, data) {
  if (!data || !data.width) return console.info('no data')
  if ((w2 - w1) * (w2 - w1) < 2 || (h2 - h1) * (h2 - h1) < 2) {
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
  // 计算 处理的值， 平均值，或者 二值
  let grayValue =
    [allR, allG, allB]
      .map(array =>
        Math.round(array.reduce((sum, v) => sum + v, 0) / array.length)
      )
      .reduce((sum, v) => sum + v, 0) /
      3 >
    127
      ? 255
      : 0

  // console.info('grayValue', grayValue)

  for (let i = w1; i < w2; i++) {
    for (let j = h1; j < h2; j++) {
      let idx = j * data.width * 4 + i * 4
      ;[idx, idx + 1, idx + 2].map((_, idx) => (data.data[_] = grayValue))
    }
  }
}

// let a = calcAreaAvg(10, 20, 10, 20, imgRaw)
// console.info(a)
