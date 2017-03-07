import React, { Component, PropTypes } from 'react'

const User = ({ coords, fill, img, txt }) => (
  <g transform={ `translate(${coords.x}, ${coords.y})` }>
    <image xlinkHref={ img } height="30" width="30"/>
    <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill={ fill }>{ txt }</text>
  </g>
);

User.propTypes = {
  coords: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  fill: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  txt: PropTypes.string.isRequired
}

export default User;
