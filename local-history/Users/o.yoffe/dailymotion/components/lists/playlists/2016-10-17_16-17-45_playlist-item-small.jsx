import React, { Component } from 'react'
import TextClamp from 'components/utils/text-clamp/text-clamp'
import VerifiedBadge from 'components/lists/verified-badge.jsx'

export default class PlaylistItemSmall extends Component {
  trans = DM_ENV['search/lists/videos']
  
  render() {
    const { html_url, videos_total, thumbnails, user, title, name, owner, content_type } = this.props
    let thumbnail = thumbnails.x360

    console.log(name)

    return (
      <a href={html_url} className="playlist-item-small" >
        <div className="playlist-item-small__thumb">

          <div className="caption caption--videos-total">{ videos_total } {this.trans.videos}</div>
          <img src={thumbnail} />

          <div className="playlist-item-small__description">
            <h2><TextClamp clamp={2}>{ name }</TextClamp></h2>
            <p className="playlist-item-small__channel">
              by { owner.fullname }<VerifiedBadge verified={content_type === "verified-partner"} />
            </p>
          </div>

        </div>
      </a>
    )
  }
}
