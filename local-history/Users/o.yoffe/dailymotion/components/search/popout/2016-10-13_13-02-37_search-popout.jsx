import React, { Component } from 'react'
import { Link } from 'react-router'
import Nav from 'components/utils/nav/nav.jsx'
import TabAll from 'components/search/tabs/search-all.jsx'

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
    if (nextProps.query !== this.props.query)
      this.search(nextProps)
  }

  search({ query }) {
    if (query && query.length) {
      this.setState({ fetching: true })
      let url = `https://search.api.dailymotion.com/v1/overview/?q=${query}&family_filter=false` // TODO get the family filter
      return fetch(url).then(function(response) { // TODO Add the polyfill for fetch
        return response.json()
      }).then(::this.onSearchDone)
    }
  }

  onSearchDone(res) {
    let { lives, playlists, users, videos } = res
    let totalResults = 0
    for (let key in res) totalResults += res[key].paging.total_count
    this.setState({
      fetching: false,
      totalResults,
      videos,
      lives,
      playlists,
      users,
    })
  }

  render() {

    let { query, selectedTab } = this.props
    let { fetching, totalResults } = this.state

    if (!query || !query.length) return null

    let html = document.querySelector('html')
    if (!html.classList.contains('search-active'))
      html.classList.add('search-active')

    // TODO Localization
    let dataNav = [
      { link: <Link to={`/search/${query}/all`}>All</Link>, content: <div>all</div> },
      { link: <Link to={`/search/${query}/videos`}>Videos</Link>, content: <div>videos</div> },
      { link: <Link to={`/search/${query}/channels`}>Channels</Link>, content: <div>channels</div> },
      { link: <Link to={`/search/${query}/playlists`}>Playlists</Link>, content: <div>playlists</div> },
    ]

    let activeTabIndex
    let TabContent
    switch(selectedTab) {
      case 'all':
        activeTabIndex = 0
        TabContent = TabAll
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
          <TabContent />
          </div>
        }
      </div>
    )
  }

}
