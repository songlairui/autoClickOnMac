const fs = require('fs')

const jpeg = require('jpeg-js')

const defaultWidth = 603

const { buttons } = require('../action_steps/uiConfig.js')

function cropBtn(btnName,srcFile,dest){

	if(!btnName) return console.error('no inputs')
    if(!buttons.hasOwnProperty(btnName)) return console.error('no configs')

    srcFile = srcFile || './tmp.jpg'
	dest = dest || 'croped'


	let rawData0 = fs.readFileSync(srcFile)

	let {width,height,data} = jpeg.decode(rawData0)

	let ratio = width / defaultWidth

	let [x,y,w,h] = buttons[btnName].map(v=>Math.floor(v*ratio))

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

	let rawImage = {
		width: w ,
		height :h,
		data: frameData
	}

	let jpegData = jpeg.encode(rawImage,100)

	let targetFile = './'+ dest +'/'+btnName+'.jpg'
	fs.writeFileSync(targetFile,jpegData.data)
	console.info('截取了按钮区域 ', targetFile)
	// console.info(x,y,w,h)
}

module.exports = cropBtn


// let [file,dest] = []
let [file,dest] = ['./o.jpg' ,'origin']

// Object.keys(buttons).forEach(btnName=>cropBtn(btnName,file,dest))
Object.keys(buttons).reduce((_,btnName) => {
	if(btnName) {cropBtn(btnName,file,dest)}
},null)

// cropBtn('BACK')
// cropBtn('业原火')
// cropBtn('挑战')