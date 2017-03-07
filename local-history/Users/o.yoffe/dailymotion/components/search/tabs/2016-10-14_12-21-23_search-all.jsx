import React, { Component } from 'react'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'

export default class SearchAll extends Component {

  render() {
    const {
      videos,
      lives,
      playlists,
      users,
    } = this.props.results
    console.log('------SearchAll--------')
    console.log('------videos--------', videos)
    console.log('------lives--------', lives)
    console.log('------playlists--------', playlists)
    console.log('------users--------', users)

    return (
      <div className="search-all">
        <ChannelListSmall users={users} query={this.props.query}/>
      </div>
    )
  }

}
