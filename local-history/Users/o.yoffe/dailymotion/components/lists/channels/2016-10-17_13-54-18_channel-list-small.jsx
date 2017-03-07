import React, { Component } from 'react'
import ChannelItemSmall from 'components/lists/channels/channel-item-small'

export default class ChannelListSmall extends Component {

  trans = DM_ENV['search/lists/channels']
  render() {

    let { users } = this.props
    if(!users || !users.data) {
      return <div></div>
    }

    users = users.data.filter((user, i) => i<5)
    users = users.map((user, i) => {
      return <ChannelItemSmall key={i} user={user} />
    })

    return (
      <div className="channel-list-small">
        <a href={`/search/${this.props.query}/channels`} className="channel-list-small__title" >
          {this.trans.channels && this.trans.channels.toUpperCase()} <span>{'>'}</span>
        </a>
        <div className="channel-list-small__channels">
          { users }
        </div>
      </div>
    )
  }
}
