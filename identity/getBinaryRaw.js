const getThreshold = require('./getThreshold')

module.exports = getBinaryRaw

function getBinaryRaw({ data, width, height }) {
  // 读取data
  if (!data || !width || !height) {
    throw new Error('传入数据无效 -- getBinaryRaw')
  }
  let threshold = getThreshold({ data, width, height })

  let length = width * height
  let frameData = new Buffer(length * 4)

  for (let i = 0; i < length; i++) {
    let idx = i * 4
    let currValue =
      [idx, idx + 1, idx + 2].map(_ => data[_]).reduce((sum, v) => sum + v) / 3
    let newValue = currValue > threshold ? 255 : 0
    // let newValue = 0
    frameData[idx] = newValue
    frameData[idx + 1] = newValue
    frameData[idx + 2] = newValue
    frameData[idx + 3] = 255
  }

  return {
    width,
    height,
    data: frameData,
    threshold
  }
}
