const express = require('express')
const { resolve } = require('path')

const http = require('http')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const WebSocket = require('faye-websocket')
const deflate = require('permessage-deflate')
const jpeg = require('jpeg-js')

const getBinaryRaw = require('../identity/getBinaryRaw')
const resizeRaw = require('../identity/resizeRaw')
const getCropRaw = require('../identity/getCropRaw')
const screenCap = require('../action_steps/screenCap')

const isThisArea = require('../identity/isThisArea')

const { buttons } = require('../action_steps/uiConfig.js')
const protobuf = require('protobufjs')
let um = protobuf.loadSync('./chunk.canvas.proto').lookupType('chunk.canvas')

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
        // let result = transformRaw2Buffer()
        // ws.send(result)

        ws.send(umBit(resizeRaw(undefined, rawdata)))
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

      let stdRaw = resizeRaw(undefined, jpeg.decode(fs.readFileSync(stdFile)))

      let bRaw = getBinaryRaw(stdRaw)
      seqSend(stdRaw, ws)
      // ws.send(umBit(stdRaw))
    } else if (event.data === 'binaryRaw') {
      if (rawdata) {
        let bRaw = getBinaryRaw(rawdata)
        ws.send(umBit(bRaw))
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

/**
 * 根据传入data 生成 protocol buffer Base
 * @param {*} param0 
 * @param {*} channel 
 * @param {*} line 
 * @param {*} uSchema 
 */
function umBit({ width, height, data, channel, line, startPoint, uSchema }) {
  // console.info('umBit - executed 1 time')
  uSchema =
    uSchema ||
    protobuf.loadSync('./chunk.canvas.proto').lookupType('chunk.canvas')
  let sendmethod = 'default'
  channel = channel || 'default'
  let id = crypto.randomBytes(8).toString('hex')
  line = line || 0
  startPoint = startPoint || 0
  stopPoint = 0
  let umData = {
    sendmethod,
    channel,
    id,
    width,
    height,
    line,
    startPoint,
    stopPoint,
    rawdata: data
  }
  return uSchema.encode(uSchema.create(umData)).finish()
}

async function seqSend({ width, height, data, channel }, ws) {
  if (!ws) return { err: 'no ws' }
  let pixelSize = 8192 // 像素点 4096
  let startPoint = 0 // 起点像素点
  let isLastChunk = false
  // let chunk = null
  // console.info('chunk & rawData Size: ', pixelSize * 4, data.length)
  // console.info('data instanceof Buffer: ', data instanceof Buffer)
  do {
    // console.info('send 1 time [func seqSend]')

    isLastChunk = data.length - startPoint * 4 <= pixelSize * 4
    // console.info('isLastChunk : ', isLastChunk, startPoint * 4, data.length)
    let chunk = new Buffer(
      isLastChunk ? data.length - startPoint * 4 : pixelSize * 4
    )
    // console.info('params:', startPoint * 4, startPoint * 4 + chunk.length)
    for (let i = 0; i < chunk.length; i++) {
      chunk[i] = data[startPoint * 4 + i]
    }
    // console.info(chunk[chunk.length - 2], data[chunk.length - 2])
    ws.send(umBit({ width, data: chunk, channel, startPoint }))
    await new Promise(r => setTimeout(r, 40))
    startPoint += pixelSize
  } while (!isLastChunk)
}
