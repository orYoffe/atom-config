import React, { Component } from 'react'

import GridList from 'components/lists/grid-list.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'

export default class SearchPlaylists extends Component {

  render() {
    let { playlists, fetching } = this.props

    if (!playlists) {
      return <div></div>
    }

    playlists = playlists.data.map((video,i) => {
      return <VideoItem key={i} isPlaylist={true} {...video} />
    })

    return (
      <div className="a-search__playlists">
        <GridList
          columns={3}
          margins={10}
          marginBottom={20}
          fetching={fetching}
          placeholder={<ItemPlaceholder />}
        >
          { playlists }
        </GridList>
      </div>
    )
  }

}
