let file = '../origin/BACK.ok.jpg'

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

for (let k = 0; k < 150; k++) {
  sumB += k * (histogram[k] || 0)
  lengthB += histogram[k] || 0
}

let sumA = sum - sumB
let lengthA = length - lengthB

let wB = lengthB / length
let wA = lengthA / length

let uB = sumB / lengthB
let uA = sumA / lengthA

let varAB = wB * wA * (uB - uA) * (uB - uA)

console.info(sum, length)
console.info(sumB, sumA, lengthB, lengthA)
console.info(wB, wA, uB, uA)
console.info(varAB)
