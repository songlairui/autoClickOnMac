let gContext
let hiddenImage = new Image()
hiddenImage.src = './tmp.jpg'
hiddenImage.onload = function() {
  hiddenImage.loaded = true
}

document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.querySelector('canvas')
  canvas.width = 480
  canvas.height = 400
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
  log('typeof', typeof event.data)
  log('instanceof Blob', event.data instanceof Blob)
  if (event.data instanceof Blob) {
    var reader = new FileReader()
    reader.addEventListener('loadend', e => {
      console.info('arrayBuffer', e.target.result)
      // gContext.putImageData(img, 10, 10)
      let width = new Uint16Array(e.target.result, 0, 1)[0]
      let height = new Uint16Array(e.target.result, 2, 1)[0]
      let line = new Uint16Array(e.target.result, 4, 1)[0]
      let data = new Uint8ClampedArray(e.target.result, 6)
      // window.ttt = e.target.result
      // console.info(width, height, line, data)
      putRawDataPartical(data, width, height, line)
      // reader.result contains the contents of blob as a typed array
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
  let cronStep = function(i){

  }
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