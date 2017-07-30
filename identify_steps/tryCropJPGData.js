const fs = require('fs')

const jpeg = require('jpeg-js')

const dpi = 2

const { buttons } = require('../action_steps/uiConfig.js')

let btnName = "痴之阵"
let [x,y,w,h] = buttons[btnName].map(v=>v*dpi)

let rawData0 = fs.readFileSync('./tmp.jpg')

let {width,height,data} = jpeg.decode(rawData0)



// let frameData = new Buffer(10 * 10 * 4)
let frameData = new Buffer(w * h * 4)

for (let i = w - 1; i >= 0; i--) {
	for (let j = h - 1; j >= 0; j--) {
		let srcIdx = (y+j )* width * 4 + (x+i ) * 4
		let tmpIdx = (j)*w*4 + (i) * 4

		frameData[tmpIdx] = data[srcIdx]
		srcIdx++,tmpIdx++
		frameData[tmpIdx] = data[srcIdx]
		srcIdx++,tmpIdx++
		frameData[tmpIdx] = data[srcIdx]
		srcIdx++,tmpIdx++
		frameData[tmpIdx] = data[srcIdx]
	}
}

// for (let i = w - 1; i >= 0; i--) {
// 	for (let j = h - 1; j >= 0; j--) {
// 		let srcIdx = (0+j )* width * 4 + (0+i ) * 4
// 		let tmpIdx = (j)*w*4 + (i) * 4
// 		// console.info(srcIdx,tmpIdx)

// 		frameData[tmpIdx] = data[srcIdx]
// 		srcIdx++,tmpIdx++
// 		frameData[tmpIdx] = data[srcIdx]
// 		srcIdx++,tmpIdx++
// 		frameData[tmpIdx] = data[srcIdx]
// 		srcIdx++,tmpIdx++
// 		frameData[tmpIdx] = data[srcIdx]
// 	}
// }


let rawImage = {
	width: w ,
	height :h,
	data: frameData
}

// console.info(data)
// console.info(frameData)
let jpegData = jpeg.encode(rawImage,100)
// let jpegData = jpeg.encode({width,height,data},50)
console.info(jpegData,rawData0)

fs.writeFileSync('./croped/'+btnName+'.jpg',jpegData.data,'binary')

// console.info(x,y,w,h)