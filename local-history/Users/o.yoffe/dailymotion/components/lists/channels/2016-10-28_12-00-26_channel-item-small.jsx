import React, { Component } from 'react'
import TextClamp from 'components/utils/text-clamp/text-clamp'
import VerifiedBadge from 'components/lists/verified-badge.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'

export default class ChannelItemSmall extends Component {

  trans = DM_ENV['search/lists/channels']
  render() {
    const { user } = this.props
    return (
      <a href={'/'+user.username} onClick={navigate.bind(this, query, '/'+user.username)} className="channel-item-small" >

        <div className="channel-item-small__avatar">
          <img src={user.pictures.x80} />
          <VerifiedBadge verified={user.generated_content_type === "verified-partner"} />
        </div>
        <div className="channel-item-small__infos">
          <h3 className="channel-item-small__name ellipsis" >{ user.fullname }</h3>
          <p className="channel-item-small__videos" >{user.videos_total} {this.trans.videos}</p>
          <p className="channel-item-small__followers" >{user.followers} {this.trans.followers}</p>
        </div>

      </a>
    )
  }
}
