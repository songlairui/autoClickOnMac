
function polygon(num, direction, context, timeout) {
  context = context || gContext
  timeout = timeout || Math.floor(2400 / num)
  direction = direction === undefined ? num > 10 : direction
  var n = 0
  var dx = 150
  var dy = 150
  var s = 100
  context.beginPath()
  context.fillStyle = 'pink'
  context.strokeStyle = 'rgb(0,0,100)'
  var x = Math.sin(0)
  var y = Math.cos(0)

  let dig = direction
    ? Math.PI * 2 / num
    : Math.PI * 2 / 3 + Math.PI * 2 / (num * 3)

  //  3 * dig = 360 / num + 360
  // dig = 120 + 120 / num

  let aniProcess = Promise.resolve()

  for (let i = 0; i < num; i++) {
    aniProcess = aniProcess.then(
      () =>
        new Promise(resolve => {
          x = Math.sin(i * dig)
          y = Math.cos(i * dig)
          context.lineTo(dx + x * s, dy + y * s)

          context.fill()
          context.stroke()
          setTimeout(resolve, timeout)
        })
    )

    // console.log(x, y)
  }
  aniProcess.then(() => {
    context.closePath()
    context.fill()
    context.stroke()
  })
}

function hexagon(context) {
  var n = 0
  var dx = 100
  var dy = 100
  var s = 100
  var x = Math.sin(0)
  var y = Math.cos(0)
  context.beginPath()
  context.fillStyle = 'pink'
  context.strokeStyle = 'rgb(0,0,100)'
  var dig = Math.PI / 15 * 5
  let process = Promise.resolve()
  for (let i = 0; i < 6; i++) {
    process = process.then(
      () =>
        new Promise(r => {
          x = Math.sin(i * dig)
          y = Math.cos(i * dig)
          context.lineTo(dx + x * s, dy + y * s)
          // console.log(x, y)
          context.fill()
          context.stroke()
          setTimeout(r, 400)
        })
    )
  }
  process.then(() => {
    context.closePath()
    context.fill()
    context.stroke()
  })
}

function thirty(cotext) {
  var n = 0
  var dx = 150
  var dy = 150
  var s = 100
  context.beginPath()
  context.fillStyle = 'pink'
  context.strokeStyle = 'rgb(0,0,100)'
  var x = Math.sin(0)
  var y = Math.cos(0)
  var dig = Math.PI / 15 * 7
  for (var i = 0; i < 30; i++) {
    var x = Math.sin(i * dig)
    var y = Math.cos(i * dig)
    context.lineTo(dx + x * s, dy + y * s)
    console.log(x, y)
  }
  context.closePath()
  context.fill()
  context.stroke()
}
