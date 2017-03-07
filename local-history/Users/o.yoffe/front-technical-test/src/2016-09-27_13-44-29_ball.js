import React, {Component} from 'react'

// export default (item) => {
//   console.log(item)
//   // return <circle cx={dx} cy={dy} r={size} fill={color}/>
//   return <div></div>
// }
export default ({color, dx, dy, size, y, x}, key) => {
  return <circle cx={x} cy={y} r={50} fill={color} key={key}/>
}
