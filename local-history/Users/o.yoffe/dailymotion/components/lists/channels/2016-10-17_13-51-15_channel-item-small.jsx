import React, { Component } from 'react'
import TextClamp from 'components/utils/text-clamp/text-clamp'

export default class ChannelItemSmall extends Component {
  
  trans = DM_ENV['search/lists/channels']
  render() {
    const { user } = this.props
    return (
      <a href={'/'+user.username} className="channel-item-small" >
      
        <div className="channel-item-small__avatar">
          <img src={user.pictures.x80} />
          {
            user.generated_content_type === "verified-partner" 
            ? 
              <div className="channel-item-small__verifiedBadge ">
                <i className="icon-check"></i>
              </div>
            : 
              null
          }
        </div>
        <div className="channel-item-small__infos">
          <h3 className="channel-item-small__name" >
            <TextClamp clamp={2}>{ user.fullname }</TextClamp>
          </h3>
          <p className="channel-item-small__videos" >{user.videos_total} {this.trans.videos}</p>
          <p className="channel-item-small__followers" >{user.followers} {this.trans.followers}</p>
        </div>

      </a>
    )
  }
}
