import React, { Component } from 'react'
import { Link } from 'react-router'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    const users = this.props.users.data.find((user, i) => {
      if(i>4)return false
      return true
    })
    return (
      <div className="search-small-channelList">
        {users.map((user, i) => {
          return <Link key={i} to={user.url} ><SmallChannelItem user={user} /></Link>
        })}
      </div>
    )
  }
}
