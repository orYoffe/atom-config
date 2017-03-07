import React, {Component} from 'react'
import 'whatwg-fetch'
import leftpad from 'left-pad' // ;)

import Ball from './components/ball';

const MOST_POPULAR_USER_URL = 'https://api.dailymotion.com/users?fields=username,avatar_120_url,fans_total&sort=popular&limit='

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
        {
          this.state.balls.map((ball, index) => (
            <Ball key={ `ball-${index}` } coords={ { x: ball.x, y: ball.y } } radius={ ball.size } fill={ ball.color } />
          ))
        }
      </svg>
    )
  }

  componentDidMount() {
    requestAnimationFrame(this.step)
    this.setBallsData()

    this.getMostPopularUsers().then(::console.log)
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

  getMostPopularUsers(limit = 100) {
    return fetch(`${MOST_POPULAR_USER_URL}${limit}`)
      .then((res) => res.body);
  }

  step = () => {
    const balls = this.state.balls.map(::this.moveBall);
    this.setState({ balls });
    requestAnimationFrame(this.step)
  }
}
