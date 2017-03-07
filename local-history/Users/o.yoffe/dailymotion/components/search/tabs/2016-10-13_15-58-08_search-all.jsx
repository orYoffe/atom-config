import React, { Component } from 'react'
import SmallChannelList from 'components/lists/small-channel-list.jsx'

export default class TabAll extends Component {

  render() {
    const {
      videos,
      lives,
      playlists,
      users,
    } = this.props.results
    console.log('------TabAll--------')
    console.log('------videos--------', videos)
    console.log('------lives--------', lives)
    console.log('------playlists--------', playlists)
    console.log('------users--------', users)

    return (
      <div className="search-all">
        <SmallChannelList users={users} query={this.props.query}/>
      </div>
    )
  }

}
