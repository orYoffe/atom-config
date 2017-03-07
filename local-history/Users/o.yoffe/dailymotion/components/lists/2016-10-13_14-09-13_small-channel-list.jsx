import React, { Component } from 'react'
import { Link } from 'react-router'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    return (
      <div className="search-small-channelList">
        {this.props.users.map((user, i) => {
          return <SmallChannelItem key={i} users={user} />
        })}
      </div>
    )
  }
}
