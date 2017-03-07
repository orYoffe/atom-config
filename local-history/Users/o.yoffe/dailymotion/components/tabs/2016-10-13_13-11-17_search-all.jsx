import React, { Component } from 'react'
import ASearchForm from 'components/lists/small-channel-list.jsx'

export default class TabAll extends Component {

  render() {
    const {
      // videos,
      // lives,
      // playlists,
      users,
    } = this.props
    // console.log('------videos--------', videos)
    // console.log('------lives--------', lives)
    // console.log('------playlists--------', playlists)
    console.log('------users--------', users)

    return (
      <div className="search-all">
      </div>
    )
  }

}
