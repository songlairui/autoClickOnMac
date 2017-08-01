let file = '../origin/BACK.ok.jpg'

const fs = require('fs')

const jpeg = require('jpeg-js')

let imgRaw = jpeg.decode(fs.readFileSync(file))

let length = imgRaw.width * imgRaw.height

let i = 0
let histogram = {}
while( i < length){
  let idx = i * 4
  let value = Math.round([idx,idx+1,idx+2].map(_ => imgRaw.data[_]).reduce((sum,v)=>sum + v) / 3)
  //  let value = imgRaw.data[i * 4]
  if(histogram[value]){
    histogram[value] ++
  } else {
    histogram[value] = 1
  }

  i++
}

// console.info(histogram)
// console.info(typeof Object.keys(histogram)[0])

// for(let j = 0; j<255;j++){
//   let l = histogram[j] || 0
//   console.info('-'.repeat(Math.round(l/3)))
// }

let max = Math.max(...(Object.keys(histogram).map(_=>histogram[_]))) / 2

for (let k = max ; k >=0;k--){
  let line = ''
  for(let _k = 0;_k<255;_k+=2){
    line += (histogram[_k]>=2*k) ?'.':' '
  }
  console.info(line)
}