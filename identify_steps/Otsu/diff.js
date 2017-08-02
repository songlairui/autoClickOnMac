const { genBinaryData } = require('./genBinaryImg.js')
const fs = require('fs')
const jpeg = require('jpeg-js')

let file1 = '../origin/BACK.0.jpg'
let file2 = '../origin/BACK.ok.jpg'

// let [file1, file2] = ['./binary.30-0.jpg','./binary.30-ok.jpg']

let raw1 = genBinaryData(file1)
let raw2 = genBinaryData(file2)
console.info(raw1, raw2)
if (raw1.width !== raw2.width) {
  return
}

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

fs.writeFileSync('diff.jpg', jpegData.data)

console.info(dots, length)

// console.info(array1.toString(), array2.toString())
// console.info(raw1,raw2)
// console.info(raw1.data.length)
// for(let i = 0; i<raw1.data.length;i++){
//   // i < 100 ? console.info(raw1.data[i]):null
//   [0,255].indexOf(raw1.data[i]) === -1 ? console.info(`${i} - ${raw1.data[i]}`) : null
// }
