import 'whatwg-fetch'
import React, { Component } from 'react'
import SearchForm from 'components/search/form/search-form.jsx'
import SearchPopout from 'components/search/popout/search-popout.jsx'
import history from 'js/lib/dm/history.es6'

export default class Search extends Component {

  constructor() {
    super()
    this.referer = null
  }

  componentWillMount() {
    this.familyFilter = window.DM_Context.reader_has_family_filter

    this.referer = '/' // if someone directly goes to a search url, then he is on home
    if (!/search/.test(window.location.pathname))
      this.referer = window.location.pathname
  }

  close() {
    history.pushState(null, this.referer)
    let html = document.querySelector('html')
    if (html.classList.contains('search-active')){
      html.classList.remove('search-active')
    }
  }

  render() {

    let { referer, params } = this.props
    let { query, tab } = params

    if (!tab) tab = 'all'
    query = query && query.trim()

    return (
      <div className="a-search">
        <SearchForm
          selectedTab={tab}
          query={query}
          close={::this.close}
        />
        <SearchPopout
          query={query}
          selectedTab={tab}
          familyFilter={this.familyFilter}
          close={::this.close}
        />
      </div>
    )
  }

}