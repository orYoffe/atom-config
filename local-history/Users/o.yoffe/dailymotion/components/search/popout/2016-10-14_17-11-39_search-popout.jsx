import React, { Component } from 'react'
import { Link } from 'react-router'

import Nav from 'components/utils/nav/nav.jsx'
import SearchAll from 'components/search/tabs/search-all.jsx'
import SearchChannels from 'components/search/tabs/search-channels.jsx'
import SearchVideos from 'components/search/tabs/videos/search-videos.jsx'

export default class ASearchPopout extends Component {

  constructor(props) {
    super()
    this.state = {
      fetching: false,
      totalResults: false,
      videos: false,
      lives: false,
      playlists: false,
      users: false,
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
      switch (selectedTab) {
        case 'all':
          url = `https://search.api.dailymotion.com/v1/overview/?q=${query}&family_filter=${familyFilter}`
          break
        case 'videos':
          url = `https://search.api.dailymotion.com/v1/videos/?q=${query}&family_filter=${familyFilter}`
          break
        case 'channels':
          url = `https://search.api.dailymotion.com/v1/users/?q=${query}&family_filter=${familyFilter}`
          break
        case 'playlists':
          url = `https://search.api.dailymotion.com/v1/playlists/?q=${query}&family_filter=${familyFilter}`
          break
        default:
          url = `https://search.api.dailymotion.com/v1/overview/?q=${query}&family_filter=${familyFilter}`
      }
      return fetch(url).then(function(response) {
        return response.json()
      }).then(::this.onSearchDone)
    }
  }

  onSearchDone(res) {
    console.log('---------res-----------',res)
    let totalResults
    let data
    switch (this.props.selectedTab) {
      case 'all':
        let { lives, playlists, users, videos } = res
        totalResults = 0
        for (let key in res) totalResults += res[key].paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          videos,
          lives,
          playlists,
          users,
        })
        break
      case 'videos':
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          videos: res,
        })
        break
      case 'channels':
        data = res && res.data
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          users: data,
        })
        break
      case 'playlists':
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          playlists: res,
        })
        break
      default:
    }

  }

  render() {

    let { query, selectedTab } = this.props
    let { fetching, totalResults, videos, lives, playlists, users } = this.state

    if (!query || !query.length) return null

    let html = document.querySelector('html')
    if (!html.classList.contains('search-active'))
      html.classList.add('search-active')

    // TODO Localization
    let dataNav = [
      { link: <Link to={`/search/${query}/all`}>All</Link>, content: <SearchAll videos={videos} lives={lives} playlists={playlists} users={users} query={query}> </SearchAll> },
      { link: <Link to={`/search/${query}/videos`}>Videos</Link>, content: <SearchVideos videos={videos} /> },
      { link: <Link to={`/search/${query}/channels`}>Channels</Link>, content: <SearchChannels users={users}></SearchChannels> },
      { link: <Link to={`/search/${query}/playlists`}>Playlists</Link>, content: <div>playlists</div> },
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
        { fetching ? 'fetching...' :
          <div className="a-search__popout__content">
            <p className="a-search__popout__results">{ totalResults }+ results for { query }</p>
            <Nav
              data={dataNav}
              type="horizontal"
              activeTabIndex={activeTabIndex}
              centered={true}
            />
          </div>
        }
      </div>
    )
  }

}
