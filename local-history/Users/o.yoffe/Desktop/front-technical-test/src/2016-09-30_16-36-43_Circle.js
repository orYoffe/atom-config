import React, {Component} from 'react'

const Ball = (props) => (
  <g transform={`translate(${props.x}, ${props.y})`}>
    <image xlinkHref={props.url} height={props.size} width={props.size}/>
    <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill={props.color}>{props.name}</text>
  </g>
)

export default Ball
