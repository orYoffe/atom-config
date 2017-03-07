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
  return (<g transform={`translate(${item.x}, ${item.y})`} key={key}>
    <image xlinkHref={item.image} height={item.size}  width={item.size} />
    <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill={item.color}>{item.name}</text>
  </g>)
}
