import React, { Component } from 'react'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    const users = this.props.users.data.find((user, i) => {
      if(i>4)return false
      return true
    })
    console.log(users)
    return (
      <div className="search-small-channelList">
        {users.map((user, i) => {
          return <SmallChannelItem key={i} user={user} />
        })}
      </div>
    )
  }
}
