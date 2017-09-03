const express = require('express')
const { resolve } = require('path')

const http = require('http')
const path = require('path')
const fs = require('fs')
const WebSocket = require('faye-websocket')
const deflate = require('permessage-deflate')
const jpeg = require('jpeg-js')

const getBinaryRaw = require('../identity/getBinaryRaw')
const resizeRaw = require('../identity/resizeRaw')
const getCropRaw = require('../identity/getCropRaw')
const screenCap = require('../action_steps/screenCap')

const isThisArea = require('../identity/isThisArea')

const { buttons } = require('../action_steps/uiConfig.js')

var port = process.argv[2] || 8008,
  options = { extensions: [deflate], ping: 5 }

let rawdata
var upgradeHandler = async function(request, socket, head) {
  var ws = new WebSocket(request, socket, head, ['irc', 'xmpp'], options)

  ws.on('message', async function(event) {
    console.info('[ws obj] during upgrade')
    if (event.data === 'screenshot') {
      console.info('截图')
      setTimeout(() => {
        let { code, screenshotFile } = screenCap(190, 400, 180, 130)
        console.info(screenshotFile)
        rawdata = jpeg.decode(fs.readFileSync(screenshotFile))
        // console.info(new Uint16Array(result,0,2))
        let result = transformRaw2Buffer(rawdata)
        ws.send(result)
      }, 100)
    } else if (event.data === 'stdArea') {
      let areaName = '业原火'
      let stdFile = path.resolve(
        '../identify_steps/origin',
        areaName + '.ok.jpg'
      )
      if (!fs.existsSync(stdFile)) {
        console.log('未捕捉标准文件')
        return { result: undefined, confidence: undefined }
      }

      let stdRaw = jpeg.decode(fs.readFileSync(stdFile))

      let bRaw = getBinaryRaw(stdRaw)
      let result = transformRaw2Buffer(stdRaw)
      // ws.send(result)
      await chunkSend(stdRaw, ws)
    } else if (event.data === 'binaryRaw') {
      if (rawdata) {
        let bRaw = getBinaryRaw(rawdata)
        let result = transformRaw2Buffer(bRaw)
        ws.send(result)
      }
    } else {
      console.info('收到了消息', event.data, '不知道怎么做，原封不动返回去')
      ws.send(event.data)
    }
  })
  ws.onclose = function(event) {
    console.log('[close]', event.code, event.reason)
    ws = null
  }
}

var requestHandler = function(request, response) {
  console.info('--request---', request.url)
  // console.info('--response---',response)
  if (!WebSocket.EventSource.isEventSource(request)) {
    console.info('static request')
    return null
  } else {
    console.info('websocket request')
  }
}

var staticHandler = function(request, response) {
  var path = request.url
  fs.readFile(resolve(__dirname, 'static' + path), (err, content) => {
    console.info(__dirname, 'static' + path, err)
    var status = err ? 404 : 200
    response.writeHead(status, {
      'Content-Type': 'text/html'
    })
    response.write(content || 'Not found')
    response.end()
  })
}

const app = express()
app.use('/', express.static('static'))

const server = http.createServer(app)

server.on('request', requestHandler)
server.on('upgrade', upgradeHandler)

server.listen(port, () => {
  // console.info(server.address())
  console.info(
    `listening at ${server.address().address}:${server.address().port}`
  )
})

function transformRaw2Buffer({ width, height, data }) {
  // 在头部拼接宽度、高度信息
  let paramWidth = new Uint16Array([width]).buffer
  let paramHeight = new Uint16Array([height]).buffer
  let paramLine = new Uint16Array([0]).buffer
  let result = new Uint8Array(
    paramWidth.byteLength + // 宽 信息头
    paramHeight.byteLength + // 高 信息头
    paramLine.byteLength + // 行号 信息头
      data.byteLength
  )
  // console.info(rawdata.width,paramWidth)
  // console.info(paramWidth.byteLength, result.length)
  result.set(new Uint8Array(paramWidth), 0)
  result.set(new Uint8Array(paramHeight), 2)
  result.set(new Uint8Array(paramLine), 4)
  result.set(data, 6)
  return Buffer.from(result.buffer)
}

async function chunkSend({ width, height, data }, ws) {
  if (!ws) return { err: 'no ws' }
  // 按行发送 顺序发送20行
  new Array(20)
    .fill(0)
    .map((_, idx) => idx + 20)
    .reduce((promise, line, _, arr) => {
      // console.info('arr', arr)
      return promise.then(
        () =>
          new Promise(r => {
            // console.info('try to send')
            // console.info(r)
            let chunkBuf = chunkBit({ width, height, data }, line)
            ws.send(chunkBuf)
            setTimeout(() => r(), 200)
          })
      )
    }, Promise.resolve())
    .catch(err => console.log('promise err', err))
}
//
// (r, j) => {
//
//     }
//
// 按行取buffer
function chunkBit({ width, height, data }, line) {
  let paramWidth = new Uint16Array([width]).buffer
  let paramHeight = new Uint16Array([height]).buffer
  let paramLine = new Uint16Array([line]).buffer
  let rawLine = new Uint8Array(width * 4)

  let distance = width * 4 * line
  for (let i = 0; i < width * 4; i++) {
    // let idx = i
    rawLine[i] = data[i + distance]
  }

  let result = new Uint8Array(
    paramWidth.byteLength + // 宽 信息头
    paramHeight.byteLength + // 高 信息头
    paramLine.byteLength + // 行号 信息头
      width * 4 // 每行 buffer 数目 rgba
  )

  // console.info(rawdata.width,paramWidth)
  // console.info(paramWidth.byteLength, result.length)
  result.set(new Uint8Array(paramWidth), 0)
  result.set(new Uint8Array(paramHeight), 2)
  result.set(new Uint8Array(paramLine), 4)
  result.set(rawLine, 6)
  return Buffer.from(result.buffer)
}
