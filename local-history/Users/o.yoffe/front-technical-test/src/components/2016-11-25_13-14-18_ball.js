import React, { Component, PropTypes } from 'react'

const Ball = ({ coords, radius, fill }) => (
  <circle cx={ coords.x } cy={ coords.y } r={ radius} fill={ fill } />
);

Ball.propTypes = {
  coords: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  radius: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired
}

export default Ball;
