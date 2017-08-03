const clickBtn = require('../action_steps/clickBtn')
const readyForAction = require('./readyForAction')

let actSequence = {
  start: [
    // '探索0',
    '御魂',
    '业原火',
    '痴之阵'
  ],
  processing: ['挑战', '开始', '战斗结束', '打开奖励', '领取奖励']
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
    times += 1
    if (ready) {
      console.info(`ready for ${area}`)
      r()
    } else {
      console.info(`not ready, wait 500ms, - ${times} time[s]`)
      if (times > 10 && area !== '战斗结束') {
        console.info('重试次数太多,直接下一步骤')
        r()
        return null
      }
      waitUntilReady(area, r, j, times)
    }
  }, interval + times * 50)
}

function start(sequence) {
  return sequence
    .reduce((promise, area) => {
      console.info('area: ', area)
      return promise
        .then(
          () =>
            new Promise((r, j) => {
              let times = 0
              waitUntilReady(area, r, j, times)
            })
        )
        .then(() => {
          clickBtn(area)
        })
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
