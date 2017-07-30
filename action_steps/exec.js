const clickBtn = require('./clickBtn')



let btnSequence = [
	// '探索0',
	'御魂',
	'业原火',
	'痴之阵',
	// '挑战',
	// '开始',
	// '战斗结束',
	// '打开奖励',
	// '领取奖励'
]


btnSequence.reduce((promise,btnName)=>{
	return promise.then(()=> new Promise((r,j)=>{
		setTimeout(()=>{
			clickBtn(btnName)
			r()
		},1200)
	}))
},Promise.resolve())


// clickBtn(btnSequence[0])