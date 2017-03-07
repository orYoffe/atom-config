import React, { Component } from 'react'

import GridList from 'components/lists/grid-list.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'
import Trans from 'components/utils/trans/trans'

const url = 'https://api.dailymotion.com/videos?fields=id,title,url,views_total,created_time,owner.screenname,owner.url,thumbnail_360_url,duration&list=what-to-watch'

export default class NoResults extends Component {
  trans = DM_ENV['search/search']

  state = {
    videos: [],
    isFetching: true,
  }

  componentWillMount() {
    fetch(url).then(function(response) {
      return response.json()
    }).then(res => {
      console.log('---------res---------', no_results);
      if(res.list && res.length){
        this.setState({
          videos: res.list.slice(0,8), // show only 9 out of 10
          isFetching: false,
        })
      }else {
        this.setState({isFetching: false})
      }
    })
  }

  render() {
    let { videos, isFetching } = this.state

    if (videos) {
      videos = videos.map((video,i) => {
        return <VideoItem key={i} {...video} />
      })
    }

    return (
      <div className="a-search__videos">
        <Trans context={this.trans} search_label={this.props.query}>No results found for %(search_label)</Trans>
        <GridList
          columns={3}
          margins={10}
          marginBottom={20}
          fetching={isFetching}
          placeholder={<ItemPlaceholder type="video" />}
        >
          { videos }
        </GridList>
      </div>
    )
  }

}
