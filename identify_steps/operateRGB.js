const fs = require('fs')

const jpeg = require('jpeg-js')

let file1 = './origin/BACK.0.jpg'
let file2 = './origin/BACK.ok.jpg'


let data1 = jpeg.decode(fs.readFileSync(file1))



// let frameData = new Buffer(10 * 10 * 4)
let frameData = new Buffer(data1.width * data1.height * 4)

for (let i = data1.width - 1; i >= 0; i--) {
	for (let j = data1.height - 1; j >= 0; j--) {

		let tmpIdx = (j)*data1.width*4 + (i) * 4

		let [r,g,b] = [0,1,2].map(_=>data1.data[tmpIdx + _])

		let gray = (r + g + b) / 3

		;[0,1,2].forEach(_=>frameData[tmpIdx + _] = gray)
	}
}

let rawImage = {
	width: data1.width ,
	height :data1.height,
	data: frameData
}

// console.info(data)
// console.info(frameData)
let jpegData = jpeg.encode(rawImage,100)
// let jpegData = jpeg.encode({width,height,data},50)
// console.info(jpegData,rawData0)

fs.writeFileSync('./grey.jpg',jpegData.data)

// console.info(x,y,w,h)