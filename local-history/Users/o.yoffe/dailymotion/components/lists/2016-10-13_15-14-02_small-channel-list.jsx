import React, { Component } from 'react'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    let users = this.props.users.data.filter((user, i) => i<5)
    return (
      <div className="search-small-channelList">
        {users.map((user, i) => {
          return <SmallChannelItem key={i} user={user} />
        })}
      </div>
    )
  }
}
