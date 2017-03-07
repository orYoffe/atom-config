import React, { Component } from 'react'
import SmallChannelItem from 'components/lists/items/small-channel'

export default class SmallChannelList extends Component {

  render() {
    return (
      <div className="search-small-channelList">
        <SmallChannelItem />
      </div>
    )
  }
}
