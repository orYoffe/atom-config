import React, { Component } from 'react'
import { navigate } from 'components/search/utils/navigate.jsx'
// import defaultAvatar from './default_avatar.png'

export default class ChannelItem extends Component {
  trans = DM_ENV['search/lists/channels']

  render() {
    const {html_url, pictures, fullname, videos_total, followers, generated_content_type, cover_250_url} = this.props.user

// TODO remove empty string from avatar and thumbnail
    const avatar = (pictures && pictures.x480) || ''
    const thumbnail = cover_250_url || (pictures && pictures.x480) || ''
    const thumbnailClassNames = cover_250_url ? "channel-item__thumbnail" : "channel-item__thumbnail doesnt-have-thumbnail"

    return (
      <a className="channel-item" href={html_url} onClick={navigate.bind(this, this.props.query, html_url)}>
        <div className={thumbnailClassNames}>
          <img src={thumbnail} />
        </div>

        <div className="channel-item__infos">
          <div className="channel-item__avatar">
            <img src={avatar} />
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
          <p className="channel-item__videos" >{videos_total} {this.trans.videos}</p>
          <p className="channel-item__followers" >{followers} {this.trans.followers}</p>
        </div>
      </a>
    )
  }
}