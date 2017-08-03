module.exports = resizeRaw

function resizeRaw(targetWidth, { data, width, height }) {
  // 计算宽度与高度的分段取值范围，额外的值丢弃
  let wUnit = width / targetWidth
  let hUnit = wUnit
  let targetHeight = Math.floor(height / hUnit)
  if (wUnit < 1) throw new Error('不会放大')
  let poolW = new Array(targetWidth)
    .fill(0)
    .map((_, i) => [Math.floor(i * wUnit), Math.ceil((i + 1) * wUnit)])
  let poolH = new Array(targetHeight)
    .fill(0)
    .map((_, i) => [Math.floor(i * hUnit), Math.ceil((i + 1) * hUnit)])
  // console.info(poolW)
  let frameData = new Buffer(targetWidth * targetWidth * 4)
  for (let i = 0; i < targetWidth; i++) {
    for (let j = 0; j < targetHeight; j++) {
      let pixel = calcAreaAvg.call(null, poolW[i], poolH[j], {
        data,
        width,
        height
      })
      if (!pixel) throw Error('pixel无法计算 in resizeRaw')
      let idx = j * targetWidth * 4 + i * 4 // 当前的 索引值 计算需要 乘以 4
      frameData[idx] = pixel[0]
      frameData[idx + 1] = pixel[1]
      frameData[idx + 2] = pixel[2]
      frameData[idx + 3] = pixel[3]
    }
  }

  return {
    width: targetWidth,
    height: targetHeight,
    data: frameData
  }
}

function calcAreaAvg([w1, w2], [h1, h2], { data, width, height }) {
  if (!width) return console.info('no data')
  if ((w2 - w1) * (w2 - w1) < 3 || (h2 - h1) * (h2 - h1) < 3) {
    return console.info('area too small')
  }
  let allR = []
  let allG = []
  let allB = []
  for (let i = w1; i < w2; i++) {
    for (let j = h1; j < h2; j++) {
      let idx = j * width * 4 + i * 4
      let [r, g, b] = [idx, idx + 1, idx + 2].map(_ => data[_])
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
