const os = require('os')

let SKIP = true
config={
// 按钮位置，x，y，r
	buttons:{
		"BACK":[10,10,35,35],
		"御魂":[76,292,40,40],
		"业原火":[344,74,200,170],
		"痴之阵":[120,159,140,35],
		"挑战":[422,221,56,24],
		"开始":[510,220,68,100],
		"探索0":[312,55,28,45],
		"町中0":[334,132,30,28],
		"庭院0":[476,100,42,43],
		"战斗结束":[0,0,600,160,SKIP],
		"打开奖励":[0,0,600,160,SKIP],
		"领取奖励":[0,0,600,70,SKIP]
	},
	windowHeight :{
	title: 22,
	header: 58 - 22,
	content: 397 - 58,
	footer: 445 - 397
},
tmpdir: os.tmpdir()
}	

module.exports = config