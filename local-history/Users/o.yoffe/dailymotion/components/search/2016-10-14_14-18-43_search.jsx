import 'whatwg-fetch'
import React, { Component } from 'react'
import SearchForm from 'components/search/form/search-form.jsx'
import SearchPopout from 'components/search/popout/search-popout.jsx'

export default class ASearch extends Component {

  componentWillMount() {
    this.familyFilter = window.DM_Context.reader_has_family_filter
  }

  render() {

    let { query, tab } = this.props.params

    if (!tab) tab = 'all'
    query = query && query.trim()

    console.log('Render search.jsx', query, tab)

    return (
      <div className="a-search">
        <SearchForm query={query} />
        <SearchPopout query={query} selectedTab={tab} familyFilter={this.familyFilter} />
      </div>
    )
  }

}
