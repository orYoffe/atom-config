import React, {Component} from 'react'

export default ({color, dx, dy, size, y, x}) => {
  return <circle cx={dx} cy={dy} r={size} fill={color}/>
}
