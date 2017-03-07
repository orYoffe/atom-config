import React, { Component } from 'react'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'

export default class SearchChannels extends Component {

  render() {
    const {
      videos,
      lives,
      playlists,
      users,
    } = this.props.results
    console.log('------SearchChannels--------')
    console.log('------videos--------', videos)
    console.log('------lives--------', lives)
    console.log('------playlists--------', playlists)
    console.log('------users--------', users)

    return (
      <div className="search-channels">
      </div>
    )
  }

}
