import React, { Component } from 'react'
import ChannelList from 'components/lists/channels/channel-list.jsx'

export default class SearchChannels extends Component {

  render() {
    const {users} = this.props
    console.log('------SearchChannels--------')
    console.log('------users--------', users)

    return (
      <div className="search-channels">
        <ChannelList users={users}/>
      </div>
    )
  }

}
