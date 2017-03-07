import React, {Component} from 'react'

export default ({color, dx, dy, size, y, x}) => {
  return <circle cx={x} cy={y} r={size} fill={color}/>
}
