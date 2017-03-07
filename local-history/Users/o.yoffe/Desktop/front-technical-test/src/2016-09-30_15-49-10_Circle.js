import React, {Component} from 'react'


export default class Ball extends Component {
  render () {
    const {x, y, size, color} = this.props
    return <circle cx={x} cy={y} r={size} fill={color} />
  }
}
