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

/**
 * 等待某个状态，直到呈现该状态，进行r() 进行promise链中的下一步
 * @param {*} area  区域名称
 * @param {*} r     Promise链中的resolve方法
 * @param {*} j     Promise链中的reject方法
 * @param {*} times 记录方法自回掉了多少次，当次数过多时，执行额外的子promise链
 * @param {*} sequence 当前执行的任务序列，用于获取上一步与下一步，用在状态的容错判断上
 */
let waitUntilReady = function waitUntilReady(area, r, j, times, sequence) {
  // console.info('waitUntilReady', area, sequence)
  let interval = 800
  setTimeout(() => {
    interval = interval + times * 50
    times += 1
    if (readyForAction(area)) {
      // 如果 area 区域可以点击，则完成当前promise环节
      // console.info(`ready for ${area}`, ready)
      r()
    } else {
      // 如果当前不可点击 area 区域，则若干秒后调用自身
      console.info(
        `not ready for ${area}, wait ${interval}ms,  ${times} time[s]`
      )
      if (times > 6) {
        // 调用自身次数太多，则判断是否已经执行，或者上一步未执行
        // 然后，将当前环节以队列形式执行。
        // console.info('重试次数太多,离开当前 promise，并重新启动一个')
        let idx = sequence.indexOf(area)
        let prevAction = sequence[idx - 1]
        let nextAction = sequence[idx + 1]
        if (idx > 0 && typeof prevAction === 'string') {
          if (readyForAction(prevAction)) {
            console.info('---- 点击上一个步骤  ----')
            clickBtn(readyForAction(prevAction))
          }
        }
        if (idx < sequence.length && typeof nextAction === 'string') {
          if (readyForAction(nextAction)) {
            r('-|-')
          }
          return null
        }
        // console.info('---- 当前步骤形成临时单步序列  ----')
        start([area]).then(() => {
          // console.info(' ----- 执行完成之后，返回上一个sequence --')
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

// function checkReadyForWhich() {
//   return null
// }
/**
 * 在 array 中选择一个可执行的队列
 * @param {*} array 
 * @param {*} resolve 
 */
function selectSequence(array, resolve) {
  let choice = null
  // 遍历判断子队列中的首个状态
  for (let i = array.length - 1; i >= 0; i--) {
    console.info('-  selectSequence  -', array[i])
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
  // let uniqid = 'pid-' + (+new Date()).toString().substr(-6)
  return sequence
    .reduce((promise, area) => {
      // console.info(uniqid, ' - area: ', area, sequence)
      let newPromise
      if (typeof area === 'string') {
        newPromise = promise
          .then(
            // check ifReady Before Click
            () => {
              // console.info(uniqid, '- 常规步骤 - ', area)
              return new Promise((r, j) => {
                let times = 0
                waitUntilReady(area, r, j, times, sequence)
              })
            }
          )
          .then(msg => {
            // if (msg === '---')
            //   console.info('---- 从临时sequence返回---\n 然后点击', area)

            // if (msg === '-|-') console.info('已经完成上一步操作\n 然后点击', area)

            // console.info(uniqid, '- clickBtn - ', area)
            clickBtn(area)
          })
          // .then(
          //   // check ifOK After Click
          //   () =>
          //     new Promise((r, j) => {
          //       // let times = 0
          //       passUntilOK(area, r, j)
          //     })
          // )
      } else if (Array.isArray(area)) {
        newPromise = promise.then(() => {
          // console.info(uniqid, '- 选择步骤 -', area)
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
        j(new Error('area 参数无效: ', area))
      }
      // console.info('return 一次promise' + uniqid)
      return newPromise
    }, Promise.resolve())
    // 此处不能有catch ，否则，一个sequence中的异常，被截获，下一个sequence继续执行
    // .catch(err => {
    //   throw err
    // })
}

start(actSequence.start)
  .then(() => {
    // console.info('下一个序列-------------')
    // return start(actSequence.processing)
    flowStart(actSequence.processing)
  })
  .catch(err => {
    throw err
  })

function flowStart(sequence) {
  start(sequence)
    .then(() => {
      console.info('-------再一次挑战------')
      return flowStart(sequence)
    })
    .catch(err => {
      throw err
    })
}
