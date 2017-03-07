import React, { Component } from 'react'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'

export default class SearchChannels extends Component {

  render() {
    const {users} = this.props
    console.log('------SearchChannels--------')
    console.log('------users--------', users)

    return (
      <div className="search-channels">
      </div>
    )
  }

}
