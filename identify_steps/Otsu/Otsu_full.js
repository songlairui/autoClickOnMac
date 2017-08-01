// let file = '../origin/BACK.ok.jpg'

// let file = './width_30.0.jpg'

let file = './width_30.ok.jpg'
const fs = require('fs')

const jpeg = require('jpeg-js')

let imgRaw = jpeg.decode(fs.readFileSync(file))

let length = imgRaw.width * imgRaw.height

let i = 0
let histogram = {}
while (i < length) {
  let idx = i * 4
  let value = Math.round(
    [idx, idx + 1, idx + 2]
      .map(_ => imgRaw.data[_])
      .reduce((sum, v) => sum + v) / 3
  )
  //  let value = imgRaw.data[i * 4]
  if (histogram[value]) {
    histogram[value]++
  } else {
    histogram[value] = 1
  }
  i++
}

// 权重总和 sum
// 暗部权重和 sumB
// sum - sumB 为另一类权重和

let sum = 0
for (let j = 0; j < 256; j++) {
  sum += j * (histogram[j] || 0)
}

let sumB = 0
let lengthB = 0

let varMax = 0
let result = null

for (step = 0; step < 256; step++) {
    
  lengthB += histogram[step] || 0
  if(lengthB === 0) continue
  let lengthA = length - lengthB
  if(lengthA === 0) break

  sumB += step * (histogram[step] || 0)
  
  let sumA = sum - sumB
  
  // 不需要按照公式增加一步除法
  // let wB = lengthB / length
  // let wA = lengthA / length

  let uB = sumB / lengthB
  let uA = sumA / lengthA

  let varAB = lengthB * lengthA * (uB - uA) * (uB - uA)
  if(varAB > varMax){
    varMax = varAB
    result = step
  }
console.info(sum, length)
console.info(sumB, sumA, lengthB, lengthA)
// console.info(wB, wA, uB, uA)
console.info(varAB)
}
console.info('---',varMax,result)
