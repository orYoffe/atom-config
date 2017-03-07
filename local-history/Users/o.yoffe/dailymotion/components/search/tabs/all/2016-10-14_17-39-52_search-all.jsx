import React, { Component } from 'react'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'

export default class SearchAll extends Component {

  render() {
    const {
      videos,
      lives,
      playlists,
      users,
    } = this.props

    return (
      <div className="search-all">
        <ChannelListSmall users={users} query={this.props.query}/>
      </div>
    )
  }

}
