const fs = require('fs')

const PNG = require('pngjs').PNG

const jpeg = require('jpeg-js')

resultJPG = jpeg.decode(fs.readFileSync('./tmp.jpg'))


// 1920 * 1080

// 1206 * 678

// 603 * 339
// resultPNG = PNG.sync.read(fs.readFileSync('./tmp.png'))

console.info(resultJPG)
// console.info(resultPNG)