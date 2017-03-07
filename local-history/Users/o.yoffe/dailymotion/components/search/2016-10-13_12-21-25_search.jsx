import React, { Component } from 'react'
import ASearchForm from 'components/search/form/search-form.jsx'
import ASearchPopout from 'components/search/popout/search-popout.jsx'

export default class ASearch extends Component {

  render() {

    let { query, tab } = this.props.params

    if (!tab) tab = 'all'
    query = query && query.trim()

    console.log('Render search.jsx', query, tab)

    return (
      <div className="a-search">
        <ASearchForm query={query} />
        <ASearchPopout query={query} selectedTab={tab} />
      </div>
    )
  }

}
