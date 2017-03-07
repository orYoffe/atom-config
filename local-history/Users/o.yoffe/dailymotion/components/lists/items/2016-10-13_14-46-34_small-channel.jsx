import React, { Component } from 'react'
import { Link } from 'react-router'

export default ({ user }) => {
  return (
    <Link  to={user.html_url} >
      <div className="search-small-channelItem">
        <div className="search-smallChannelItem-avatar" style={{'backgroundImage': user.pictures.x80}}>
          {user.generated_content_type === "verified-partner" ? <div className="search-smallChannelItem-verifiedBadge"></div> : ''}
        </div>
        <div className="search-smallChannelItem-name">{user.fullname}</div>
        <div className="search-smallChannelItem-name">{user.videos_total}</div>
        <div className="search-smallChannelItem-name">{user.followers}</div>
      </div>
    </Link>
  )
}
