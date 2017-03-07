import React, { Component } from 'react'
import { Link } from 'react-router'

export default class SmallChannelItem extends Component {

  render() {
    const user = this.props.user
    return (
      <Link  to={user.html_url} >
        <div className="search-small-channelItem">
          <div className="search-smallChannelItem-avatar">
            <img src={user.pictures.x80} />
            {user.generated_content_type === "verified-partner" ? <div className="search-smallChannelItem-verifiedBadge "></div> : ''}
          </div>
          <div className="search-smallChannelItem-name">{user.fullname}</div>
          <div className="search-smallChannelItem-name">videos {user.videos_total}</div>
          <div className="search-smallChannelItem-name">followers {user.followers}</div>
        </div>
      </Link>
    )
  }
}
