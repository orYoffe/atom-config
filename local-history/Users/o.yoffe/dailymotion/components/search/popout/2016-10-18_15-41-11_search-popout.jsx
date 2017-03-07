import React, { Component } from 'react'
import { Link } from 'react-router'
import algoliaSDK from 'components/search/algolia-sdk.jsx'

import Nav from 'components/utils/nav/nav.jsx'
import SearchAll from 'components/search/tabs/all/search-all.jsx'
import SearchChannels from 'components/search/tabs/channels/search-channels.jsx'
import SearchVideos from 'components/search/tabs/videos/search-videos.jsx'
import SearchPlaylists from 'components/search/tabs/playlists/search-playlists.jsx'
import InfiniteScroll from 'components/search/InfiniteScroll.jsx'

export default class ASearchPopout extends Component {
  trans = DM_ENV['search/search']

  constructor(props) {
    super()
    this.state = {
      hasMore: true,
      fetching: false,
      totalResults: null,
      videos: null,
      lives: null,
      playlists: null,
      users: null,
      currentPaging: null,
    }
  }

  componentWillMount() {
    this.search(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query || nextProps.selectedTab !== this.props.selectedTab)
      this.search(nextProps)
  }


  search({ query, selectedTab, familyFilter }) {
    if (query && query.length) {
      let url
      this.setState({ fetching: true })
      algoliaSDK.get(query, selectedTab, familyFilter).then(::this.onSearchDone)
    }
  }

  onSearchDone(res) {
    console.log('---------res-----------',res)
    let resultData = {
      fetching: false,
      totalResults: 0,
    }
    if (this.props.selectedTab === 'all' && !res.isNextPageCall) {
      for (let key in res) resultData.totalResults += res[key].paging.total_count
      let { lives, playlists, users, videos } = res
      resultData = {
        videos,
        lives,
        playlists,
        users,
        currentPaging: videos.paging,
        ...resultData,
      }
    } else {
      resultData.totalResults += res.paging.total_count
      resultData.currentPaging = res.paging
      if (this.props.selectedTab === 'channels') {
        resultData.users = res
      } else {
        resultData[this.props.selectedTab] = res
      }
    }

    this.setState(resultData)
  }

  onClose(e) {
    e.preventDefault()
    this.props.close()
  }

  loadNextPage(){

    let currentData
    let { videos, playlists, users, currentPaging } = this.state


    this.setState({hasMore: false})

    if(currentPaging.next){
      switch(this.props.selectedTab) {
        case 'all':
        currentData = videos
        break
        case 'videos':
        currentData = videos
        break
        case 'channels':
        currentData = users
        break
        case 'playlists':
        currentData = playlists
        break
      }


      fetch(currentPaging.next).then(function(response) {
        return response.json()
      }).then(res => {
        res.isNextPageCall = true
        console.debug('--------start-------', res);
          res.data = currentData.concat(res.data)
        this.onSearchDone(res)
        console.debug('-------end--------', res);
        this.setState({hasMore: true})
      })
    }
  }

  render() {

    let { query, selectedTab } = this.props
    let { fetching, totalResults, videos, lives, playlists, users } = this.state

    if (!query || !query.length) return null

    let html = document.querySelector('html')
    if (!html.classList.contains('search-active'))
      html.classList.add('search-active')

    let dataNav = [
      {
        link: <Link to={`/search/${query}/all`}>{this.trans.all && this.trans.all.toUpperCase()}</Link>,
        content: (
          <SearchAll
            videos={videos}
            lives={lives}
            playlists={playlists}
            users={users}
            query={query}
            fetching={fetching}
          />
        )
      },
      {
        link: <Link to={`/search/${query}/videos`}>{this.trans.videos && this.trans.videos.toUpperCase()}</Link>,
        content: (
          <SearchVideos
            videos={videos}
            fetching={fetching}
          />
        )
      },
      {
        link: <Link to={`/search/${query}/channels`}>{this.trans.channels && this.trans.channels.toUpperCase()}</Link>,
        content: (
          <SearchChannels
            users={users}
            fetching={fetching}
          />
        )
      },
      {
        link: <Link to={`/search/${query}/playlists`}>{this.trans.playlists && this.trans.playlists.toUpperCase()}</Link>,
        content: (
          <SearchPlaylists
            playlists={playlists}
            fetching={fetching}
          />
        )
      },
    ]

    let activeTabIndex
    switch(selectedTab) {
      case 'all':
        activeTabIndex = 0
        break
      case 'videos':
        activeTabIndex = 1
        break
      case 'channels':
        activeTabIndex = 2
        break
      case 'playlists':
        activeTabIndex = 3
        break
    }

    return (
      <div className="a-search__popout">
        <InfiniteScroll loadNextPage={this.loadNextPage.bind(this)} hasMore={this.state.hasMore}>
        <div className="a-search__popout__content">
          <a href="" className="a-search__popout__close" onClick={::this.onClose} >
            <i className="icon-close" ></i>
          </a>
          <p className="a-search__popout__results">{ totalResults }+ {this.trans.search_results} { query }</p>
          <Nav
            data={dataNav}
            type="horizontal"
            activeTabIndex={activeTabIndex}
            centered={true}
          />
        </div>
        </InfiniteScroll>
      </div>
    )
  }

}