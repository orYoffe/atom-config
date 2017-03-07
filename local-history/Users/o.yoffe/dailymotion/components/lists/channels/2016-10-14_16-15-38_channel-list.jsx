import React, { Component } from 'react'
import { Link } from 'react-router'
import ChannelItem from 'components/lists/channels/channel-item'

export default class ChannelListSmall extends Component {
// TODO translations
  render() {

    let { users } = this.props

    users = users.map((user, i) => {
      return <ChannelItem key={i} user={user} />
    })

    return (
      <div className="channel-list">
          { users }
      </div>
    )
  }
}
