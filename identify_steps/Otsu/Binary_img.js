let file = './width_30.0.jpg'
// let file = './width_30.ok.jpg'
let threshold = 39


const fs = require('fs')

const jpeg = require('jpeg-js')

let imgRaw = jpeg.decode(fs.readFileSync(file))
let length = imgRaw.width * imgRaw.height
let frameData = new Buffer(length * 4)


for (let i = 0; i < length; i++) {
  let idx = i * 4
  let currValue =
    [idx, idx + 1, idx + 2]
      .map(_ => imgRaw.data[_])
      .reduce((sum, v) => sum + v) / 3
  let newValue = currValue > threshold ? 255 : 0
  frameData[idx] = newValue
  frameData[idx + 1] = newValue
  frameData[idx + 2] = newValue
}

let rawData = {
  width: imgRaw.width,
  height: imgRaw.height,
  data: frameData
}
let jpegData = jpeg.encode(rawData, 100)

fs.writeFileSync('./binary.30-0.jpg', jpegData.data)
