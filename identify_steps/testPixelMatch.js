// const pixelmatch = require('pixelmatch')

var fs = require('fs'),
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch');
const jpeg = require('jpeg-js')
 
var 
    // img1 = jpeg.decode(fs.readFileSync('./origin/BACK.ok.jpg'))
    img2 = jpeg.decode(fs.readFileSync('./align-0.jpg'))
    img1 = jpeg.decode(fs.readFileSync('./align-OK.jpg')),
    filesRead = 0;
 // 痴之阵
function doneReading() {
    // if (++filesRead < 2) return;
    var diff = new PNG({width: img1.width, height: img1.height});
 
    pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: .1});
 
    diff.pack().pipe(fs.createWriteStream('diff.png'));
}

doneReading()