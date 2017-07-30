const fs = require('fs')

const jpeg = require('jpeg-js')

let file1 = './origin/BACK.0.jpg'
let file2 = './origin/BACK.ok.jpg'


// let file1 = './align-0.jpg'
// let file2 = './align-OK.jpg'

let randomDots = null

alignGray( file1 , './border-0.jpg')
alignGray( file2 , './border-OK.jpg')


function alignGray( input , output) {
	output = output || input + '-.jpg'
	let raw = jpeg.decode(fs.readFileSync(input))

	// let data2 = jpeg.decode(fs.readFileSync(file1))
	// 随机取 40个点，获得 灰度的最大值和最小值

	randomDots = randomDots || new Array(40).fill(undefined).map(_=>{
		return Math.floor(Math.random() * raw.data.length/4 / 2)
	})
	// console.info(randomDots.toString())
	// console.info(randomDots)
	// let [max ,min] = randomDots.reduce((result, [max,min])=>{
	// 	max = max || 0
	// 	min = min || 255

	// 	if(result[0]){
	// 		max = max > result[0] ? max : result[0]
	// 	}
	// 	if(result[1]){
	// 		min = min < result[1] ? min : result[1]
	// 	}
	// 	return [max,min]
	// },[null,null])

	dotsValue = randomDots.map(idx=>{
		let [r,g,b] = [0,1,2].map(_ => raw.data[idx+_])
		// let avg = (r + g + b) / 3
		// let d = Math.sqrt((r-avg) * (r-avg) + (g-avg) * (g-avg) + (b-avg) * (b-avg))
		// let min = Math.max(r,g,b)
		// let max = Math.min(r,g,b)
		// console.info(r,g,b,max,min)
		// return [max, min]
		return Math.floor(std(r,g,b))
	})

	let [max,min] = [Math.max(...dotsValue),Math.min(...dotsValue)]

	console.info(max,min)

	// let frameData = new Buffer(10 * 10 * 4)
	let frameData = new Buffer(raw.data.length)

	for (let i = raw.width - 1; i >= 0; i--) {
		for (let j = raw.height - 1; j >= 0; j--) {

			let tmpIdx = (j)*raw.width*4 + (i) * 4

			let [r,g,b] = [0,1,2].map(_=>raw.data[tmpIdx + _])

			;[0,1,2].forEach(_=>frameData[tmpIdx + _] = zoomStd([r,g,b],[max,min]))
		}
	}

	let rawImage = {
		width: raw.width ,
		height :raw.height,
		data: frameData
	}


	let jpegData = jpeg.encode(rawImage,100)


	fs.writeFileSync(output,jpegData.data)

}


function zoomStd([r,g,b],[max,min]){
	min = min || 0
	max = max || 255
	let delta = max - min

	if(delta * delta < 30) {
		max = ( max + min ) / 2 + 5
		min = ( max + min ) / 2 - 5
	}
	max = (max + min ) / 8 + min
	let d = std(r,g,b)
	let result = Math.floor(255 - (d - min) / (max - min) * 255)
	// let result = Math.floor((value - min) / (max - min) * 255)
	result = result < 0 ? 0 : result > 255 ? 255 : result
	// console.info(value,result)
	return result
}

function std(r,g,b){
	let avg = (r + g + b) / 3
	return  Math.sqrt((r-avg) * (r-avg) + (g-avg) * (g-avg) + (b-avg) * (b-avg))
}