import React, { Component } from 'react'
import Badge from 'components/utils/badge/badge'

export default class SmallChannelList extends Component {

  render() {
    return (
      <div className="search-small-channelList">
        <Badge type='verified'></Badge>
      </div>
    )
  }
}
