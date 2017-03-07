import React, { Component } from 'react'
import store from 'store'

export default class SearchRecent extends Component {
  trans = DM_ENV['search/search']

  constructor() {
    super()
<<<<<<< HEAD
    const MAX_NB_ITEMS = 5
    let searches = store.get('a_search_history') || []
    searches = searches.slice(-MAX_NB_ITEMS)
    this.state = {
      searches
=======
    this.MAX_NB_ITEMS = 5
    this.state = {
      searches: this.getSearches()
>>>>>>> 845a644a771b81f67b40c2fb9fe330c03f0cedca
    }
  }

  getSearches() {
    let searches = store.get('a_search_history') || []
    return searches.slice(-this.MAX_NB_ITEMS)
  }

  onClear(e) {
    e.preventDefault()
    store.set('a_search_history', [])
    this.setState({ searches: this.getSearches() })
  }

  onSelect(search, e) {
    e.preventDefault()
    this.props.submit(search)
  }

  render() {

    let { open } = this.props
    let { searches } = this.state

    if (!searches.length) return null

    searches = searches.map((search,i) => {
      return <a href="" className="a-search__form__recent__i" onClick={this.onSelect.bind(this, search)} >{ search }</a>
    })

    let style = {}
    if (open) style.display = 'flex'
    
    return (
      <div className="a-search__form__recent" style={style} >
        <h2>{this.trans.recent_searches}</h2>
        <a href="" className="a-search__form__recent__clear" onClick={::this.onClear} >{this.trans.clear_all && this.trans.clear_all.toUpperCase()}</a>
        <div>{ searches }</div>
      </div>
    )
  }

}
