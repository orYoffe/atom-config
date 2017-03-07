import React, { Component } from 'react'
import { Link } from 'react-router'
import FollowBtn from 'components/channel/follow-button/follow-button'

export default class ChannelItem extends Component {
// TODO translations
// TODO follow button

  render() {
    const user = this.props.user
    const UserLoggedInName = window.DM_Context.reader_login
    return (
      <a className="channel-item" href={user.html_url}>
        <div className="channel-item__thumbnail">
          <img src={user.pictures.x120}  className="channel-item__cover"/>
          <div className="channel-item__avatar">
            <img src={user.pictures.x80} />
            {
              user.generated_content_type === "verified-partner"
              ?
                <div className="channel-item__verifiedBadge ">
                  <i className="icon-check"></i>
                </div>
              :
                null
            }
          </div>
        </div>
        
        <div className="channel-item__infos">
          <h3 className="channel-item__name" >{user.fullname}</h3>
          <p className="channel-item__videos" >{user.videos_total} videos</p>
          <p className="channel-item__followers" >{user.followers} followers</p>
        </div>
    </a>
    )
  }
}
