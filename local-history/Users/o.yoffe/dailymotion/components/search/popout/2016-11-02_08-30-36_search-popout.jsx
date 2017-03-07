import React, { Component } from 'react'
import { Link } from 'react-router'
import algoliaSDK from 'components/search/algolia-sdk.jsx'

import Nav from 'components/utils/nav/nav.jsx'
import SearchAll from 'components/search/tabs/all/search-all.jsx'
import SearchChannels from 'components/search/tabs/channels/search-channels.jsx'
import SearchVideos from 'components/search/tabs/videos/search-videos.jsx'
import SearchPlaylists from 'components/search/tabs/playlists/search-playlists.jsx'
import InfiniteScroll from 'components/search/InfiniteScroll.jsx'
import NoResults from 'components/search/no-results/no-results.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'

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
      algoliaSDK.get(query, 'all', familyFilter).then(::this.onSearchDone)
    }
  }

  onSearchDone(res) {
    let resultData = {
      fetching: false,
      totalResults: 0,
    }
    let selectedTab = this.props.selectedTab

    if(res.isNextPageCall && selectedTab === 'all'){
      selectedTab = 'videos'
    }

    if (selectedTab === 'all' || !res.isNextPageCall) {
      for (let key in res) resultData.totalResults += res[key].paging.total_count
      if(resultData.totalResults){
        let { lives, playlists, users, videos } = res
        resultData = {
          videos,
          lives,
          playlists,
          users,
          currentPaging: videos.paging,
          ...resultData,
        }
      }
    } else {
      resultData.totalResults += res.paging.total_count
      if(resultData.totalResults){
        resultData.currentPaging = res.paging
        if (selectedTab === 'channels') {
          resultData.users = res
        } else {
          resultData[selectedTab] = res
        }

        if(res.isNextPageCall && res.paging.next && resultData.totalResults){
          resultData.hasMore = true
        }
      }
    }

    if(!resultData.totalResults || resultData.totalResults == 0){
      resultData.hasMore = false
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

    if(currentPaging && currentPaging.next){
      switch(this.props.selectedTab) {
        case 'all':
        case 'videos':
        currentData = videos.data
        break
        case 'channels':
        currentData = users.data
        break
        case 'playlists':
        currentData = playlists.data
        break
      }

      fetch(currentPaging.next).then(function(response) {
        return response.json()
      }).then(res => {
        res.isNextPageCall = true
        res.data = currentData.concat(res.data)
        this.onSearchDone(res)
      })
    }
  }

  render() {

    let { query, selectedTab } = this.props
    let { fetching, totalResults, videos, lives, playlists, users } = this.state

    if (!query || !query.length) return null


    let html = document.querySelector('html')
    if (!html.classList.contains('search-active')){
      html.classList.add('search-active')
    }

    if(totalResults === 0){
      return (
        <div className="a-search__popout">
          <div className="a-search__popout__content">
            <a href="" className="a-search__popout__close" onClick={::this.onClose} >
              <i className="icon-close" ></i>
            </a>
            <NoResults query={query}/>
          </div>
        </div>
      )
    }

    let dataNav = []

    dataNav.push({
      link: <Link to={`/search/${query}/all`} onClick={navigate.bind(this, query, `/search/${query}/all`)}>{this.trans.all && this.trans.all.toUpperCase()}</Link>,
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
    })

    if(videos && videos.data && videos.data.length){
      dataNav.push({
        link: <Link to={`/search/${query}/videos`} onClick={navigate.bind(this, query, `/search/${query}/videos`)}>{this.trans.videos && this.trans.videos.toUpperCase()}</Link>,
        content: (
          <SearchVideos
            videos={videos}
            fetching={fetching}
          />
        )
      })
    }

    if(users && users.data && users.data.length){
      dataNav.push({
        link: <Link to={`/search/${query}/channels`}  onClick={navigate.bind(this, query, `/search/${query}/channels`)}>{this.trans.channels && this.trans.channels.toUpperCase()}</Link>,
        content: (
          <SearchChannels
            users={users}
            fetching={fetching}
          />
        )
      })
    }
    if(playlists && playlists.data && playlists.data.length){
      dataNav.push({
        link: <Link to={`/search/${query}/playlists`} onClick={navigate.bind(this, query, `/search/${query}/playlists`)}>{this.trans.playlists && this.trans.playlists.toUpperCase()}</Link>,
        content: (
          <SearchPlaylists
            playlists={playlists}
            fetching={fetching}
          />
        )
      })
    }

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
        <InfiniteScroll
          isFetching={fetching}
          loadNextPage={this.loadNextPage.bind(this)}
          hasMore={this.state.hasMore}
          query={query}
          containerClassName="a-search__popout">
        <div className="a-search__popout__content">
          <a href="" className="a-search__popout__close" onClick={::this.onClose} >
            <i className="icon-close" ></i>
          </a>
          {false ? <p className="a-search__popout__results">{ totalResults }+ {this.trans.search_results} { query }</p> : null}
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
