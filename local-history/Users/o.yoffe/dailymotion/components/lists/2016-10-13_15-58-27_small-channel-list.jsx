import React, { Component } from 'react'
import { Link } from 'react-router'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    let users = this.props.users.data.filter((user, i) => i<5)
    return (
      <div className="search-small-channelList">
        <Link to={`/search/${this.props.query}/channels`}>CHANNELS <i className="icon-chevron-right"></i></Link>
        {users.map((user, i) => {
          return <SmallChannelItem key={i} user={user} />
        })}
      </div>
    )
  }
}
