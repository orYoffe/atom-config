import React, {Component} from 'react'
import 'whatwg-fetch'
import leftpad from 'left-pad' // ;)
import Circle from './Circle.js'

export default class Field extends Component {
  static defaultProps = {
    fieldSize: 700,
    nbBalls: 100
  }

  state = {
    balls: []
  }

  render() {
    return (
      <svg width={this.props.fieldSize} height={this.props.fieldSize} style={{backgroundColor: '#222'}}>
        {this.state.balls.map((b, index) => <Circle {...b} key={`ìtem-#{id}`}  />)}
      </svg>
    )
  }

  componentDidMount() {
    requestAnimationFrame(this.step)
    this.setBallsData()
  }

  setBallsData() {
    this.setState({
      balls: Array(this.props.nbBalls).fill(null).map(::this.getRandomBallData)
    })
  }

  getRandomBallData = () => {
    let pos = this.props.fieldSize / 2
    let directions = [-1, 1];
    let dx = directions[Math.floor(Math.random()*directions.length)] * Math.random()
    let dy = directions[Math.floor(Math.random()*directions.length)] * Math.random()

    return {
      x: pos,
      y: pos,
      dx,
      dy,
      velocity: Math.random() * 3,
      size: Math.random() * 50,
      color: `#${leftpad(Math.floor(Math.random()*16777215).toString(16), 6, '0')}`
    }
  }

  // You don't need to touch this method.
  moveBall = (ball) => {
    const newBall = Object.assign({}, ball)

    if (ball.x > this.props.fieldSize - ball.size/2 || ball.x < ball.size / 2) {
      newBall.dx = ball.dx * -1;
    }
    if (ball.y > this.props.fieldSize - ball.size/2 || ball.y < ball.size / 2) {
      newBall.dy = ball.dy * -1;
    }
    newBall.x += newBall.dx * ball.velocity
    newBall.y += newBall.dy  * ball.velocity

    return newBall
  }


  step = () => {
    requestAnimationFrame(this.step)
  }
}
