import React, { Component } from 'react'

import GridList from 'components/lists/grid-list.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'

export default class SearchVideos extends Component {

  render() {
    let { videos } = this.props

    if(!videos){
      return <div></div>
    }

    console.log('Render SearchVideos', this.props)

    videos = videos.data.map((video,i) => {
      return <VideoItem {...video} />
    })

    return (
      <div className="a-search__videos">
        <GridList 
          columns={3} 
          margins={10} 
          marginBottom={20}
        >
          { videos }
        </GridList>
      </div>
    )
  }

}
