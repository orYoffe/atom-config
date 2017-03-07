import React, { Component } from 'react'
import TextClamp from 'components/utils/text-clamp/text-clamp'
import VerifiedBadge from 'components/lists/verified-badge.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'
import Trans from 'components/utils/trans/trans'

export default class PlaylistItemSmall extends Component {
  trans = DM_ENV['search/lists/videos']

  render() {
    const { html_url, videos_total, thumbnails, user, title, name, owner, content_type, query } = this.props
    let thumbnail = thumbnails.x360

    return (
      <a href={html_url} className="playlist-item-small"  onClick={navigate.bind(this, query, html_url)} key={html_url}>
        <div className="playlist-item-small__thumb">

          <div className="caption caption--videos-total">videos_total <Trans context={this.trans} isPlural={videos_total !== 1}>videos</Trans></div>
          <img src={thumbnail} />

          <div className="playlist-item-small__description">
            <h2><TextClamp clamp={2}>{ name }</TextClamp></h2>
            <p className="playlist-item-small__channel">
              {this.trans.by} { owner.fullname }<VerifiedBadge verified={content_type === "verified-partner"} />
            </p>
          </div>

          <div className="play"></div>
        </div>
      </a>
    )
  }
}
