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
    // 判断战斗结果
    [
      ['失败'], // 如果失败，点击以跳过
      ['胜利', '打开奖励', '领取奖励', '打开奖励'] // 如果胜利，点击打开奖励，再点击领取奖励
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

let waitUntilReady = function waitUntilReady(area, r, j, times, sequence) {
  // console.info('waitUntilReady', area, sequence)
  let interval = area === '战斗结束' ? 2000 : 800
  setTimeout(() => {
    let ready = readyForAction(area)
    interval = interval + times * 50
    times += 1
    if (ready) {
      console.info(`ready for ${area}`, ready)
      r()
    } else {
      console.info(
        `not ready for ${area}, wait ${interval}ms, - ${times} time[s]`,
        ready
      )
      if (times > 6) {
        // console.info('重试次数太多,离开当前 promise，并重新启动一个')
        let idx = sequence.indexOf(area)
        if (idx > 0 && typeof sequence[idx - 1] === 'string') {
          let readyforPrev = readyForAction(sequence[idx - 1])
          if (readyforPrev) {
            console.info('---- 点击上一个步骤  ----')
            clickBtn(sequence[idx - 1])
          }
        }
        let nextAction = sequence[idx + 1]
        if (typeof nextAction === 'string') {
          let readyforNext = readyForAction(nextAction)
          if (readyForAction) {
            r('-|-')
          }
          return null
        }
        console.info('---- 当前步骤形成临时单步序列  ----')
        start([area]).then(() => {
          console.info(' ----- 执行完成之后，返回上一个sequence --')
          r('---')
        })
        //j()
        // checkReadyForWhich()
        return null
      } else {
        waitUntilReady(area, r, j, times, sequence)
      }
    }
  }, interval)
}

let passUntilOK = function passUntilOK(area, r, j, times) {
  // console.info('300ms 后默认OK')
  setTimeout(r, 300)
  // r('ok')
}

function checkReadyForWhich() {
  return null
}
/**
 * 在 array 中选择一个可执行的队列
 * @param {*} array 
 * @param {*} resolve 
 */
function selectSequence(array, resolve) {
  let choice = null
  for (let i = array.length - 1; i >= 0; i--) {
    console.info(i, array)
    if (readyForAction(array[i][0])) {
      choice = array[i]
      break
    }
  }
  if (choice) {
    // 执行选中的队列，执行完成之后，回到上一层promise中
    start(choice).then(() => {
      resolve()
    })
  } else {
    // 待选的队列中没有可执行的任务，1000ms后重新选择
    console.info('未等到可执行的状态，稍后重新选择')
    setTimeout(() => {
      selectSequence(array, resolve)
    }, 3100)
  }
}
function start(sequence) {
  let uniqid = 'pid-' + (+new Date()).toString().substr(-6)
  return sequence
    .reduce((promise, area) => {
      // console.info(uniqid, ' - area: ', area, sequence)
      let newPromise
      if (typeof area === 'string') {
        newPromise = promise
          .then(
            // check ifReady Before Click
            () => {
              console.info(uniqid, '- 常规步骤 - ', area)
              return new Promise((r, j) => {
                let times = 0
                waitUntilReady(area, r, j, times, sequence)
              })
            }
          )
          .then(msg => {
            if (msg === '---')
              console.info('---- 从临时sequence返回---\n 然后点击', area)

            if (msg === '-|-') console.info('已经完成上一步操作\n 然后点击', area)

            // console.info(uniqid, '- clickBtn - ', area)
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
        newPromise = promise.then(() => {
          console.info(uniqid, '- 选择步骤 -', area)
          return new Promise(resolve => {
            selectSequence(area, resolve)
            // resolve()
          })
        })
        // .then(
        //   // select 执行完之后，执行原promise的 resolve
        //   () => {
        //     r()
        //   }
        // )
      } else {
        newPromise = promise
      }
      // console.info('return 一次promise' + uniqid)
      return newPromise
    }, Promise.resolve())
    .catch(err => {
      throw err
    })
}

start(actSequence.start)
  .then(() => {
    console.info('下一个序列-------------')
    // return start(actSequence.processing)
    flowStart(actSequence.processing)
  })
  .catch(err => {
    throw err
  })

function flowStart(sequence) {
  start(sequence)
    .then(() => {
      console.info('下一个序列-------------')
      return flowStart(sequence)
    })
    .catch(err => {
      throw err
    })
}
