let gContext
// let hiddenImage = new Image()
// hiddenImage.src = './tmp.jpg'
// hiddenImage.onload = function() {
//   hiddenImage.loaded = true
// }
let um
protobuf.load('./chunk.canvas.proto', (err, root) => {
  um = root.lookupType('chunk.canvas')
})

document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.querySelector('canvas')
  canvas.width = 1280
  canvas.height = 800
  gContext = canvas.getContext('2d')
})

var Socket = window.MozWebSocket || window.WebSocket,
  protos = ['foo', 'bar', 'xmpp'],
  socket = new Socket(
    'ws://' + location.hostname + ':' + location.port + '/',
    protos
  ),
  index = 0

var log = function(...x) {
  console.log(...x)
}

socket.addEventListener('open', function() {
  log('OPEN: ', socket.protocol)
  socket.send('Hello, world, from client')
})

socket.onerror = function(event) {
  log('ERROR: ', event.message)
}

socket.onmessage = function(event) {
  log('MESSAGE: ', event.data)
  // log('typeof', typeof event.data)
  // log('instanceof Blob', event.data instanceof Blob)
  if (event.data instanceof Blob) {
    var reader = new FileReader()
    reader.addEventListener('loadend', e => {
      // console.info('arrayBuffer', e.target.result)
      if (!um) return null
      let data = um.toObject(um.decode(new Uint8Array(e.target.result)))
      // gContext.putImageData(img, 10, 10)
      // let line = new Uint16Array(e.target.result, 4, 1)[0]
      // let width = new Uint16Array(e.target.result, 0, 1)[0]
      // let height = new Uint16Array(e.target.result, 2, 1)[0]
      // let rawdata = new Uint8ClampedArray(e.target.result, 6)
      // let data = { width, rawdata }
      // // window.ttt = e.target.result
      // // console.info(width, height, line, data)
      // putRawDataPartical(data, width, height, line)
      // reader.result contains the contents of blob as a typed array
      draw(data)
    })
    reader.readAsArrayBuffer(event.data)
  }
  // setTimeout(function() { socket.send(++index + ' ' + event.data) }, 2000);
}

socket.onclose = function(event) {
  log('CLOSE: ', event.code + ', ' + event.reason)
}

function putRawDataLine(raw, width, height, line) {
  for (let i = 0; i < height; i++) {
    if (typeof line === 'number' && i !== line) {
      continue
    }
    for (let j = 0; j < width; j++) {
      let pos = j * 4
      gContext.fillStyle = `rgba(${raw[pos]}
        ,${raw[pos + 1]}
        ,${raw[pos + 2]}
        ,${raw[pos + 3]})`
      gContext.fillRect(j, i, 1, 1)
    }
  }
}
function putRawDataPartical(raw, width, height, line) {
  let start = line * width
  let cronStep = function(i) {}
  for (let i = 0; i < height; i++) {
    if (typeof line === 'number' && i !== line) {
      continue
    }
    for (let j = 0; j < width; j++) {
      let pos = j * 4
      gContext.fillStyle = `rgba(${raw[pos]}
        ,${raw[pos + 1]}
        ,${raw[pos + 2]}
        ,${raw[pos + 3]})`
      gContext.fillRect(j, i, 1, 1)
    }
  }
}
function putRawData(raw, width, height) {
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let pos = j * 4
      gContext.fillStyle = `rgba(${raw[pos]}
        ,${raw[pos + 1]}
        ,${raw[pos + 2]}
        ,${raw[pos + 3]})`
      gContext.fillRect(j, i, 1, 1)
    }
  }
  // for (let i = width - 1; i >= 0; i--) {
  //   for (let j = height - 1; j >= 0; j--) {
  //     let pos = (width * j + i) * 4
  //     gContext.fillStyle = `rgba(${raw[pos]}
  //       ,${raw[pos + 1]}
  //       ,${raw[pos + 2]}
  //       ,${raw[pos + 3]})`
  //     gContext.fillRect(i, j, 1, 1)
  //   }
  // }
}

function draw({
  sendmethod,
  channel,
  id,
  width,
  height,
  line,
  startPoint = 0,
  stopPoint,
  rawdata,
  tmpCount = 1,
  tmpBegin = 0
}) {
  let chunksize = 1024 // 每次绘制的像素
  let isLastchunk = rawdata.length - tmpBegin * 4 <= chunksize * 4
  let tmpSize = isLastchunk ? rawdata.length / 4 - tmpBegin : chunksize
  // console.info(
  //   rawdata.length / 4,
  //   tmpBegin,
  //   rawdata.length - tmpBegin * 4,
  //   chunksize * 4,
  //   isLastchunk
  // )
  // console.info('drawing Task', id)

  // console.info(
  //   'width ',
  //   width,
  //   ' at ',
  //   startPoint,
  //   tmpBegin,
  //   tmpSize,
  //   startPoint + tmpBegin,
  //   ' - ',
  //   startPoint + tmpBegin + tmpSize
  // )
  // console.info(
  //   (startPoint + tmpBegin) % width,
  //   ' - ',
  //   (startPoint + tmpBegin + tmpSize) % width,
  //   ' - ',
  //   Math.ceil((startPoint + tmpBegin) / width),
  //   ' - ',
  //   Math.ceil((startPoint + tmpBegin + tmpSize) / width)
  // )

  for (let i = tmpBegin; i < tmpBegin + tmpSize; i++) {
    let [r, g, b, a] = [i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3].map(
      idx => rawdata[idx]
    )
    let x = (startPoint + i) % width
    let y = Math.ceil((startPoint + i) / width)
    gContext.fillStyle = `rgba(${r}
        ,${g}
        ,${b}
        ,${a})`
    gContext.fillRect(x, y, 1, 1)
    // if (i < 99) console.info('[i,x,y]=', i, x, y)
  }
  // console.info(rawdata.length, startPoint, tmpBegin)
  // console.info('isLashchunk:', isLastchunk)
  if (!isLastchunk && tmpCount < 9) {
    // 如果不是最后一个，要计算剩余chunkRaw
    tmpBegin += chunksize
    tmpCount++
    // console.info('尾调', startPoint, id)
    // let leftraw = new Uint8Array(rawdata.length - chunksize)
    requestAnimationFrame(() =>
      draw({ startPoint, width, height, rawdata, tmpCount, id, tmpBegin })
    )
  } else {
    console.warn('stopDraw', id, ' at ', startPoint)
  }
}
