import React, { Component } from 'react'

import GridList from 'components/lists/grid-list.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'

export default class SearchVideos extends Component {

  render() {
    let { videos, fetching, query } = this.props

    if (videos) {
      videos = videos.data.map((video,i) => {
        return <VideoItem query={query} key={i} {...video} />
      })
    }

    return (
      <div className="a-search__videos">
        <GridList
          columns={3}
          margins={10}
          marginBottom={35}
          fetching={fetching}
          placeholder={<ItemPlaceholder type="video" />}
        >
          { videos }
        </GridList>
      </div>
    )
  }

}
