import React, { Component } from 'react'
import FollowBtn from 'components/channel/follow-button/follow-button'

export default class ChannelItem extends Component {
// TODO translations

  render() {
    const {html_url, pictures, fullname, videos_total, followers, generated_content_type, cover_250_url} = this.props.user
    const thumbnail = cover_250_url || pictures.x480
    const thumbnailClassNames = cover_250_url ? "channel-item__thumbnail" : "channel-item__thumbnail doesnt-have-thumbnail"
    return (
      <a className="channel-item" href={html_url}>
        <div className={thumbnailClassNames}>
          <img src={pictures.x480} />
        </div>

        <div className="channel-item__infos">
          <div className="channel-item__avatar">
            <img src={pictures.x80} />
            {
              generated_content_type === "verified-partner"
              ?
              <div className="channel-item__verifiedBadge ">
                <i className="icon-check"></i>
              </div>
              :
              null
            }
          </div>
          <h3 className="channel-item__name" >{fullname}</h3>
          <p className="channel-item__videos" >{videos_total} videos</p>
          <p className="channel-item__followers" >{followers} followers</p>
        </div>
    </a>
    )
  }
}
