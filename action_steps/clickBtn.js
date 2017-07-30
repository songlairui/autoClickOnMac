const {buttons} = require('./uiConfig')

const getVysor = require('./getVysorSizeAndPosition')
const cliClick = require('./cliClick')

const activeVysor = require('./activeVysor')

let {x,y,w,h} = getVysor()

function clickBtn(btnName){
	if(!btnName) return console.error('no btn')
	if(!buttons.hasOwnProperty(btnName)) return console.error('no btn config')

	let [eX,eY,r,r2] = buttons[btnName]
	let [cX,cY] =  [[eX + x,r],[eY + y + 58,r2]].map(value => Math.floor(value[0] + Math.random()*value[1]))

		console.info(x,y,eX,eY,cX,cY)
	// return 0
	activeVysor()
	cliClick(cX,cY)
}

module.exports = clickBtn