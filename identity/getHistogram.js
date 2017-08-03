module.exports = getHistogram

function getHistogram({ data, width, height }) {
  
  if(!data || !width || !height){throw new Error('传入数据无效 -- getHistogram')}
  // 生成 histogram
  let i = 0
  let length = width * height
  let histogram = {}
  while (i < length) {
    let idx = i * 4
    let value = Math.round(
      [idx, idx + 1, idx + 2].map(_ => data[_]).reduce((sum, v) => sum + v) / 3
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
