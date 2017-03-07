import React, { Component } from 'react'

import GridList from 'components/lists/grid-list.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'
import Trans from 'components/utils/trans/trans'

const url = 'https://api.dailymotion.com/videos?fields=id,title,url,views_total,created_time,owner.screenname,owner.url,thumbnail_360_url,duration&list=what-to-watch'

const data = []
const getData = cb => (
  fetch(url).then(function(response) {
    return response.json()
  }).then(cb)
)

export default class NoResults extends Component {
  trans = DM_ENV['search/search']

  state = {
    videos: [],
    isFetching: true,
  }

  handleData = (res) => {
    if(res.list && res.list.length){
      this.setState({
        videos: res.list.slice(0,9), // show only 9 out of 10
        isFetching: false,
      })
    }else {
      this.setState({isFetching: false})
    }
  }

  componentDidMount() {
    if(data.length){
        this.handleData(handleData)
    }else {
      getData(::this.handleData)
    }
  }

  render() {
    let { videos, isFetching } = this.state
    if (videos) {
      videos = videos.map((video,i) => {
        return <VideoItem key={i} {...video} />
      })
    }

    return (
      <div className="a-search__no-results">
        <div className="a-search__no-results__header">
          <p className="a-search__no-results__main-header">{this.trans.no_results.substr(this.trans.no_results.indexOf('%search_label')) + ' ' + this.props.query}</p>
          <Trans  context={this.trans} search_label={this.props.query}>No results found for %(search_label)s</Trans>
          <p>{this.trans.sorry_no_results} {this.trans.try_no_results}</p>
        </div>
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
