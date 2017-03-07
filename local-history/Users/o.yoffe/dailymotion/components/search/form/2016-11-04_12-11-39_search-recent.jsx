import React, { Component } from 'react'
import store from 'store'

const MAX_NB_ITEMS = 5
const SEARCH_HISTORY_KEY = 'a_search_history'

export function saveSearch (search) {
  if(!(search && typeof search === 'string' && search.trim().length > 0)){
    return
  }

  let searches = store.get(SEARCH_HISTORY_KEY) || []
  searches = searches.slice(-(MAX_NB_ITEMS +1))

  if(searches.indexOf(search) === -1){
    searches.push(search)
    store.set(SEARCH_HISTORY_KEY, searches)
  }
}
export function getSearches () {
  let searches = store.get(SEARCH_HISTORY_KEY) || []
  return searches.slice(-MAX_NB_ITEMS).reverse() // most recent first
}
export function clearSearches () {
  store.set(SEARCH_HISTORY_KEY, [])
}

export default class SearchRecent extends Component {
  trans = DM_ENV['search/search']

  constructor() {
    super()
    this.state = {
      searches: getSearches()
    }
  }

  onClear(e) {
    e.preventDefault()
    clearSearches()
    this.setState({ searches: getSearches() })
  }

  componentDidMount() {
    this.setState({ searches: getSearches() })
  }

  render() {

    let { open, focusedItem, onSelect } = this.props
    let { searches } = this.state

    if (!searches.length) return null

    searches = searches.map((search,i) => {
      return <a href="" key={i} className={"a-search__form__recent__i" + (i === focusedItem ? ' a-search__form__recent__active' : '')} onClick={onSelect.bind(this, search)} >{ search }</a>
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