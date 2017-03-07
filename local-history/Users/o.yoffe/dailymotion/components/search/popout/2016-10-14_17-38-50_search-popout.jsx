import React, { Component } from 'react'
import { Link } from 'react-router'
import algoliaSDK from 'components/search/algolia-sdk.jsx'
import parseSearchResults from 'components/search/parseSearchResults.jsx'

import Nav from 'components/utils/nav/nav.jsx'
import SearchAll from 'components/search/tabs/all/search-all.jsx'
import SearchChannels from 'components/search/tabs/channels/search-channels.jsx'
import SearchVideos from 'components/search/tabs/videos/search-videos.jsx'

export default class ASearchPopout extends Component {

  constructor(props) {
    super()
    this.state = {
      fetching: false,
      totalResults: null,
      videos: null,
      lives: null,
      playlists: null,
      users: null,
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
    const newState = parseSearchResults(res, this.props.selectedTab)
    this.setState(newState)
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
      { link: <Link to={`/search/${query}/channels`}>Channels</Link>, content: <SearchChannels users={users} /> },
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
