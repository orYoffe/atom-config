import React, { Component, PropTypes } from 'react'

const Ball = ({ coords, radius, fill, img, txt }) => (
  <circle cx={ coords.x } cy={ coords.y } r={ radius} fill={ fill }>
    <g transform={"translate(`${coords.x}, ${coords.y}`)"}>
      <image xlinkHref={ img } height="30" width="30"/>
      <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill="red">${ txt }</text>
    </g>
  </circle>
);

Ball.propTypes = {
  coords: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  radius: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  txt: PropTypes.string.isRequired
}

export default Ball;
