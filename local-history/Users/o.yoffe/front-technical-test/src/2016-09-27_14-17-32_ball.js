import React, {Component} from 'react'

// export default (item) => {
//   console.log(item)
//   // return <circle cx={dx} cy={dy} r={size} fill={color}/>
//   return <div></div>
// }
// export default ({item, key}) => {
//   return <circle cx={item.x} cy={item.y} r={item.size} fill={item.color} key={key}/>
// }
export default ({item, key}) => {
  return (<g transform={`translate(${item.x}, ${item.y})`}>
    <image xlinkHref={item.image} height="30" width="30"/>
    <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill="red">{item.name}</text>
  </g>)
}
