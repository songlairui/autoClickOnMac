const getHistogram = require('./getHistogram')

module.exports = getThreshold

function getThreshold({ data, width, height }) {
  
  if(!data || !width || !height){throw new Error('传入数据无效 -- getThreshold')}
  // 计算最大类间差异对应的 threshold

  let threshold

  let histogram = getHistogram({ data, width, height })
  let length = width * height
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
