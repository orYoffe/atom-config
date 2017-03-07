import React, { Component } from 'react'
import { Link } from 'react-router'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {
// TODO translations
  render() {
    let users = this.props.users.data.filter((user, i) => i<5)
    return (
      <div className="search-small-channelList">
        <Link className="search-smallChannelList-header" to={`/search/${this.props.query}/channels`}>
          CHANNELS <span className="search-smallChannelList-headerIcon">&#62;</span>
          </Link>
        {users.map((user, i) => {
          return <SmallChannelItem key={i} user={user} />
        })}
      </div>
    )
  }
}
