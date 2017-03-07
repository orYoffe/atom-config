import React, { Component, PropTypes } from 'react'

const User = ({ coords, radius, fill, img, txt }) => (
  <g transform={ `translate(${coords.x}, ${coords.y})` }>
    <image xlinkHref={ img } height="30" width="30"/>
    <text fontFamily="sans-serif" fontSize="20px" dx="-10px" fill="red">{ txt }</text>
  </g>
);

User.propTypes = {
  img: PropTypes.string.isRequired,
  txt: PropTypes.string.isRequired
}

export default User;
