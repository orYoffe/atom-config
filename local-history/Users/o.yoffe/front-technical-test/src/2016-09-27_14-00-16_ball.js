import React, {Component} from 'react'

// export default (item) => {
//   console.log(item)
//   // return <circle cx={dx} cy={dy} r={size} fill={color}/>
//   return <div></div>
// }
export default ({item, key}) => {
  return <circle cx={item.x} cy={item.y} r={item.size} fill={item.color} key={key}/>
}
