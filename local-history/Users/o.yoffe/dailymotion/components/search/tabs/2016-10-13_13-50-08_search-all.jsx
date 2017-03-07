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
    console.log('------videos--------', videos)
    console.log('------lives--------', lives)
    console.log('------playlists--------', playlists)
    console.log('------users--------', users)
    console.log('------this.propsusers--------', this.props.results)

    return (
      <div className="search-all">
        <SmallChannelList channels={users} />
      </div>
    )
  }

}
