import React, { Component } from 'react'
import { Link } from 'react-router'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    return (
      <div className="search-small-channelList">
        {Object.keys(this.props.users).map((key, i) => {
          if(i>4)return ''
          return <SmallChannelItem key={i} users={this.props.users[key]} />
        })}
      </div>
    )
  }
}
