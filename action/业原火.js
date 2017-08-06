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

start(actSequence.start)
  .then(() => {
    flowStart(actSequence.processing)
  })
  .catch(err => {
    throw err
  })

/**
   * 序列元操作，执行一个序列。为方便启动分之序列，临时序列，当前方法不能含有额外指令如回掉自己
   * @param {*} sequence 
   */
function start(sequence) {
  return sequence.reduce((promise, area) => {
    let newPromise
    if (typeof area === 'string') {
      newPromise = promise
        .then(() => {
          return new Promise((r, j) => {
            let times = 0
            waitUntilReady(area, r, j, times, sequence)
          })
        })
        .then(msg => {
          clickBtn(area)
        })
    } else if (Array.isArray(area)) {
      newPromise = promise.then(() => {
        return new Promise(resolve => {
          selectSequence(area, resolve)
        })
      })
    } else {
      j(new Error('area 参数无效: ', area))
    }
    return newPromise
  }, Promise.resolve())
}

/**
 * 循环执行一个序列，此方法为循环挑战业原火副本流程
 * @param {*} sequence 
 */
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
  
/**
 * 等待某个状态，直到呈现该状态，进行r() 进行promise链中的下一步
 * @param {*} area  区域名称
 * @param {*} r     Promise链中的resolve方法
 * @param {*} j     Promise链中的reject方法
 * @param {*} times 记录方法自回掉了多少次，当次数过多时，执行额外的子promise链
 * @param {*} sequence 当前执行的任务序列，用于获取上一步与下一步，用在状态的容错判断上
 */
let waitUntilReady = function waitUntilReady(area, r, j, times, sequence) {
  let interval = 800
  setTimeout(() => {
    interval = interval + times * 50
    times += 1
    if (readyForAction(area)) {
      r()
    } else {
      console.info(
        `not ready for ${area}, wait ${interval}ms,  ${times} time[s]`
      )
      if (times > 6) {
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

        start([area]).then(() => {
          r('---')
        })

        return null
      } else {
        waitUntilReady(area, r, j, times, sequence)
      }
    }
  }, interval)
}

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
