import React, {Component} from 'react'
import 'whatwg-fetch'
import leftpad from 'left-pad' // ;)

import User from './components/user';

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
          this.state.balls.map((user, index) => (
            <User
              key={ `user-${index}` }
              fill={ user.fill }
              coords={ { x: user.x, y: user.y } }
              img={ user.avatar }
              txt={ user.username }
              />
          ))
        }
      </svg>
    )
  }

  componentDidMount() {
    requestAnimationFrame(this.step)
    this.getMostPopularUsers()
      .then(({ list }) => this.setBallsData(list));
  }

  setBallsData(users) {
    this.setState({
      balls: users.map(::this.getBallDataFromUser)
    })
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

  /**
  * Returns ball data, built from user data.
  * @param {object} user - The user object.
  * @returns {object} Ball data where
  *   ball.size = user.fans_total/500
  *   ball.velocity = 10000/user.fans_total
  *   and all other props of ball should be the same as in "getRandomBallData" method (feel free to copy paste)
  */
  getBallDataFromUser = (user) => {
    let pos = this.props.fieldSize / 2
    let directions = [-1, 1];
    let dx = directions[Math.floor(Math.random()*directions.length)] * Math.random()
    let dy = directions[Math.floor(Math.random()*directions.length)] * Math.random()

    return {
      x: pos,
      y: pos,
      dx,
      dy,
      velocity: 10000 / user.fans_total,
      size: user.fans_total / 500,
      color: `#${leftpad(Math.floor(Math.random()*16777215).toString(16), 6, '0')}`,
      name: user.username,
      avatar: user.avatar_120_url
    }
  }

  getMostPopularUsers(limit = 100) {
    return fetch(`${MOST_POPULAR_USER_URL}${limit}`)
      .then((res) => res.json());
  }

  step = () => {
    const balls = this.state.balls.map(::this.moveBall);
    this.setState({ balls });
    requestAnimationFrame(this.step)
  }
}
