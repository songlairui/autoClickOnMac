const clickBtn = require('../action_steps/clickBtn')
const readyForAction = require('./readyForAction')

let actSequence = {
  start: [
    // '探索0',
    '御魂',
    '业原火',
    '痴之阵'
  ],
  processing: [
    '挑战',
    '开始',
    '战斗结束',
    // 判断战斗结果
    [
      ['失败'], // 如果失败，点击以跳过
      ['胜利', '领取奖励'] // 如果胜利，点击打开奖励，再点击领取奖励
    ]
  ]
}

// btnSequence.reduce((promise, btnName) => {
//   return promise.then(
//     () =>
//       new Promise((r, j) => {
//         setTimeout(() => {
//           clickBtn(btnName)
//           r()
//         }, 1200)
//       })
//   )
// }, Promise.resolve())

// clickBtn(btnSequence[0])

let waitUntilReady = function waitUntilReady(area, r, j, times) {
  let interval = area === '战斗结束' ? 2000 : 500
  setTimeout(() => {
    let ready = readyForAction(area)
    interval = interval + times * 50
    times += 1
    if (ready) {
      console.info(`ready for ${area}`, ready)
      r()
    } else {
      console.info(`not ready, wait ${interval}ms, - ${times} time[s]`, ready)
      if (times > 10) {
        console.info('重试次数太多,离开当前 promise，并重新启动一个')
        j()
        checkReadyForWhich()
        return null
      }
      waitUntilReady(area, r, j, times)
    }
  }, interval)
}

let passUntilOK = function passUntilOK(area, r, j, times) {
  console.info('300ms 后默认OK')
  setTimeout(r, 300)
  // r('ok')
}

function checkReadyForWhich() {
  return null
}

function start(sequence) {
  return sequence
    .reduce((promise, area) => {
      console.info('area: ', area)
      let newPromise
      if (typeof area === 'string') {
        newPromise = promise
          .then(
            // check ifReady Before Click
            () =>
              new Promise((r, j) => {
                let times = 0
                waitUntilReady(area, r, j, times)
              })
          )
          .then(() => {
            clickBtn(area)
          })
          .then(
            // check ifOK After Click
            () =>
              new Promise((r, j) => {
                let times = 0
                passUntilOK(area, r, j, times)
              })
          )
      } else if (Array.isArray(area)) {
        newPromise = start(checkReadyForWhich(area))
      } else {
        newPromise = promise
      }
      return newPromise
    }, Promise.resolve())
    .catch(err => {
      throw err
    })
    .then(() => start(actSequence.processing))
}

start(actSequence.start)
  .then(() => start(actSequence.processing))
  .catch(err => {
    throw err
  })
