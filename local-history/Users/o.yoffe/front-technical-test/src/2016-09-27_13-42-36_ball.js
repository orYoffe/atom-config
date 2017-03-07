import React, {Component} from 'react'

// export default (item) => {
//   console.log(item)
//   // return <circle cx={dx} cy={dy} r={size} fill={color}/>
//   return <div></div>
}
export default ({color, dx, dy, size, y, x}) => {
  console.log(color, dx, dy, size, y, x)
  return <circle cx={dx} cy={dy} r={50} fill={color}/>
}
