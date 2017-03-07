import React, { Component } from 'react'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    let users = [
      this.props.users.data[0],
      this.props.users.data[1],
      this.props.users.data[2],
      this.props.users.data[3],
      this.props.users.data[4],
    ]

    return (
      <div className="search-small-channelList">
        {users.map((user, i) => {
          return <SmallChannelItem user={user} />
        })}
      </div>
    )
  }
}
