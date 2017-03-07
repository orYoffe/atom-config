import React, { Component } from 'react'

export default ({ user }) => {
  return (
    <Link  to={user.url} >
      <div className="search-small-channelItem">
        <div className="search-smallChannelItem-avatar" style={'backgroundImage': user.pictures.x80}>
          {<div className"verified-badge"></div>}
        </div>
        <div className="search-smallChannelItem-name">{user.fullname}</div>
      </div>
    </Link>
  )
}
