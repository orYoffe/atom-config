import React, { Component } from 'react'
import { saveSearch } from 'components/search/form/search-recent.jsx'

export default class ChannelItem extends Component {
  trans = DM_ENV['search/lists/channels']

  render() {
    const {html_url, pictures, fullname, videos_total, followers, generated_content_type, cover_250_url} = this.props.user
    const thumbnail = cover_250_url || pictures.x480
    const thumbnailClassNames = cover_250_url ? "channel-item__thumbnail" : "channel-item__thumbnail doesnt-have-thumbnail"
    return (
      <a className="channel-item" href={html_url} onClick={saveSearch.bind(null, this.props.query)}>
        <div className={thumbnailClassNames}>
          <img src={thumbnail} />
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
          <p className="channel-item__videos" >{videos_total} {this.trans.videos}</p>
          <p className="channel-item__followers" >{followers} {this.trans.followers}</p>
        </div>
      </a>
    )
  }
}
